import Redis from "ioredis";
import { env } from "../config/env";
import { logger } from "./logger";

let redisClient: Redis | null = null;
let loggedRedisFailure = false;

const createRedisClient = () =>
  new Redis({
    host: env.redisHost,
    port: env.redisPort,
    password: env.redisPassword || undefined,
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: () => null,
  });

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createRedisClient();
    redisClient.on("error", (error) => {
      if (!loggedRedisFailure) {
        loggedRedisFailure = true;
        logger.warn("Redis unavailable, continuing without cache.", error);
      }
    });
  }

  return redisClient;
};

const ensureRedisConnection = async () => {
  const client = getRedisClient();

  if (client.status === "ready") {
    return client;
  }

  try {
    await client.connect();
    loggedRedisFailure = false;
    return client;
  } catch {
    return null;
  }
};

export const getCacheValue = async <T>(key: string): Promise<T | null> => {
  const client = await ensureRedisConnection();

  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    logger.error("Cache GET error", error);
    return null;
  }
};

export const setCacheValue = async (
  key: string,
  value: unknown,
  ttlInSeconds = 3600,
) => {
  const client = await ensureRedisConnection();

  if (!client) {
    return;
  }

  try {
    await client.set(key, JSON.stringify(value), "EX", ttlInSeconds);
  } catch (error) {
    logger.error("Cache SET error", error);
  }
};

export const deleteCacheValue = async (key: string) => {
  const client = await ensureRedisConnection();

  if (!client) {
    return;
  }

  try {
    await client.del(key);
  } catch (error) {
    logger.error("Cache DEL error", error);
  }
};

export const deleteCacheValuesByPattern = async (pattern: string) => {
  const client = await ensureRedisConnection();

  if (!client) {
    return;
  }

  try {
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch (error) {
    logger.error("Cache DEL pattern error", error);
  }
};

export const closeRedisConnection = async () => {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.quit();
  } catch {
    await redisClient.disconnect();
  } finally {
    redisClient = null;
  }
};
