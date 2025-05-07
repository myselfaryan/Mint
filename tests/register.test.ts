// import { jest } from "@jest/globals";

// // Mock Next.js modules
// jest.mock("next/server", () => ({
//   NextResponse: {
//     json: jest.fn((data, options) => {
//       return {
//         data,
//         status: options?.status || 200,
//         headers: new Map(),
//       };
//     }),
//   },
// }));

// // Mocked user used inside db mock must be defined before mocks
// const mockUser = {
//   id: "user-123",
//   email: "newuser@example.com",
//   name: "New User",
//   nameId: "newuser",
//   hashedPassword: "hashed_password",
//   createdAt: new Date(),
//   updatedAt: new Date(),
// };
// const findFirstMock = jest.fn();
// const insertReturningMock = jest.fn(() => Promise.resolve([mockUser]));
// const insertValuesMock = jest.fn(() => ({ returning: insertReturningMock }));
// const insertMock = jest.fn(() => ({ values: insertValuesMock }));

// jest.mock("@/db/drizzle", () => ({
//   db: {
//     query: {
//       users: {
//         findFirst: findFirstMock,
//       },
//     },
//     insert: insertMock,
//   },
// }));
// // expect(findFirstMock).toHaveBeenCalled();
// // expect(insertMock).toHaveBeenCalled();

// jest.mock("@/lib/password", () => ({
//   hashPassword: jest.fn(),
// }));

// jest.mock("@/lib/username", () => ({
//   generateUsername: jest.fn(),
// }));

// jest.mock("@/lib/server/session", () => ({
//   generateSessionToken: jest.fn(),
//   createSession: jest.fn(),
// }));

// jest.mock("@/lib/server/cookies", () => ({
//   setSessionTokenCookie: jest.fn(),
// }));

// import { NextRequest } from "next/server";
// import { db } from "@/db/drizzle";
// import { hashPassword } from "@/lib/password";
// import { generateUsername } from "@/lib/username";
// import { generateSessionToken, createSession } from "@/lib/server/session";
// import { setSessionTokenCookie } from "@/lib/server/cookies";
// import { POST } from "@/app/api/auth/register/route";

// describe("POST /api/auth/register", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should register a new user successfully", async () => {
//     const requestData = {
//       email: "newuser@example.com",
//       password: "Password123!",
//       name: "New User",
//     };

//     const mockSession = {
//       id: "session-123",
//       userId: "user-123",
//       token: "token-123",
//       expiresAt: new Date(Date.now() + 86400000),
//     };

//     (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
//     (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
//     (generateUsername as jest.Mock).mockResolvedValue("newuser");
//     mockReturning.mockResolvedValue([mockUser]);
//     (generateSessionToken as jest.Mock).mockReturnValue("token-123");
//     (createSession as jest.Mock).mockResolvedValue(mockSession);
//     (setSessionTokenCookie as jest.Mock).mockResolvedValue(undefined);

//     const request = {
//       json: jest.fn().mockResolvedValue(requestData),
//     } as unknown as NextRequest;

//     const response = await POST(request);

//     expect(db.query.users.findFirst).toHaveBeenCalled();
//     expect(hashPassword).toHaveBeenCalledWith("Password123!");
//     expect(generateUsername).toHaveBeenCalledWith("newuser@example.com");
//     expect(db.insert).toHaveBeenCalled();
//     expect(generateSessionToken).toHaveBeenCalled();
//     expect(createSession).toHaveBeenCalled();
//     expect(setSessionTokenCookie).toHaveBeenCalled();

//     expect(response.data).toEqual({
//       _id: "user-123",
//       email: "newuser@example.com",
//       name: "New User",
//       nameId: "newuser",
//     });
//     expect(response.status).toBe(200);
//   });

//   it("should return 400 if email already exists", async () => {
//     const requestData = {
//       email: "existing@example.com",
//       password: "Password123!",
//       name: "Existing User",
//     };

//     const mockExistingUser = { ...mockUser, email: "existing@example.com" };

//     (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockExistingUser);

//     const request = {
//       json: jest.fn().mockResolvedValue(requestData),
//     } as unknown as NextRequest;

//     const response = await POST(request);

//     expect(db.query.users.findFirst).toHaveBeenCalled();
//     expect(hashPassword).not.toHaveBeenCalled();
//     expect(generateUsername).not.toHaveBeenCalled();
//     expect(db.insert).not.toHaveBeenCalled();
//     expect(response.data).toEqual({ error: "Email already exists" });
//     expect(response.status).toBe(400);
//   });

//   it("should return 400 on validation error", async () => {
//     const request = {
//       json: jest.fn().mockResolvedValue({
//         email: "invalid-email",
//         password: "123",
//         name: "",
//       }),
//     } as unknown as NextRequest;

//     const response = await POST(request);

//     expect(response.data).toEqual({ error: "Invalid request" });
//     expect(response.status).toBe(400);
//   });

//   it("should handle database errors", async () => {
//     const requestData = {
//       email: "newuser@example.com",
//       password: "Password123!",
//       name: "New User",
//     };

//     (db.query.users.findFirst as jest.Mock).mockResolvedValue(null);
//     (hashPassword as jest.Mock).mockResolvedValue("hashed_password");
//     (generateUsername as jest.Mock).mockResolvedValue("newuser");
//     mockReturning.mockRejectedValue(new Error("Database error"));

//     const request = {
//       json: jest.fn().mockResolvedValue(requestData),
//     } as unknown as NextRequest;

//     const response = await POST(request);

//     expect(response.data).toEqual({ error: "Invalid request" });
//     expect(response.status).toBe(400);
//   });

//   it("should handle request parsing errors", async () => {
//     const request = {
//       json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
//     } as unknown as NextRequest;

//     const response = await POST(request);

//     expect(response.data).toEqual({ error: "Invalid request" });
//     expect(response.status).toBe(400);
//   });
// });

import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/auth/register/route"; // Assuming this file is in the same directory as the route
import { registerSchema } from "@/lib/validations";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSessionToken, createSession } from "@/lib/server/session";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { hashPassword } from "@/lib/password";
import { generateUsername } from "@/lib/username";

// Mock the imported modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

jest.mock("@/lib/validations", () => ({
  registerSchema: {
    parse: jest.fn(),
  },
}));

jest.mock("@/db/drizzle", () => ({
  db: {
    query: {
      users: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  users: {
    email: "email",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(),
}));

jest.mock("@/lib/server/session", () => ({
  generateSessionToken: jest.fn(),
  createSession: jest.fn(),
}));

jest.mock("@/lib/server/cookies", () => ({
  setSessionTokenCookie: jest.fn(),
}));

jest.mock("@/lib/password", () => ({
  hashPassword: jest.fn(),
}));

jest.mock("@/lib/username", () => ({
  generateUsername: jest.fn(),
}));

describe("User Registration API Route", () => {
  const mockRequestBody = {
    email: "test@example.com",
    password: "Password123!",
    name: "Test User",
  };

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    nameId: "test-user",
  };

  const mockToken = "mock-session-token";
  const mockSession = {
    id: "session-123",
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockRequestBody),
    };
    Object.defineProperty(NextRequest, "prototype", { value: mockRequest });

    registerSchema.parse.mockReturnValue(mockRequestBody);
    db.query.users.findFirst.mockResolvedValue(null); // No existing user by default
    eq.mockReturnValue({
      operator: "=",
      field: "email",
      value: mockRequestBody.email,
    });
    hashPassword.mockResolvedValue("hashed-password");
    generateUsername.mockResolvedValue(mockUser.nameId);
    db.returning.mockResolvedValue([mockUser]);
    generateSessionToken.mockReturnValue(mockToken);
    createSession.mockResolvedValue(mockSession);
    setSessionTokenCookie.mockResolvedValue(undefined);
  });

  it("should successfully register a new user", async () => {
    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(registerSchema.parse).toHaveBeenCalledWith(mockRequestBody);
    expect(db.query.users.findFirst).toHaveBeenCalledWith({
      where: expect.anything(), // We mock eq so we can't check its exact value
    });
    expect(eq).toHaveBeenCalledWith(users.email, mockRequestBody.email);
    expect(hashPassword).toHaveBeenCalledWith(mockRequestBody.password);
    expect(generateUsername).toHaveBeenCalledWith(mockRequestBody.email);

    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.values).toHaveBeenCalledWith({
      email: mockRequestBody.email,
      hashedPassword: "hashed-password",
      name: mockRequestBody.name,
      nameId: mockUser.nameId,
    });
    expect(db.returning).toHaveBeenCalledTimes(1);

    expect(generateSessionToken).toHaveBeenCalledTimes(1);
    expect(createSession).toHaveBeenCalledWith(mockToken, mockUser.id);
    expect(setSessionTokenCookie).toHaveBeenCalledWith(
      mockToken,
      mockSession.expiresAt,
    );

    expect(NextResponse.json).toHaveBeenCalledWith({
      _id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      nameId: mockUser.nameId,
    });

    expect(result).toEqual({
      data: {
        _id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        nameId: mockUser.nameId,
      },
      options: undefined,
    });
  });

  it("should return 400 if email already exists", async () => {
    // Setup existing user
    db.query.users.findFirst.mockResolvedValue({
      id: "existing-user-123",
      email: mockRequestBody.email,
    });

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(db.query.users.findFirst).toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
    expect(generateSessionToken).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
    expect(setSessionTokenCookie).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Email already exists" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Email already exists" },
      options: { status: 400 },
    });
  });

  it("should return 400 if validation fails", async () => {
    // Setup validation error
    const validationError = new Error("Validation failed");
    registerSchema.parse.mockImplementation(() => {
      throw validationError;
    });

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(registerSchema.parse).toHaveBeenCalled();
    expect(db.query.users.findFirst).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });

  it("should return 400 if password hashing fails", async () => {
    // Setup password hashing error
    const hashingError = new Error("Hashing failed");
    hashPassword.mockRejectedValue(hashingError);

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(hashPassword).toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });

  it("should return 400 if username generation fails", async () => {
    // Setup username generation error
    const usernameError = new Error("Username generation failed");
    generateUsername.mockRejectedValue(usernameError);

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(generateUsername).toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });

  it("should return 400 if database insert fails", async () => {
    // Setup database error
    const dbError = new Error("Database error");
    db.returning.mockRejectedValue(dbError);

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(db.returning).toHaveBeenCalled();
    expect(generateSessionToken).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });

  it("should return 400 if session creation fails", async () => {
    // Setup session error
    const sessionError = new Error("Session creation failed");
    createSession.mockRejectedValue(sessionError);

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(createSession).toHaveBeenCalled();
    expect(setSessionTokenCookie).not.toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });

  it("should return 400 if cookie setting fails", async () => {
    // Setup cookie error
    const cookieError = new Error("Cookie setting failed");
    setSessionTokenCookie.mockRejectedValue(cookieError);

    // Call the function
    const result = await POST(new NextRequest());

    // Assertions
    expect(setSessionTokenCookie).toHaveBeenCalled();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid request" },
      { status: 400 },
    );

    expect(result).toEqual({
      data: { error: "Invalid request" },
      options: { status: 400 },
    });
  });
});
