import { getRedis, CACHE_TTL } from "@/db/redis";
import { cacheMetrics } from "@/lib/metrics/cache";

export async function withDataCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
  estimatedQueries: number = 1, // Default to 1 query if not specified
): Promise<T> {
  const startTime = Date.now();
  const initialMemory = process.memoryUsage().heapUsed;

  const redis = getRedis();

  try {
    const cached = await redis.get(key);
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

    const result = await fn();
    await redis.setex(key, ttl, JSON.stringify(result));

    cacheMetrics.record({
      path: key,
      useCache: true,
      duration: Date.now() - startTime,
      cacheHit: false,
      dbQueries: estimatedQueries, // Use the provided estimate
      memoryUsage: process.memoryUsage().heapUsed - initialMemory,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
