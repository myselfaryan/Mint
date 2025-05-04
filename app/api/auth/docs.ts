import { documentRoute } from "@/lib/swagger/route-docs";
import { loginSchema, registerSchema } from "@/lib/validations";
import { z } from "zod";

// Document POST /auth/login
documentRoute({
  method: "post",
  path: "/auth/login",
  summary: "Login",
  description: "Authenticates a user and returns a session token",
  tags: ["Auth"],
  request: {
    body: loginSchema,
  },
  responses: {
    200: {
      description: "Login successful",
      schema: z
        .object({
          _id: z.number().openapi({
            example: 1,
            description: "User's unique ID",
          }),
          email: z.string().email().openapi({
            example: "faculty@iiits.in",
            description: "User's email address",
          }),
          name: z.string().openapi({
            example: "Raj Yadav",
            description: "User's display name",
          }),
        })
        .openapi({
          title: "LoginResponse",
          description: "Response after successful login",
        }),
    },
    400: {
      description: "Validation error",
      schema: z
        .object({
          error: z.array(
            z.object({
              code: z.string().openapi({
                example: "invalid_string",
                description: "Error code",
              }),
              message: z.string().openapi({
                example: "Invalid email format",
                description: "Error message",
              }),
              path: z.array(z.string()).openapi({
                example: ["email"],
                description: "Path to the field with error",
              }),
            }),
          ),
        })
        .openapi({
          title: "ValidationError",
          description: "Validation error details",
        }),
    },
    401: {
      description: "Invalid credentials",
      schema: z
        .object({
          error: z.literal("Invalid email or password").openapi({
            example: "Invalid email or password",
            description: "Authentication error message",
          }),
        })
        .openapi({
          title: "AuthError",
          description: "Authentication error details",
        }),
    },
    500: {
      description: "Internal server error",
      schema: z
        .object({
          error: z.literal("Login failed").openapi({
            example: "Login failed",
            description: "Server error message",
          }),
        })
        .openapi({
          title: "ServerError",
          description: "Server error details",
        }),
    },
  },
});

// Document POST /auth/register
documentRoute({
  method: "post",
  path: "/auth/register",
  summary: "Register",
  description: "Creates a new user account",
  tags: ["Auth"],
  request: {
    body: registerSchema,
  },
  responses: {
    201: {
      description: "Registration successful",
      schema: z
        .object({
          _id: z.number().openapi({
            example: 1,
            description: "User's unique ID",
          }),
          email: z.string().email().openapi({
            example: "faculty@iiits.in",
            description: "User's email address",
          }),
          name: z.string().openapi({
            example: "Raj Yadav",
            description: "User's display name",
          }),
          nameId: z.string().openapi({
            example: "raj-yadav",
            description: "User's unique name ID",
          }),
        })
        .openapi({
          title: "RegisterResponse",
          description: "Response after successful registration",
        }),
    },
    400: {
      description: "Validation error",
      schema: z
        .object({
          error: z.array(
            z.object({
              code: z.string().openapi({
                example: "invalid_string",
                description: "Error code",
              }),
              message: z.string().openapi({
                example: "Password must be at least 8 characters",
                description: "Error message",
              }),
              path: z.array(z.string()).openapi({
                example: ["password"],
                description: "Path to the field with error",
              }),
            }),
          ),
        })
        .openapi({
          title: "ValidationError",
          description: "Validation error details",
        }),
    },
    409: {
      description: "Email already exists",
      schema: z
        .object({
          error: z.literal("Email already exists").openapi({
            example: "Email already exists",
            description: "Conflict error message",
          }),
        })
        .openapi({
          title: "ConflictError",
          description: "Email conflict error details",
        }),
    },
    500: {
      description: "Internal server error",
      schema: z
        .object({
          error: z.literal("Registration failed").openapi({
            example: "Registration failed",
            description: "Server error message",
          }),
        })
        .openapi({
          title: "ServerError",
          description: "Server error details",
        }),
    },
  },
});

// Document POST /auth/logout
documentRoute({
  method: "post",
  path: "/auth/logout",
  summary: "Logout",
  description: "Invalidates the current session",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Logout successful",
      schema: z
        .object({
          message: z.literal("Logged out successfully").openapi({
            example: "Logged out successfully",
            description: "Success message",
          }),
        })
        .openapi({
          title: "LogoutResponse",
          description: "Response after successful logout",
        }),
    },
    500: {
      description: "Internal server error",
      schema: z
        .object({
          error: z.literal("Logout failed").openapi({
            example: "Logout failed",
            description: "Server error message",
          }),
        })
        .openapi({
          title: "ServerError",
          description: "Server error details",
        }),
    },
  },
});
