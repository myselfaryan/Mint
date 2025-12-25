/**
 * Queue Status API
 * GET /api/queue/status - Get current queue statistics
 */

import { NextResponse } from "next/server";
import { getQueueStats, getExecutorInfo } from "@/lib/code-execution";

// This route needs runtime data, so it must be dynamic
export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    const stats = await getQueueStats();
    const executor = getExecutorInfo();

    return NextResponse.json({
      queue: {
        pending: stats.queueLength,
        processing: stats.processing,
      },
      executor: {
        backend: executor.backend,
        url: executor.url,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    return NextResponse.json(
      { error: "Failed to fetch queue status" },
      { status: 500 },
    );
  }
}
