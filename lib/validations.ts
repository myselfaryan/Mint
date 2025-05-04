import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

// Base schemas
export const NameIdSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/)
  .openapi({
    example: "iiits",
    description:
      "Unique identifier using lowercase letters, numbers, and hyphens",
  });

export const EmailSchema = z.string().email().openapi({
  example: "faculty@iiits.in",
  description: "Valid email address",
});

export const TimestampSchema = z.string().datetime().openapi({
  example: "2024-03-20T10:00:00Z",
  description: "ISO 8601 datetime string",
});

// User Schemas
export const createUserSchema = z
  .object({
    nameId: NameIdSchema,
    name: z.string().min(2).max(100).openapi({
      example: "Raj Yadav",
      description: "User's display name",
    }),
    email: EmailSchema,
    password: z.string().min(8).openapi({
      example: "SecurePass123!",
      description: "User's password, minimum 8 characters",
    }),
    about: z.string().optional().openapi({
      example: "Professor of Computer Science at IIIT Sri City",
      description: "User's bio or description",
    }),
    avatar: z.string().optional().openapi({
      example: "https://iiits.ac.in/images/faculty/raj-yadav.jpg",
      description: "URL to user's avatar image",
    }),
  })
  .openapi({
    title: "CreateUser",
    description: "Schema for creating a new user",
  });

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true })
  .openapi({ description: "Schema for updating an existing user" });

export const inviteUserSchema = z
  .object({
    email: EmailSchema,
    role: z
      .enum(["owner", "organizer", "member"])
      .openapi({ description: "User's role in the organization" }),
  })
  .openapi({ description: "Schema for inviting a user to an organization" });

export const updateUserRoleSchema = z
  .object({
    role: z
      .enum(["owner", "organizer", "member"])
      .openapi({ description: "New role for the user" }),
  })
  .openapi({ description: "Schema for updating a user's role" });

// Organization Schemas
export const createOrgSchema = z
  .object({
    nameId: NameIdSchema,
    name: z.string().min(2).max(100).openapi({
      example: "Indian Institute of Information Technology, Sri City",
      description: "Organization's display name",
    }),
    about: z.string().optional().openapi({
      example:
        "IIIT Sri City is an Institute of National Importance under MHRD, Government of India",
      description: "Organization's description",
    }),
    avatar: z.string().optional().openapi({
      example: "https://iiits.ac.in/images/logo.png",
      description: "URL to organization's logo",
    }),
  })
  .openapi({
    title: "CreateOrganization",
    description: "Schema for creating a new educational institution",
  });

export const updateOrgSchema = createOrgSchema
  .partial()
  .openapi({ description: "Schema for updating an existing organization" });

export const createMembershipSchema = z
  .object({
    userId: z.number().int().positive().openapi({ description: "User's ID" }),
    role: z
      .enum(["owner", "organizer", "member"])
      .openapi({ description: "User's role in the organization" }),
  })
  .openapi({ description: "Schema for creating an organization membership" });

// Contest Schemas
export const createContestSchema = z
  .object({
    nameId: NameIdSchema,
    name: z.string().min(2).max(100).openapi({
      example: "IIITS Coding Championship 2024",
      description: "Contest's display name",
    }),
    description: z.string().openapi({
      example:
        "Annual competitive programming contest for IIIT Sri City students",
      description: "Contest's detailed description",
    }),
    rules: z.string().openapi({
      example:
        "1. Individual participation only\n2. 3-hour duration\n3. Standard library allowed",
      description: "Contest rules and guidelines",
    }),
    registrationStartTime: TimestampSchema,
    registrationEndTime: TimestampSchema,
    startTime: TimestampSchema,
    endTime: TimestampSchema,
    allowList: z
      .array(z.string().email())
      .default([])
      .openapi({
        example: ["student1@iiits.in", "student2@iiits.in"],
        description: "List of emails allowed to participate",
      }),
    disallowList: z
      .array(z.string().email())
      .default([])
      .openapi({
        example: ["blocked@iiits.in"],
        description: "List of emails not allowed to participate",
      }),
    problems: z.string().optional().openapi({
      example: "A,B,C,D",
      description: "Contest problems configuration",
    }),
  })
  .openapi({
    title: "CreateContest",
    description: "Schema for creating a new contest",
  });

export const updateContestSchema = createContestSchema
  .partial()
  .openapi({ description: "Schema for updating an existing contest" });

// Group Schemas
export const createGroupSchema = z
  .object({
    nameId: NameIdSchema,
    name: z
      .string()
      .min(2)
      .max(100)
      .openapi({ description: "Group's display name" }),
    description: z
      .string()
      .optional()
      .openapi({ description: "Group's description" }),
    emails: z
      .array(z.string().email())
      .optional()
      .openapi({ description: "List of member emails" }),
  })
  .openapi({ description: "Schema for creating a new group" });

export const updateGroupSchema = createGroupSchema
  .partial()
  .openapi({ description: "Schema for updating an existing group" });

export const updateGroupMembersSchema = z
  .object({
    emails: z
      .array(z.string().email())
      .openapi({ description: "Updated list of member emails" }),
  })
  .openapi({ description: "Schema for updating group members" });

// Problem Schemas
export const createProblemSchema = z
  .object({
    code: NameIdSchema,
    title: z.string().min(2).max(100).openapi({
      example: "Two Sum",
      description: "Problem's display title",
    }),
    description: z.string().openapi({
      example:
        "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
      description: "Problem's detailed description",
    }),
    allowedLanguages: z.array(z.string()).openapi({
      example: ["python", "java", "cpp"],
      description: "List of programming languages allowed for submissions",
    }),
    testCases: z
      .array(
        z
          .object({
            input: z.string().openapi({
              example: "[2,7,11,15]\n9",
              description: "Test case input",
            }),
            output: z.string().openapi({
              example: "[0,1]",
              description: "Expected output",
            }),
            kind: z.enum(["example", "test"]).default("test").openapi({
              example: "example",
              description: "Type of test case",
            }),
          })
          .openapi({
            title: "TestCase",
            description: "Test case definition",
          }),
      )
      .openapi({ description: "Problem's test cases" }),
  })
  .openapi({
    title: "CreateProblem",
    description: "Schema for creating a new problem",
  });

export const updateProblemSchema = createProblemSchema.partial().openapi({
  description: "Schema for updating an existing problem",
});

export const problemSchema = z
  .object({
    id: z
      .number()
      .int()
      .positive()
      .openapi({ description: "Problem's unique ID" }),
    code: z
      .string()
      .openapi({ description: "Problem's unique code identifier" }),
    title: z.string().openapi({ description: "Problem's display title" }),
    description: z
      .string()
      .openapi({ description: "Problem's detailed description" }),
    allowedLanguages: z.array(z.string()).openapi({
      description: "List of programming languages allowed for submissions",
    }),
    createdAt: z
      .string()
      .datetime()
      .openapi({ description: "Problem creation timestamp" }),
    orgId: z
      .number()
      .int()
      .positive()
      .openapi({ description: "Organization ID" }),
    testCases: z
      .array(
        z
          .object({
            input: z.string().openapi({ description: "Test case input" }),
            output: z.string().openapi({ description: "Expected output" }),
            kind: z
              .enum(["example", "test"])
              .default("test")
              .openapi({ description: "Type of test case" }),
          })
          .openapi({ description: "Test case definition" }),
      )
      .openapi({ description: "Problem's test cases" }),
  })
  .openapi({ description: "Complete problem schema with test cases" });

// Test Case Schema
export const createTestCaseSchema = z
  .object({
    input: z.string().openapi({ description: "Test case input" }),
    output: z.string().openapi({ description: "Expected output" }),
    kind: z
      .enum(["example", "test"])
      .default("test")
      .openapi({ description: "Type of test case" }),
  })
  .openapi({ description: "Schema for creating a test case" });

// Participant Schema
export const createParticipantSchema = z
  .object({
    email: EmailSchema,
  })
  .openapi({ description: "Schema for registering a participant" });

export const loginSchema = z
  .object({
    email: z.string().email().openapi({
      example: "faculty@iiits.in",
      description: "User's email address",
    }),
    password: z.string().min(8).openapi({
      example: "SecurePass123!",
      description: "User's password",
    }),
  })
  .openapi({
    title: "Login",
    description: "Schema for user login",
  });

export const registerSchema = loginSchema
  .extend({
    name: z.string().min(2).openapi({
      example: "Raj Yadav",
      description: "User's display name",
    }),
    confirmPassword: z.string().min(8).openapi({
      example: "SecurePass123!",
      description: "Password confirmation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .openapi({
    title: "Register",
    description: "Schema for user registration",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const addProblemSchema = z
  .object({
    problemCode: NameIdSchema,
    order: z.number().int().min(0).optional().openapi({
      example: 1,
      description: "Problem's order in the contest",
    }),
  })
  .openapi({
    title: "AddProblem",
    description: "Schema for adding a problem to a contest",
  });

// Define the test case schema
export const testCaseSchema = z
  .object({
    input: z.string().openapi({
      example: "[1,2,3,4]\n6",
      description: "Test case input",
    }),
    output: z.string().openapi({
      example: "[1,2]",
      description: "Expected output",
    }),
    kind: z.enum(["example", "test"]).default("test").openapi({
      example: "example",
      description: "Type of test case",
    }),
  })
  .openapi({
    title: "TestCase",
    description: "Test case schema",
  });

// Post Schemas
export const createPostSchema = z
  .object({
    title: z.string().min(2).max(200).openapi({
      example: "Getting Started with Competitive Programming",
      description: "Post's title",
    }),
    content: z.string().min(1).openapi({
      example: "Competitive programming is a mind sport...",
      description: "Post's content in markdown format",
    }),
    tags: z.string().optional().openapi({
      example: "competitive-programming,algorithms,beginner",
      description: "Comma-separated list of tags",
    }),
  })
  .openapi({
    title: "CreatePost",
    description: "Schema for creating a new post",
  });

export const updatePostSchema = createPostSchema
  .partial()
  .openapi({ description: "Schema for updating an existing post" });
