CREATE INDEX IF NOT EXISTS "chat_messages_sessionId_createdAt_idx"
ON "chat_messages"("sessionId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "chat_sessions_updatedAt_idx"
ON "chat_sessions"("updatedAt");

CREATE INDEX IF NOT EXISTS "chunks_embedding_idx"
ON "chunks"
USING ivfflat ("embedding" vector_cosine_ops);
