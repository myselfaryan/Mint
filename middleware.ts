import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loggingMiddleware } from "./middleware/logging";
import { metricsMiddleware } from "./middleware/metrics";
import { errorMiddleware } from "./middleware/error";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for metrics endpoint
    if (request.nextUrl.pathname === "/api/metrics") {
      return NextResponse.next();
    }

    // Apply logging middleware
    const loggedResponse = await loggingMiddleware(request);
    if (loggedResponse) return loggedResponse;

    // Apply metrics middleware
    const metricsResponse = await metricsMiddleware(request);
    if (metricsResponse) return metricsResponse;

    return NextResponse.next();
  } catch (error) {
    return errorMiddleware(error as Error, request);
  }
}
