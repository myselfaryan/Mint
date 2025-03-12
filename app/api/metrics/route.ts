import { NextResponse } from "next/server"
import { metrics } from "@/lib/metrics"

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get application metrics
 *     description: Returns Prometheus-formatted metrics about the application's performance
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Prometheus metrics in plain text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: |
 *               # TYPE http_requests_total counter
 *               http_requests_total{method="GET",path="/api/metrics"} 1
 *               # TYPE http_request_duration_ms histogram
 *               http_request_duration_ms_bucket{method="GET",path="/api/metrics",le="10"} 1
 */
export const runtime = 'edge'

export async function GET() {
  return new NextResponse(metrics.getMetrics(), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  })
}