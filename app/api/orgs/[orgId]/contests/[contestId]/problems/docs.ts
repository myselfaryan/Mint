import { documentRoute } from "@/lib/swagger/route-docs";
import {
  NameIdSchema,
  problemSchema,
  addProblemSchema,
} from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/contests/{contestId}/problems
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/contests/{contestId}/problems",
  summary: "List contest problems",
  description: "Returns all problems in a contest",
  tags: ["Contest Problems"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      contestId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of problems",
      schema: z.array(problemSchema),
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
      description: "Organization or contest not found",
      schema: z.object({
        error: z.enum(["Organization not found", "Contest not found"]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to fetch contest problems"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/contests/{contestId}/problems
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/contests/{contestId}/problems",
  summary: "Add problem to contest",
  description: "Adds an existing problem to a contest",
  tags: ["Contest Problems"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      contestId: NameIdSchema,
    }),
    body: addProblemSchema,
  },
  responses: {
    201: {
      description: "Problem added to contest successfully",
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
      description: "Organization, contest, or problem not found",
      schema: z.object({
        error: z.enum([
          "Organization not found",
          "Contest not found",
          "Problem not found",
        ]),
      }),
    },
    409: {
      description: "Problem already in contest",
      schema: z.object({
        error: z.literal("Problem already exists in contest"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to add problem to contest"),
      }),
    },
  },
});
