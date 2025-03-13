import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function loggingMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Log request
  console.log({
    type: "request",
    id: requestId,
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
  });

  const response = NextResponse.next();

  // Add request ID to response headers
  response.headers.set("X-Request-ID", requestId);

  // Log response timing
  const duration = Date.now() - startTime;
  console.log({
    type: "response",
    id: requestId,
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    status: response.status,
  });

  return response;
}
