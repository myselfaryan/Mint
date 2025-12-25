/**
 * Server-Sent Events (SSE) endpoint for real-time submission updates
 * GET /api/submissions/[id]/stream - Stream submission status updates
 * 
 * This uses SSE instead of WebSockets because Next.js API routes
 * don't natively support WebSocket upgrades in the app router.
 */

import { NextRequest } from 'next/server';
import { getRedis } from '@/db/redis';
import { WSMessage } from '@/lib/code-execution/types';

const CHANNEL_PREFIX = 'submission:';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const submissionId = params.id;

    // Validate submission ID
    if (!submissionId || isNaN(parseInt(submissionId, 10))) {
        return new Response('Invalid submission ID', { status: 400 });
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const redis = getRedis();
            const subscriber = redis.duplicate();

            let isConnected = true;

            // Function to send SSE message
            const sendMessage = (data: WSMessage) => {
                if (!isConnected) return;

                try {
                    const message = `data: ${JSON.stringify(data)}\n\n`;
                    controller.enqueue(encoder.encode(message));
                } catch (error) {
                    console.error('Error sending SSE message:', error);
                }
            };

            // Send initial connection message
            sendMessage({
                type: 'submission_status_update',
                submissionId: parseInt(submissionId, 10),
                data: {
                    status: 'queued',
                    timestamp: Date.now(),
                },
            });

            try {
                // Subscribe to submission updates
                await subscriber.subscribe(`${CHANNEL_PREFIX}${submissionId}`);

                subscriber.on('message', (channel, message) => {
                    try {
                        const parsed = JSON.parse(message) as WSMessage;
                        sendMessage(parsed);

                        // Close connection on completion or error
                        if (parsed.type === 'submission_completed' || parsed.type === 'error') {
                            setTimeout(() => {
                                if (isConnected) {
                                    isConnected = false;
                                    controller.close();
                                    subscriber.unsubscribe();
                                    subscriber.quit();
                                }
                            }, 1000);
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                // Handle connection timeout (5 minutes max)
                const timeout = setTimeout(() => {
                    if (isConnected) {
                        isConnected = false;
                        sendMessage({
                            type: 'error',
                            submissionId: parseInt(submissionId, 10),
                            data: {
                                error: 'Connection timeout',
                                timestamp: Date.now(),
                            },
                        });
                        controller.close();
                        subscriber.unsubscribe();
                        subscriber.quit();
                    }
                }, 5 * 60 * 1000);

                // Cleanup on abort
                request.signal.addEventListener('abort', () => {
                    isConnected = false;
                    clearTimeout(timeout);
                    subscriber.unsubscribe();
                    subscriber.quit();
                });
            } catch (error) {
                console.error('SSE subscription error:', error);
                isConnected = false;
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
