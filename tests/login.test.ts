import { jest } from "@jest/globals";

// Mock Next.js modules
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => {
      return {
        data,
        status: options?.status || 200,
        headers: new Map(),
      };
    }),
    redirect: jest.fn(),
    next: jest.fn(),
  },
}));

jest.mock("@/db/drizzle", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
  },
}));

jest.mock("@/lib/password", () => ({
  verifyPassword: jest.fn(),
}));

jest.mock("@/lib/server/session", () => ({
  generateSessionToken: jest.fn().mockReturnValue("mock-session-token"),
  createSession: jest.fn().mockResolvedValue({
    token: "mock-session-token",
    expiresAt: new Date(Date.now() + 86400000),
  }),
}));

jest.mock("@/lib/server/cookies", () => ({
  setSessionTokenCookie: jest.fn(),
}));

import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { verifyPassword } from "@/lib/password";
import { generateSessionToken, createSession } from "@/lib/server/session";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { POST } from "@/app/api/auth/login/route";

describe("POST /api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user data on valid credentials", async () => {
    // Mock user data
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      hashedPassword: "hashed_password",
    };

    // Set up mocks
    (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    // Create mock request
    const request = {
      json: jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "password123",
      }),
    } as unknown as Request;

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(db.query.users.findFirst).toHaveBeenCalled();
    expect(verifyPassword).toHaveBeenCalledWith(
      "hashed_password",
      "password123",
    );
    expect(generateSessionToken).toHaveBeenCalled();
    expect(createSession).toHaveBeenCalled();
    expect(setSessionTokenCookie).toHaveBeenCalled();

    expect(response.data).toEqual({
      _id: "1",
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("should return 401 if user not found", async () => {
    // Set up mocks
    (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = {
      json: jest.fn().mockResolvedValue({
        email: "nonexistent@example.com",
        password: "password123",
      }),
    } as unknown as Request;

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: "Invalid credentials" });
  });

  it("should return 401 on invalid password", async () => {
    // Mock user data
    const mockUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      hashedPassword: "hashed_password",
    };

    // Set up mocks
    (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    // Create mock request
    const request = {
      json: jest.fn().mockResolvedValue({
        email: "test@example.com",
        password: "wrong_password",
      }),
    } as unknown as Request;

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(verifyPassword).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(response.data).toEqual({ error: "Invalid credentials" });
  });

  it("should return 400 on invalid request", async () => {
    // Create mock request that throws an error when trying to parse JSON
    const request = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    } as unknown as Request;

    // Call the handler
    const response = await POST(request);

    // Assertions
    expect(response.status).toBe(400);
    expect(response.data).toEqual({ error: "Invalid request" });
  });
});
