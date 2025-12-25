/**
 * Submission Queue System using Redis
 * Handles job queuing and real-time status updates via pub/sub
 */

import { getRedis, CACHE_TTL } from '@/db/redis';
import { ExecutionJob, WSMessage, WSMessageType, TestCaseResult, SubmissionStatus } from './types';

// Queue and channel names
const QUEUE_NAME = 'code_execution_queue';
const PROCESSING_SET = 'code_execution_processing';
const CHANNEL_PREFIX = 'submission:';

/**
 * Add a submission job to the queue
 */
export async function enqueueJob(job: ExecutionJob): Promise<void> {
    const redis = getRedis();

    // Store job data
    await redis.set(
        `job:${job.id}`,
        JSON.stringify(job),
        'EX',
        CACHE_TTL.LONG
    );

    // Add to queue
    await redis.rpush(QUEUE_NAME, job.id);

    // Publish job created event
    await publishUpdate(job.submissionId, {
        type: 'submission_created',
        submissionId: job.submissionId,
        data: {
            status: 'queued',
            totalTestCases: job.testCases.length,
            timestamp: Date.now(),
        },
    });
}

/**
 * Get and claim the next job from the queue
 */
export async function dequeueJob(): Promise<ExecutionJob | null> {
    const redis = getRedis();

    // Atomic pop from queue
    const jobId = await redis.lpop(QUEUE_NAME);
    if (!jobId) return null;

    // Get job data
    const jobData = await redis.get(`job:${jobId}`);
    if (!jobData) return null;

    // Mark as processing
    await redis.sadd(PROCESSING_SET, jobId);

    return JSON.parse(jobData) as ExecutionJob;
}

/**
 * Mark a job as completed and clean up
 */
export async function completeJob(jobId: string): Promise<void> {
    const redis = getRedis();

    await redis.srem(PROCESSING_SET, jobId);
    await redis.del(`job:${jobId}`);
}

/**
 * Publish a real-time update for a submission
 */
export async function publishUpdate(submissionId: number, message: WSMessage): Promise<void> {
    const redis = getRedis();

    await redis.publish(
        `${CHANNEL_PREFIX}${submissionId}`,
        JSON.stringify(message)
    );

    // Also publish to a global channel for dashboard updates
    await redis.publish('submissions:all', JSON.stringify(message));
}

/**
 * Subscribe to updates for a specific submission
 */
export async function subscribeToSubmission(
    submissionId: number,
    callback: (message: WSMessage) => void
): Promise<() => void> {
    const redis = getRedis();
    const subscriber = redis.duplicate();

    await subscriber.subscribe(`${CHANNEL_PREFIX}${submissionId}`);

    subscriber.on('message', (channel, message) => {
        try {
            const parsed = JSON.parse(message) as WSMessage;
            callback(parsed);
        } catch (error) {
            console.error('Failed to parse subscription message:', error);
        }
    });

    // Return unsubscribe function
    return async () => {
        await subscriber.unsubscribe(`${CHANNEL_PREFIX}${submissionId}`);
        await subscriber.quit();
    };
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
    queueLength: number;
    processing: number;
}> {
    const redis = getRedis();

    const [queueLength, processingCount] = await Promise.all([
        redis.llen(QUEUE_NAME),
        redis.scard(PROCESSING_SET),
    ]);

    return {
        queueLength,
        processing: processingCount,
    };
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
    }
): Promise<void> {
    const redis = getRedis();

    await redis.set(
        `submission_result:${submissionId}`,
        JSON.stringify(results),
        'EX',
        CACHE_TTL.MEDIUM
    );
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

    const cached = await redis.get(`submission_result:${submissionId}`);
    if (!cached) return null;

    return JSON.parse(cached);
}

/**
 * Rate limiting for submissions
 */
export async function checkRateLimit(
    userId: number,
    limit: number = 10,
    windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const redis = getRedis();
    const key = `ratelimit:submissions:${userId}`;
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);

    // Remove old entries
    await redis.zremrangebyscore(key, 0, windowStart);

    // Count current entries
    const count = await redis.zcard(key);

    if (count >= limit) {
        const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES');
        const resetAt = oldestEntry.length > 1
            ? parseInt(oldestEntry[1]) + (windowSeconds * 1000)
            : now + (windowSeconds * 1000);

        return {
            allowed: false,
            remaining: 0,
            resetAt,
        };
    }

    // Add current request
    await redis.zadd(key, now, `${now}:${Math.random()}`);
    await redis.expire(key, windowSeconds);

    return {
        allowed: true,
        remaining: limit - count - 1,
        resetAt: now + (windowSeconds * 1000),
    };
}
