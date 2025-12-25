/**
 * Server-Sent Events (SSE) endpoint for real-time submission updates
 * GET /api/submissions/[id]/stream - Stream submission status updates
 *
 * This version uses polling to check submission status from the database
 * since Upstash Redis REST API doesn't support pub/sub.
 */

import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { problemSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { WSMessage } from "@/lib/code-execution/types";

const POLL_INTERVAL_MS = 1000; // Poll every 1 second
const MAX_POLL_DURATION_MS = 5 * 60 * 1000; // 5 minutes max

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const submissionId = params.id;

  // Validate submission ID
  if (!submissionId || isNaN(parseInt(submissionId, 10))) {
    return new Response("Invalid submission ID", { status: 400 });
  }

  const submissionIdNum = parseInt(submissionId, 10);

  // Create a readable stream for SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isConnected = true;
      let lastStatus: string | null = null;
      const startTime = Date.now();

      // Function to send SSE message
      const sendMessage = (data: WSMessage) => {
        if (!isConnected) return;

        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error("Error sending SSE message:", error);
        }
      };

      // Send initial connection message
      sendMessage({
        type: "submission_status_update",
        submissionId: submissionIdNum,
        data: {
          status: "queued",
          timestamp: Date.now(),
        },
      });

      // Poll for updates
      const poll = async () => {
        if (!isConnected) return;

        try {
          // Check if timeout exceeded
          if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
            sendMessage({
              type: "error",
              submissionId: submissionIdNum,
              data: {
                error: "Connection timeout",
                timestamp: Date.now(),
              },
            });
            isConnected = false;
            controller.close();
            return;
          }

          // Get submission from database
          const submission = await db
            .select({
              id: problemSubmissions.id,
              status: problemSubmissions.status,
              executionTime: problemSubmissions.executionTime,
              memoryUsage: problemSubmissions.memoryUsage,
            })
            .from(problemSubmissions)
            .where(eq(problemSubmissions.id, submissionIdNum))
            .limit(1);

          if (submission.length === 0) {
            sendMessage({
              type: "error",
              submissionId: submissionIdNum,
              data: {
                error: "Submission not found",
                timestamp: Date.now(),
              },
            });
            isConnected = false;
            controller.close();
            return;
          }

          const sub = submission[0];

          // Only send update if status changed
          if (sub.status !== lastStatus) {
            lastStatus = sub.status;

            // Check if submission is completed (accepted, rejected, error)
            const isCompleted = sub.status &&
              sub.status !== "pending" &&
              sub.status !== "processing";

            if (isCompleted) {
              // Send final status
              sendMessage({
                type: "submission_completed",
                submissionId: submissionIdNum,
                data: {
                  status: sub.status as any,
                  executionTime: sub.executionTime ?? undefined,
                  memoryUsed: sub.memoryUsage ?? undefined,
                  timestamp: Date.now(),
                },
              });

              // Close connection after sending final status
              setTimeout(() => {
                if (isConnected) {
                  isConnected = false;
                  controller.close();
                }
              }, 500);
              return;
            } else {
              // Send status update
              sendMessage({
                type: "submission_status_update",
                submissionId: submissionIdNum,
                data: {
                  status: (sub.status || "processing") as any,
                  timestamp: Date.now(),
                },
              });
            }
          }

          // Continue polling
          if (isConnected) {
            setTimeout(poll, POLL_INTERVAL_MS);
          }
        } catch (error) {
          console.error("Polling error:", error);
          if (isConnected) {
            setTimeout(poll, POLL_INTERVAL_MS * 2); // Retry with backoff on error
          }
        }
      };

      // Start polling
      poll();

      // Cleanup on abort
      request.signal.addEventListener("abort", () => {
        isConnected = false;
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
