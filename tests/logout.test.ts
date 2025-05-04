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
  },
}));

// Mock session-related functions
jest.mock("@/lib/server/session", () => ({
  getCurrentSession: jest.fn(),
  invalidateSession: jest.fn(),
}));

// Mock cookie-related functions
jest.mock("@/lib/server/cookies", () => ({
  deleteSessionTokenCookie: jest.fn(),
}));

import { NextResponse } from "next/server";
import { getCurrentSession, invalidateSession } from "@/lib/server/session";
import { deleteSessionTokenCookie } from "@/lib/server/cookies";
import { DELETE } from "@/app/api/auth/logout/route";

describe("DELETE /api/auth/logout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should logout successfully with valid session", async () => {
    // Mock session data
    const mockSession = {
      id: "session-123",
      userId: "user-123",
      token: "token-123",
      expiresAt: new Date(),
    };

    // Set up mocks
    (getCurrentSession as jest.Mock).mockResolvedValue({
      session: mockSession,
      user: null,
    });
    (invalidateSession as jest.Mock).mockResolvedValue(true);
    (deleteSessionTokenCookie as jest.Mock).mockResolvedValue(undefined);

    // Call the handler
    const response = await DELETE();

    // Assertions
    expect(getCurrentSession).toHaveBeenCalled();
    expect(invalidateSession).toHaveBeenCalledWith("session-123");
    expect(deleteSessionTokenCookie).toHaveBeenCalled();

    expect(response.data).toEqual({ success: true });
    expect(response.status).toBe(200);
  });

  it("should handle case when no session exists", async () => {
    // Set up mocks for no session
    (getCurrentSession as jest.Mock).mockResolvedValue({
      session: null,
      user: null,
    });
    (deleteSessionTokenCookie as jest.Mock).mockResolvedValue(undefined);

    // Call the handler
    const response = await DELETE();

    // Assertions
    expect(getCurrentSession).toHaveBeenCalled();
    expect(invalidateSession).not.toHaveBeenCalled(); // Should not be called when no session
    expect(deleteSessionTokenCookie).toHaveBeenCalled();

    expect(response.data).toEqual({ success: true });
    expect(response.status).toBe(200);
  });

  it("should handle errors during logout process", async () => {
    // Set up mocks to throw an error
    (getCurrentSession as jest.Mock).mockRejectedValue(
      new Error("Session error"),
    );

    // Call the handler
    const response = await DELETE();

    // Assertions
    expect(getCurrentSession).toHaveBeenCalled();
    expect(invalidateSession).not.toHaveBeenCalled();
    expect(deleteSessionTokenCookie).not.toHaveBeenCalled();

    expect(response.data).toEqual({ error: "Failed to logout" });
    expect(response.status).toBe(500);
  });

  it("should handle errors during session invalidation", async () => {
    // Mock session data
    const mockSession = {
      id: "session-123",
      userId: "user-123",
      token: "token-123",
      expiresAt: new Date(),
    };

    // Set up mocks
    (getCurrentSession as jest.Mock).mockResolvedValue({
      session: mockSession,
      user: null,
    });
    (invalidateSession as jest.Mock).mockRejectedValue(new Error("DB error"));

    // Call the handler
    const response = await DELETE();

    // Assertions
    expect(getCurrentSession).toHaveBeenCalled();
    expect(invalidateSession).toHaveBeenCalledWith("session-123");
    expect(deleteSessionTokenCookie).not.toHaveBeenCalled();

    expect(response.data).toEqual({ error: "Failed to logout" });
    expect(response.status).toBe(500);
  });
});
