import { Redis } from "ioredis";

// Singleton Redis client with lazy initialization
let redis: Redis | null = null;
let redisEnabled: boolean | null = null; // null means not yet determined

/**
 * Check if we're in a build environment
 */
function isBuildTime(): boolean {
  return process.env.NODE_ENV === 'production' &&
    (process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.VERCEL_ENV === undefined);
}

function createRedisClient(): Redis | null {
  // Don't create Redis client during build time
  if (isBuildTime()) {
    console.log("Skipping Redis connection during build");
    return null;
  }

  // Check if Redis URL is configured
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not configured - caching disabled");
    redisEnabled = false;
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      password: process.env.REDIS_PASSWORD,
      retryStrategy(times) {
        if (times > 3) {
          console.warn(
            "Redis connection failed after 3 retries - disabling cache",
          );
          redisEnabled = false;
          return null; // Stop retrying
        }
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
      // For Upstash and other TLS connections
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    });

    redisEnabled = true;
    return client;
  } catch (error) {
    console.warn("Failed to create Redis client:", error);
    redisEnabled = false;
    return null;
  }
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

/**
 * Check if Redis is enabled and available
 */
export const isRedisEnabled = (): boolean => {
  if (isBuildTime()) return false;
  if (redisEnabled === null) {
    // Try to initialize
    getRedis();
  }
  return redisEnabled === true;
};

/**
 * Get Redis client (may return null if Redis is not configured)
 */
export const getRedis = (): Redis | null => {
  // Never return Redis during build time
  if (isBuildTime()) return null;

  if (redisEnabled === false) return null;

  if (!redis) {
    redis = createRedisClient();

    if (redis) {
      redis.on("error", (error) => {
        console.error("Redis connection error:", error);
      });

      redis.on("connect", () => {
        console.log("Redis connected");
      });
    }
  }
  return redis;
};

/**
 * Safe Redis get - returns null if Redis is not available
 */
export const safeRedisGet = async (key: string): Promise<string | null> => {
  const client = getRedis();
  if (!client) return null;

  try {
    return await client.get(key);
  } catch (error) {
    console.warn("Redis get error:", error);
    return null;
  }
};

/**
 * Safe Redis set - no-op if Redis is not available
 */
export const safeRedisSet = async (
  key: string,
  value: string,
  ttl?: number,
): Promise<boolean> => {
  const client = getRedis();
  if (!client) return false;

  try {
    if (ttl) {
      await client.set(key, value, "EX", ttl);
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    console.warn("Redis set error:", error);
    return false;
  }
};
