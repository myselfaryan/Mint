import { NextResponse } from "next/server";
import { metrics } from "@/lib/metrics";
import { cacheMetrics } from "@/lib/metrics/cache";

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
/*
 export const runtime = "edge";

export async function GET() {
  return new NextResponse(metrics.getMetrics(), {
    headers: {
      "Content-Type": "text/plain; version=0.0.4",
    },
  });
}
*/

export async function GET() {
  try {
    const report = cacheMetrics.generateReport();

    return new Response(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          metrics: {
            cached: {
              averageResponseTime: report.withCache.avg,
              p95ResponseTime: report.withCache.p95,
              hits: report.withCache.hits,
              misses: report.withCache.misses,
              hitRate:
                report.withCache.hits /
                (report.withCache.hits + report.withCache.misses),
            },
            uncached: {
              averageResponseTime: report.withoutCache.avg,
              p95ResponseTime: report.withoutCache.p95,
            },
            impact: {
              dbQueriesSaved: report.dbQueriesSaved,
              /*
              memoryDelta: {
                withCache: report.memoryUsage.withCache,
                withoutCache: report.memoryUsage.withoutCache,
                difference:
                  report.memoryUsage.withCache -
                  report.memoryUsage.withoutCache,
              },
              */
            },
          },
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store", // Don't cache metrics response
        },
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      // No metrics file found
      return new Response(
        JSON.stringify({
          error: "No metrics collected yet",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.error("Failed to generate metrics report:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate metrics report",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
