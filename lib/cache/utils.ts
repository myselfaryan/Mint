import { getRedis, CACHE_TTL } from "@/db/redis";
import { cacheMetrics } from "@/lib/metrics/cache";

// Cache timeout to prevent slow Redis from blocking requests
const CACHE_TIMEOUT_MS = 500;

// Helper to add timeout to promises
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

export async function withDataCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
  estimatedQueries: number = 1, // Default to 1 query if not specified
): Promise<T> {
  const startTime = Date.now();
  const initialMemory = process.memoryUsage().heapUsed;

  try {
    const redis = getRedis();

    // Try to get from cache with timeout
    const cached = await withTimeout(redis.get(key), CACHE_TIMEOUT_MS);

    if (cached) {
      cacheMetrics.record({
        path: key,
        useCache: true,
        duration: Date.now() - startTime,
        cacheHit: true,
        dbQueries: 0,
        memoryUsage: process.memoryUsage().heapUsed - initialMemory,
      });
      return JSON.parse(cached);
    }

    // Cache miss or timeout - fetch from database
    const result = await fn();

    // Try to set cache in background (don't await)
    redis.setex(key, ttl, JSON.stringify(result)).catch((err) => {
      console.error("Redis setex error:", err);
    });

    cacheMetrics.record({
      path: key,
      useCache: true,
      duration: Date.now() - startTime,
      cacheHit: false,
      dbQueries: estimatedQueries,
      memoryUsage: process.memoryUsage().heapUsed - initialMemory,
    });

    return result;
  } catch (error) {
    // If cache fails, still execute the function
    console.error("Cache error, falling back to database:", error);
    return fn();
  }
}

export async function invalidateCacheKey(key: string): Promise<number> {
  try {
    const redis = getRedis();
    return await redis.del(key);
  } catch (error) {
    console.error("Redis del error:", error);
    return 0;
  }
}

// Batch invalidate multiple keys
export async function invalidateCacheKeys(keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  try {
    const redis = getRedis();
    return await redis.del(...keys);
  } catch (error) {
    console.error("Redis batch del error:", error);
    return 0;
  }
}

// Invalidate by pattern (use with caution - can be slow on large datasets)
export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  } catch (error) {
    console.error("Redis pattern del error:", error);
    return 0;
  }
}
