import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function errorMiddleware(error: Error, request: NextRequest) {
  // Log error details
  console.error({
    type: "error",
    timestamp: new Date().toISOString(),
    url: request.url,
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  // Return appropriate error response
  return new NextResponse(
    JSON.stringify({
      status: "error",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    }),
    {
      status: 500,
      headers: { "content-type": "application/json" },
    },
  );
}
