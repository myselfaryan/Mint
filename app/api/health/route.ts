import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Test DB connection
    await db.execute(sql`SELECT 1`);

    return NextResponse.json(
      { status: "healthy", timestamp: new Date().toISOString() },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error:
          error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
