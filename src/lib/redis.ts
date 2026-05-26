import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const connectTimeoutMs = Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? "3000");

type AppRedisClient = ReturnType<typeof createClient>;

let redisClient: AppRedisClient | null = null;
let connectAttempted = false;

const createRedisClient = () => {
  if (!redisUrl) return null;

  return createClient({
    url: redisUrl,
    socket: {
      connectTimeout: connectTimeoutMs,
    },
  });
};

export const getRedisClient = async (): Promise<AppRedisClient | null> => {
  if (!redisUrl) return null;

  if (!redisClient) {
    redisClient = createRedisClient();
    redisClient?.on("error", (error) => {
      console.error("[redis] client error", error);
    });
  }

  if (!redisClient) return null;

  if (!redisClient.isOpen && !connectAttempted) {
    connectAttempted = true;
    try {
      await redisClient.connect();
      console.log("[redis] connected");
    } catch (error) {
      console.error("[redis] connection failed", error);
      redisClient = null;
      return null;
    } finally {
      connectAttempted = false;
    }
  }

  return redisClient;
};
