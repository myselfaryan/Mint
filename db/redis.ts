import { Redis } from "ioredis";

// Singleton Redis client with lazy initialization
let redis: Redis | null = null;

function createRedisClient(): Redis {
  return new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    // Enable keep-alive for better connection reuse
    keepAlive: 10000,
    // Connection timeout for faster failure detection
    connectTimeout: 5000,
    // Lazy connect - don't connect until first command
    lazyConnect: true,
  });
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  ORG: "org:",
  CONTEST: "contest:",
  PROBLEM: "problem:",
  LIST: "list:",
} as const;

export const getRedis = (): Redis => {
  if (!redis) {
    redis = createRedisClient();

    redis.on("error", (error) => {
      console.error("Redis connection error:", error);
    });

    redis.on("connect", () => {
      console.log("Redis connected");
    });
  }
  return redis;
};
