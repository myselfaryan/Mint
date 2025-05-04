import { getRedis, CACHE_TTL } from "@/db/redis";

export async function withDataCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  const redis = getRedis();

  // Try cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Cache miss - call function
  const result = await fn();

  // Cache the result
  await redis.setex(key, ttl, JSON.stringify(result));

  return result;
}
