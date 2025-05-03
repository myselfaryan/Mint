import { POST } from "../app/api/auth/login/route"; // adjust the import based on file location
import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { verifyPassword } from "@/lib/password";
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
  generateSessionToken: jest.fn(() => "mock-token"),
  createSession: jest.fn(() => Promise.resolve({ expiresAt: new Date(Date.now() + 3600000) })),
}));

jest.mock("@/lib/server/cookies", () => ({
  setSessionTokenCookie: jest.fn(),
}));

describe("POST /api/login", () => {
  const mockUser = {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    hashedPassword: "hashed-pwd",
  };

  it("should return user data on valid credentials", async () => {
    const body = JSON.stringify({
      email: "test@example.com",
      password: "securePassword",
    });

    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body,
    });

    // Adjust the import based on your project structure
    

    db.query.users.findFirst.mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(true);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      _id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    });
  });

  it("should return 401 if user not found", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "notfound@example.com", password: "123456" }),
    });

    // Adjust the import based on your project structure
    // const { db } = require("@/db/drizzle");
    db.query.users.findFirst.mockResolvedValue(null);

    const response = await POST(request);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.error).toBe("Invalid credentials");
  });

  it("should return 401 on invalid password", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com", password: "wrong" }),
    });

   

    db.query.users.findFirst.mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(false);

    const response = await POST(request);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe("Invalid credentials");
  });

  it("should return 400 on invalid request", async () => {
    const request = new Request("http://localhost/api/login", {
      method: "POST",
      body: "INVALID_JSON", // malformed
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Invalid request");
  });
});
