/**
 * Queue Worker Script
 * Processes code execution jobs from the Redis queue
 * 
 * Run this as a separate process:
 * bun run scripts/queue-worker.ts
 */

import { getRedis } from '../db/redis';
import { dequeueJob, getQueueStats } from '../lib/code-execution/queue';
import { processSubmission } from '../lib/code-execution/processor';

const POLL_INTERVAL = 500; // ms
const MAX_CONCURRENT = 3;

let activeJobs = 0;
let isShuttingDown = false;

async function worker() {
    console.log('🚀 Queue worker starting...');

    // Test Redis connection
    const redis = getRedis();
    try {
        await redis.ping();
        console.log('✅ Connected to Redis');
    } catch (error) {
        console.error('❌ Failed to connect to Redis:', error);
        process.exit(1);
    }

    // Graceful shutdown handlers
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    console.log(`⚙️  Worker ready (max concurrent: ${MAX_CONCURRENT})`);

    // Main processing loop
    while (!isShuttingDown) {
        try {
            // Check if we can take more jobs
            if (activeJobs >= MAX_CONCURRENT) {
                await sleep(POLL_INTERVAL);
                continue;
            }

            // Try to get a job
            const job = await dequeueJob();

            if (!job) {
                await sleep(POLL_INTERVAL);
                continue;
            }

            console.log(`📥 Processing job ${job.id} (submission ${job.submissionId})`);
            activeJobs++;

            // Process job in background (don't await)
            processSubmission(job)
                .then(() => {
                    console.log(`✅ Completed job ${job.id}`);
                })
                .catch((error) => {
                    console.error(`❌ Failed job ${job.id}:`, error);
                })
                .finally(() => {
                    activeJobs--;
                });

        } catch (error) {
            console.error('Worker error:', error);
            await sleep(POLL_INTERVAL * 2);
        }
    }

    // Wait for active jobs to complete
    console.log(`⏳ Waiting for ${activeJobs} active jobs to complete...`);
    while (activeJobs > 0) {
        await sleep(500);
    }

    console.log('👋 Worker shutdown complete');
    process.exit(0);
}

function shutdown(signal: string) {
    console.log(`\n📛 Received ${signal}, shutting down gracefully...`);
    isShuttingDown = true;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Print stats periodically
async function statsLogger() {
    while (!isShuttingDown) {
        try {
            const stats = await getQueueStats();
            console.log(`📊 Queue: ${stats.queueLength} pending, ${stats.processing} processing, ${activeJobs} local active`);
        } catch (error) {
            // Ignore stats errors
        }
        await sleep(10000); // Every 10 seconds
    }
}

// Start worker
worker().catch(console.error);
statsLogger().catch(console.error);
