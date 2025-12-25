/**
 * Submission Queue System using Redis (Optional)
 * Handles job queuing and status storage
 * Falls back gracefully when Redis is not available
 * 
 * Note: Real-time updates are now handled via database polling
 * since Upstash REST API doesn't support pub/sub in serverless.
 */

import { getRedis, CACHE_TTL, isRedisEnabled } from "@/db/redis";
import {
  ExecutionJob,
  WSMessage,
  TestCaseResult,
  SubmissionStatus,
} from "./types";

// Queue and channel names
const QUEUE_NAME = "code_execution_queue";
const PROCESSING_SET = "code_execution_processing";

/**
 * Check if queue features are available
 */
export function isQueueEnabled(): boolean {
  return isRedisEnabled() && getRedis() !== null;
}

/**
 * Add a submission job to the queue
 */
export async function enqueueJob(job: ExecutionJob): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    console.warn("Redis not available - job not queued");
    return false;
  }

  try {
    // Store job data
    await redis.set(`job:${job.id}`, JSON.stringify(job), { ex: CACHE_TTL.LONG });

    // Add to queue (Upstash supports rpush)
    await redis.rpush(QUEUE_NAME, job.id);

    return true;
  } catch (error) {
    console.error("Failed to enqueue job:", error);
    return false;
  }
}

/**
 * Get and claim the next job from the queue
 */
export async function dequeueJob(): Promise<ExecutionJob | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    // Atomic pop from queue
    const jobId = await redis.lpop<string>(QUEUE_NAME);
    if (!jobId) return null;

    // Get job data
    const jobData = await redis.get<string>(`job:${jobId}`);
    if (!jobData) return null;

    // Mark as processing
    await redis.sadd(PROCESSING_SET, jobId);

    return typeof jobData === 'string' ? JSON.parse(jobData) : jobData as unknown as ExecutionJob;
  } catch (error) {
    console.error("Failed to dequeue job:", error);
    return null;
  }
}

/**
 * Mark a job as completed and clean up
 */
export async function completeJob(jobId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.srem(PROCESSING_SET, jobId);
    await redis.del(`job:${jobId}`);
  } catch (error) {
    console.error("Failed to complete job:", error);
  }
}

/**
 * Publish a real-time update for a submission
 * Note: In serverless with Upstash REST, pub/sub doesn't work the same way.
 * This function is kept for compatibility but updates are handled via DB polling.
 */
export async function publishUpdate(
  submissionId: number,
  message: WSMessage,
): Promise<void> {
  // In Upstash REST, pub/sub isn't practical for serverless
  // Updates are now delivered via database polling in the stream endpoint
  // This function is a no-op but kept for API compatibility
  console.log(`[Queue] Update for submission ${submissionId}:`, message.type);
}

/**
 * Subscribe to updates for a specific submission
 * Note: Not available with Upstash REST API - use database polling instead
 */
export async function subscribeToSubmission(
  submissionId: number,
  callback: (message: WSMessage) => void,
): Promise<(() => void) | null> {
  // Pub/sub is not available in Upstash REST
  // Real-time updates are handled via database polling in the stream endpoint
  console.warn("subscribeToSubmission not available with Upstash REST - use polling");
  return null;
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  queueLength: number;
  processing: number;
  enabled: boolean;
}> {
  const redis = getRedis();
  if (!redis) {
    return { queueLength: 0, processing: 0, enabled: false };
  }

  try {
    const [queueLength, processingCount] = await Promise.all([
      redis.llen(QUEUE_NAME),
      redis.scard(PROCESSING_SET),
    ]);

    return {
      queueLength,
      processing: processingCount,
      enabled: true,
    };
  } catch (error) {
    console.error("Failed to get queue stats:", error);
    return { queueLength: 0, processing: 0, enabled: false };
  }
}

/**
 * Store submission results for quick retrieval
 */
export async function cacheSubmissionResult(
  submissionId: number,
  results: {
    status: SubmissionStatus;
    testCaseResults: TestCaseResult[];
    totalTime: number;
    totalMemory: number;
    passedCount: number;
    totalCount: number;
  },
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.set(
      `submission_result:${submissionId}`,
      JSON.stringify(results),
      { ex: CACHE_TTL.MEDIUM },
    );
  } catch (error) {
    console.error("Failed to cache submission result:", error);
  }
}

/**
 * Get cached submission results
 */
export async function getCachedSubmissionResult(submissionId: number): Promise<{
  status: SubmissionStatus;
  testCaseResults: TestCaseResult[];
  totalTime: number;
  totalMemory: number;
  passedCount: number;
  totalCount: number;
} | null> {
  const redis = getRedis();
  if (!redis) return null;

  try {
    const cached = await redis.get<string>(`submission_result:${submissionId}`);
    if (!cached) return null;

    return typeof cached === 'string' ? JSON.parse(cached) : cached as any;
  } catch (error) {
    console.error("Failed to get cached submission result:", error);
    return null;
  }
}

/**
 * Rate limiting for submissions
 * Returns allowed: true if Redis is not available (no rate limiting)
 */
export async function checkRateLimit(
  userId: number,
  limit: number = 10,
  windowSeconds: number = 60,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const redis = getRedis();
  const now = Date.now();

  // If Redis is not available, allow all requests (no rate limiting)
  if (!redis) {
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds * 1000,
    };
  }

  try {
    const key = `ratelimit:submissions:${userId}`;
    const windowStart = now - windowSeconds * 1000;

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current entries
    const count = await redis.zcard(key);

    if (count >= limit) {
      const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true });
      const resetAt =
        oldestEntry.length > 1
          ? parseInt(String(oldestEntry[1])) + windowSeconds * 1000
          : now + windowSeconds * 1000;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt: now + windowSeconds * 1000,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow the request
    return {
      allowed: true,
      remaining: limit,
      resetAt: now + windowSeconds * 1000,
    };
  }
}
