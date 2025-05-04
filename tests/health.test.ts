import { GET } from "@/app/api/health/route";
import { sql } from "drizzle-orm";

jest.mock("@/db/drizzle", () => ({
  db: {
    execute: jest.fn(),
  },
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

import { db } from "@/db/drizzle";
import { NextResponse } from "next/server";

describe("GET /api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 if DB connection is healthy", async () => {
    (db.execute as jest.Mock).mockResolvedValueOnce(undefined);

    const res = await GET();

    expect(db.execute).toHaveBeenCalledWith(sql`SELECT 1`);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty("status", "healthy");
    expect(res.data).toHaveProperty("timestamp");
  });

  it("should return 503 if DB connection fails", async () => {
    (db.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Connection error"),
    );

    const res = await GET();

    expect(db.execute).toHaveBeenCalled();
    expect(res.status).toBe(503);
    expect(res.data).toMatchObject({
      status: "unhealthy",
      error: "Connection error",
    });
    expect(res.data).toHaveProperty("timestamp");
  });
});
