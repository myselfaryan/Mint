import { documentRoute } from "@/lib/swagger/route-docs";
import { NameIdSchema } from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/submissions
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/submissions",
  summary: "List organization submissions",
  description: "Returns all submissions in an organization",
  tags: ["Submissions"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of submissions",
      schema: z.array(
        z.object({
          id: z.number(),
          userId: z.number(),
          problemId: z.number(),
          contestId: z.number().optional(),
          language: z.string(),
          code: z.string(),
          status: z.enum([
            "pending",
            "running",
            "accepted",
            "wrong_answer",
            "time_limit",
            "memory_limit",
            "runtime_error",
            "compilation_error",
          ]),
          score: z.number(),
          createdAt: z.string().datetime(),
        }),
      ),
    },
    404: {
      description: "Organization not found",
      schema: z.object({
        error: z.literal("Organization not found"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to fetch submissions"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/submissions
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/submissions",
  summary: "Create submission",
  description: "Creates a new submission in the organization",
  tags: ["Submissions"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: z.object({
      contestNameId: NameIdSchema.optional(),
      problemCode: NameIdSchema,
      language: z.string(),
      code: z.string(),
    }),
  },
  responses: {
    201: {
      description: "Submission created successfully",
      schema: z.object({
        id: z.number(),
        status: z.literal("pending"),
        createdAt: z.string().datetime(),
      }),
    },
    400: {
      description: "Validation error",
      schema: z.object({
        error: z.array(
          z.object({
            code: z.string(),
            message: z.string(),
            path: z.array(z.string()),
          }),
        ),
      }),
    },
    404: {
      description: "Organization, contest, or problem not found",
      schema: z.object({
        error: z.enum([
          "Organization not found",
          "Contest not found",
          "Problem not found",
        ]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to create submission"),
      }),
    },
  },
});
