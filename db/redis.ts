import { Redis } from "ioredis";

// Singleton Redis client
let redis: Redis;

if (!redis) {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    password: process.env.REDIS_PASSWORD,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  redis.on("error", (error) => {
    console.error("Redis connection error:", error);
  });

  redis.on("connect", () => {
    console.log("Redis connected");
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

export const getRedis = () => redis;
