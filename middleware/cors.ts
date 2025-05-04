import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function corsMiddleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get("origin") || "";

  // Define allowed origins
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    // Add your production domains here
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle OPTIONS (preflight) requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowedOrigin
          ? origin
          : allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Handle actual requests
  const response = NextResponse.next();

  // Add CORS headers
  response.headers.set(
    "Access-Control-Allow-Origin",
    isAllowedOrigin ? origin : allowedOrigins[0],
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  return response;
}
