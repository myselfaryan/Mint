import { Redis } from "@upstash/redis";

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

  // Check if Upstash REST URL is configured (preferred for serverless)
  const restUrl = process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    try {
      const client = new Redis({
        url: restUrl,
        token: restToken,
      });
      redisEnabled = true;
      console.log("Redis client created (Upstash REST)");
      return client;
    } catch (error) {
      console.warn("Failed to create Upstash Redis client:", error);
      redisEnabled = false;
      return null;
    }
  }

  // Fallback: Check for REDIS_URL (legacy format)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    // Parse the URL to extract components for Upstash REST format
    try {
      const url = new URL(redisUrl);
      const host = url.hostname;
      const password = url.password || decodeURIComponent(url.username.split(':')[1] || '');

      // Try to use Upstash REST API format
      const client = new Redis({
        url: `https://${host}`,
        token: password,
      });
      redisEnabled = true;
      console.log("Redis client created (from REDIS_URL)");
      return client;
    } catch (error) {
      console.warn("Failed to parse REDIS_URL for Upstash:", error);
      redisEnabled = false;
      return null;
    }
  }

  console.warn("No Redis configuration found - caching disabled");
  redisEnabled = false;
  return null;
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
      await client.set(key, value, { ex: ttl });
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    console.warn("Redis set error:", error);
    return false;
  }
};
