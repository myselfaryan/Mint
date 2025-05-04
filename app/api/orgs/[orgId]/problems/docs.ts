import { documentRoute } from "@/lib/swagger/route-docs";
import {
  NameIdSchema,
  createProblemSchema,
  problemSchema,
} from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/problems
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/problems",
  summary: "List organization problems",
  description: "Returns all problems in an organization",
  tags: ["Problems"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of problems",
      schema: z.array(problemSchema),
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
        error: z.literal("Failed to fetch problems"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/problems
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/problems",
  summary: "Create problem",
  description: "Creates a new problem in the organization",
  tags: ["Problems"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: createProblemSchema,
  },
  responses: {
    201: {
      description: "Problem created successfully",
      schema: problemSchema,
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
      description: "Organization not found",
      schema: z.object({
        error: z.literal("Organization not found"),
      }),
    },
    409: {
      description: "Problem already exists",
      schema: z.object({
        error: z.literal("Problem with this code already exists"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to create problem"),
      }),
    },
  },
});
