import { z } from "zod";

// Common Types
export const NameIdSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .min(2)
  .max(50);
export const EmailSchema = z.string().email();
export const TimestampSchema = z.coerce.date();

// User Schemas
export const createUserSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  email: EmailSchema,
  password: z.string().min(8),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "organizer", "member"]),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["owner", "organizer", "member"]),
});

// Organization Schemas
export const createOrgSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateOrgSchema = createOrgSchema.partial();

export const createMembershipSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(["owner", "organizer", "member"]),
});

// Contest Schemas
export const createContestSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  description: z.string(),
  rules: z.string(),
  registrationStartTime: TimestampSchema,
  registrationEndTime: TimestampSchema,
  startTime: TimestampSchema,
  endTime: TimestampSchema,
  allowList: z.array(z.string()).default([]),
  disallowList: z.array(z.string()).default([]),
});

// Group Schemas
export const createGroupSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  emails: z.array(z.string().email()).optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const updateGroupMembersSchema = z.object({
  emails: z.array(z.string().email()),
});

// Problem Schemas
export const createProblemSchema = z.object({
  code: z.string()
    .regex(/^[a-z0-9-]+$/, "Code must contain only lowercase letters, numbers, and hyphens")
    .min(2)
    .max(50),
  title: z.string().min(2).max(100),
  description: z.string(),
  allowedLanguages: z.array(z.string()),
});

export const problemSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  allowedLanguages: z.array(z.string()),
  createdAt: z.string().datetime(),
  orgId: z.number().int().positive(),
  testCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    kind: z.enum(["example", "test"]).default("test"),
  })),
});

// Test Case Schema
export const createTestCaseSchema = z.object({
  input: z.string(),
  output: z.string(),
  kind: z.enum(["example", "test"]).default("test"),
});

// Participant Schema
export const createParticipantSchema = z.object({
  userId: z.number().int().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = loginSchema
  .extend({
    name: z
      .string()
      .min(2, { message: "Name must be at least 2 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const addProblemSchema = z.object({
  problemId: z.number().int().positive(),
  order: z.number().int().min(0).optional(),
});

// Define the test case schema
export const testCaseSchema = z.object({
  input: z.string(),
  output: z.string(),
  kind: z.enum(["example", "test"]).default("test"),
});

// Define the expected response schema for type safety
export const problemSchema = z.object({
  id: z.number(),
  nameId: z
    .string()
    .length(5)
    .regex(/^[A-Za-z0-9]+$/),
  title: z.string(),
  description: z.string().optional(),
  allowedLanguages: z.array(z.string()),
  createdAt: z.string(),
  orgId: z.number(),
  testCases: z.array(testCaseSchema).optional(),
});

// Frontend Form Schemas
export const registerFormSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: EmailSchema,
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: EmailSchema,
  password: z.string().min(8).max(100),
});

export type LoginFormInput = z.infer<typeof loginFormSchema>;
