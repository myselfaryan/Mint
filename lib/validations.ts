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
  allowList: z.array(z.string().email()).default([]),
  disallowList: z.array(z.string().email()).default([]),
});

export const updateContestSchema = createContestSchema
  .omit({ nameId: true })
  .partial()
  .refine(
    (data) => {
      // If any time field is provided, ensure they are in correct order
      if (
        data.registrationStartTime ||
        data.registrationEndTime ||
        data.startTime ||
        data.endTime
      ) {
        const regStart = data.registrationStartTime || new Date(0);
        const regEnd = data.registrationEndTime || new Date(0);
        const start = data.startTime || new Date(0);
        const end = data.endTime || new Date(0);

        return (
          regStart <= regEnd &&
          regEnd <= start &&
          start <= end
        );
      }
      return true;
    },
    {
      message: "Invalid time sequence. Registration start ≤ Registration end ≤ Contest start ≤ Contest end",
    }
  );

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
