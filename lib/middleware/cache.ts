import { type NextRequest, NextResponse } from "next/server";
import { getRedis, CACHE_TTL } from "@/db/redis";
import { cacheMetrics } from "@/lib/metrics/cache";

// A/B test based on request hash
function shouldUseCache(req: NextRequest): boolean {
  const hash = Math.abs(hashCode(req.url + req.headers.get("user-agent")));
  return hash % 2 === 0;
}

function hashCode(str: string): number {
  return str.split("").reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0);
  }, 0);
}

type CacheConfig = {
  ttl?: number;
  keyFn?: (req: NextRequest) => string;
};

// New type for handler with query counter
type HandlerWithQueryCount = (
  req: NextRequest,
  queryCount: { value: number },
) => Promise<Response>;

export function withCache(
  handler: HandlerWithQueryCount,
  config: CacheConfig = {},
) {
  return async (req: NextRequest) => {
    const startTime = Date.now();
    const initialMemory = process.memoryUsage().heapUsed;
    const queryCount = { value: 0 }; // Mutable counter object

    const useCache = shouldUseCache(req);
    const cacheKey = config.keyFn?.(req) || req.url;

    if (useCache) {
      try {
        const redis = getRedis();
        const cached = await redis.get(cacheKey);

        if (cached) {
          // Cache hit
          const endTime = Date.now();
          cacheMetrics.record({
            path: req.url,
            useCache: true,
            duration: endTime - startTime,
            cacheHit: true,
            dbQueries: 0,
            memoryUsage: process.memoryUsage().heapUsed - initialMemory,
          });

          return NextResponse.json(JSON.parse(cached));
        }
      } catch (error) {
        console.error("Cache error:", error);
      }
    }

    // Cache miss or not using cache
    const response = await handler(req, queryCount); // Pass query counter
    const endTime = Date.now();

    if (useCache && response.ok) {
      try {
        const redis = getRedis();
        const data = await response.clone().json();
        await redis.setex(
          cacheKey,
          config.ttl || CACHE_TTL.MEDIUM,
          JSON.stringify(data),
        );
      } catch (error) {
        console.error("Cache set error:", error);
      }
    }

    cacheMetrics.record({
      path: req.url,
      useCache,
      duration: endTime - startTime,
      cacheHit: false,
      dbQueries: queryCount.value, // Use final query count
      memoryUsage: process.memoryUsage().heapUsed - initialMemory,
    });

    return response;
  };
}
