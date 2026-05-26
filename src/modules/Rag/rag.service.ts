import { Response } from "express";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { randomUUID } from "crypto";
import { createHash } from "crypto";
import { getRedisClient } from "../../lib/redis";

const EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5";
const CHAT_MODEL = process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CACHE_PREFIX = process.env.RAG_CACHE_KEY_PREFIX ?? "rag";
const CACHE_TTL_SECONDS = Number(process.env.REDIS_CACHE_TTL_SECONDS ?? "1800");
const KNOWLEDGE_VERSION_KEY = `${CACHE_PREFIX}:knowledge_version`;
const RETRIEVE_KEY_PREFIX = `${CACHE_PREFIX}:retrieve`;

const normalizeUrl = (url: string) => url.replace(/\/+$/, "");

const buildHfEmbeddingUrl = () => {
  const explicitUrl = process.env.HF_EMBEDDING_URL;
  if (explicitUrl) return normalizeUrl(explicitUrl);

  const configuredBase = normalizeUrl(
    process.env.HF_EMBEDDING_BASE_URL ?? "https://api-inference.huggingface.co/models",
  );

  // Hugging Face Router expects the hf-inference prefix.
  if (configuredBase.includes("router.huggingface.co")) {
    const routerBase = configuredBase.endsWith("/hf-inference/models")
      ? configuredBase
      : `${configuredBase}/hf-inference/models`;
    return `${routerBase}/${EMBEDDING_MODEL}`;
  }

  const baseWithModels = configuredBase.endsWith("/models")
    ? configuredBase
    : `${configuredBase}/models`;
  return `${baseWithModels}/${EMBEDDING_MODEL}`;
};

const splitIntoChunks = (text: string, chunkSize = 800, overlap = 120) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [] as string[];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length);
    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
};

const toVectorLiteral = (values: number[]) => `[${values.join(",")}]`;
const normalizeQuery = (query: string) => query.trim().toLowerCase().replace(/\s+/g, " ");
const hashQuery = (query: string) => createHash("sha256").update(query).digest("hex");

type RetrievedChunk = { content: string; title: string; source: string | null; similarity: number };
type RetrievalCachePayload = {
  embedding: number[];
  chunks: RetrievedChunk[];
};

const getKnowledgeVersion = async () => {
  const redis = await getRedisClient();
  if (!redis) return "1";

  try {
    const existing = await redis.get(KNOWLEDGE_VERSION_KEY);
    if (existing) return existing;
    await redis.set(KNOWLEDGE_VERSION_KEY, "1");
    return "1";
  } catch (error) {
    console.error("[rag-cache] getKnowledgeVersion failed", error);
    return "1";
  }
};

const incrementKnowledgeVersion = async () => {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.incr(KNOWLEDGE_VERSION_KEY);
  } catch (error) {
    console.error("[rag-cache] incrementKnowledgeVersion failed", error);
  }
};

const classifyIntent = (message: string) => {
  const text = message.toLowerCase();
  if (/(order|track|delivery|shipping|payment|refund|cancel)/.test(text)) {
    return "order";
  }
  if (/(medicine|drug|dose|side effect|prescription|symptom|health|medical)/.test(text)) {
    return "medical";
  }
  return "product";
};

const buildClinicalSystemPrompt = (intent: string, context: string) => `You are MediStore Clinical Assistant, a careful doctor-level medical information assistant for an ecommerce pharmacy.

Primary objective:
- Give precise, evidence-aligned, practical answers using the provided context first.
- Do not invent facts, dosages, contraindications, prices, stock, or policies.

Reasoning and response rules:
- Prioritize retrieved context when relevant. If context conflicts, state the conflict briefly.
- If context is missing for a critical detail, say exactly what is missing and ask one targeted follow-up question.
- Keep medical guidance specific and actionable: include who/when/why where useful.
- Use clear clinical language but keep it understandable to non-clinicians.
- For medicine questions, include: indication, common side effects, major cautions/interactions, and when to seek urgent care if relevant.
- Never provide dangerous instructions, illegal drug guidance, or definitive diagnosis without exam/testing.
- If symptoms suggest emergency risk (e.g., chest pain, breathing difficulty, stroke signs, severe allergy, suicidal thoughts), instruct immediate emergency care.

Output style:
- Start with a direct answer in 1-2 sentences.
- Then provide short bullets only when needed for key details.
- Be concise, avoid filler, and avoid repeating the question.

Business scope:
- Intent: ${intent}
- You can answer medical, product, and order/support queries for MediStore.

Retrieved context:
${context || "No context found."}`;

export const RagService = {
  async getEmbedding(text: string): Promise<number[]> {
    const hfApiKey = process.env.HF_API_KEY;
    if (!hfApiKey) {
      throw new AppError(500, "HF_API_KEY is not configured");
    }
    const hfUrl = buildHfEmbeddingUrl();

    const response = await fetch(hfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        502,
        `Embedding API error (${hfUrl}): ${errorText}. If you use Hugging Face Router, ensure your token has Inference Providers permissions.`,
      );
    }

    const raw = await response.json();
    const vector = Array.isArray(raw)
      ? (Array.isArray(raw[0]) ? raw[0] : raw)
      : Array.isArray((raw as { embedding?: unknown })?.embedding)
        ? ((raw as { embedding: number[] }).embedding)
        : null;

    if (!Array.isArray(vector) || vector.length !== 384) {
      throw new AppError(502, "Embedding dimension mismatch. Expected 384");
    }

    return vector.map((v) => Number(v));
  },

  async ingestDocument(payload: { title: string; content: string; source?: string }) {
    const { title, content, source } = payload;
    const chunks = splitIntoChunks(content);

    if (!chunks.length) {
      throw new AppError(400, "Document content is empty");
    }

    const documentId = randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "documents" ("id", "title", "content", "source", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      documentId,
      title,
      content,
      source ?? null,
    );

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const embedding = await this.getEmbedding(chunk);

      await prisma.$executeRawUnsafe(
        `INSERT INTO "chunks" ("id", "documentId", "content", "embedding", "index", "createdAt") VALUES ($1, $2, $3, $4::vector, $5, NOW())`,
        randomUUID(),
        documentId,
        chunk,
        toVectorLiteral(embedding),
        i,
      );
    }

    await incrementKnowledgeVersion();

    return { documentId, chunkCount: chunks.length };
  },

  async retrieveChunks(query: string, limit = 5) {
    const startTime = Date.now();
    const normalizedQuery = normalizeQuery(query);
    const queryHash = hashQuery(normalizedQuery);
    const knowledgeVersion = await getKnowledgeVersion();
    const cacheKey = `${RETRIEVE_KEY_PREFIX}:${queryHash}:v${knowledgeVersion}`;

    const redis = await getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as RetrievalCachePayload;
          console.log(`[rag-cache] hit key=${cacheKey} latencyMs=${Date.now() - startTime}`);
          return parsed.chunks;
        }
      } catch (error) {
        console.error("[rag-cache] read failed", error);
      }
    }

    const embedding = await this.getEmbedding(query);

    const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
      `SELECT c."content", d."title", d."source", 1 - (c."embedding" <=> $1::vector) AS similarity
       FROM "chunks" c
       JOIN "documents" d ON d."id" = c."documentId"
       ORDER BY c."embedding" <=> $1::vector
       LIMIT $2`,
      toVectorLiteral(embedding),
      limit,
    );

    if (redis) {
      const payload: RetrievalCachePayload = { embedding, chunks: rows };
      try {
        await redis.set(cacheKey, JSON.stringify(payload), { EX: CACHE_TTL_SECONDS });
      } catch (error) {
        console.error("[rag-cache] write failed", error);
      }
    }

    console.log(`[rag-cache] miss key=${cacheKey} latencyMs=${Date.now() - startTime}`);

    return rows;
  },

  async streamChat(payload: { sessionId?: string; message: string }, res: Response) {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      throw new AppError(500, "OPENROUTER_API_KEY is not configured");
    }
    if (!CHAT_MODEL) {
      throw new AppError(500, "OPENROUTER_MODEL is not configured");
    }

    const intent = classifyIntent(payload.message);
    const contextChunks = await this.retrieveChunks(payload.message);

    const context = contextChunks
      .map(
        (chunk, i) =>
          `[${i + 1}] ${chunk.title}${chunk.source ? ` (${chunk.source})` : ""}\n${chunk.content}`,
      )
      .join("\n\n");

    const sessionId = payload.sessionId ?? randomUUID();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "chat_sessions" ("id", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) ON CONFLICT ("id") DO UPDATE SET "updatedAt" = NOW()`,
      sessionId,
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO "chat_messages" ("id", "sessionId", "role", "content", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      randomUUID(),
      sessionId,
      "user",
      payload.message,
    );

    const recentMessages = await prisma.$queryRawUnsafe<Array<{ role: "user" | "assistant"; content: string }>>(
      `SELECT "role", "content"
       FROM "chat_messages"
       WHERE "sessionId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 10`,
      sessionId,
    );
    const historyMessages = recentMessages.reverse();

    const systemPrompt = buildClinicalSystemPrompt(intent, context);

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        stream: true,
        temperature: 0.2,
        top_p: 0.9,
        messages: [{ role: "system", content: systemPrompt }, ...historyMessages],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text();
      throw new AppError(502, `OpenRouter error: ${errorText}`);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    res.write(`event: meta\ndata: ${JSON.stringify({ sessionId })}\n\n`);

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    let fullText = "";
    let sseBuffer = "";
    let lastToken = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      sseBuffer += decoder.decode(value, { stream: true });
      const lines = sseBuffer.split("\n");
      sseBuffer = lines.pop() ?? "";

      for (const line of lines) {
        const normalized = line.trim();
        if (!normalized.startsWith("data:")) continue;
        const data = normalized.slice(5).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const token = parsed?.choices?.[0]?.delta?.content;
          if (token) {
            if (token === lastToken) continue;
            lastToken = token;
            fullText += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        } catch {
          // Ignore malformed stream fragments.
        }
      }
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO "chat_messages" ("id", "sessionId", "role", "content", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      randomUUID(),
      sessionId,
      "assistant",
      fullText,
    );

    res.write("event: done\ndata: {}\n\n");
    res.end();
  },
};
