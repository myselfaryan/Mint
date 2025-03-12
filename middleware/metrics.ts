import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { metrics } from '@/lib/metrics'

export function metricsMiddleware(request: NextRequest) {
  const startTime = Date.now()
  const response = NextResponse.next()

  // Record request metrics
  metrics.incrementCounter('http_requests_total', {
    method: request.method,
    path: new URL(request.url).pathname,
  })

  // Record response time
  const duration = Date.now() - startTime
  metrics.observeHistogram('http_request_duration_ms', duration, {
    method: request.method,
    path: new URL(request.url).pathname,
    status_code: response.status.toString(),
  })

  return response
}