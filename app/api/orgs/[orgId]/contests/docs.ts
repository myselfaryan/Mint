import { documentRoute } from "@/lib/swagger/route-docs";
import { createContestSchema, NameIdSchema } from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/contests
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/contests",
  summary: "List organization contests",
  description: "Returns all contests for an organization",
  tags: ["Contests"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of contests",
      schema: z.array(createContestSchema),
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
        error: z.literal("Failed to fetch contests"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/contests
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/contests",
  summary: "Create contest",
  description: "Creates a new contest in the organization",
  tags: ["Contests"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: createContestSchema,
  },
  responses: {
    201: {
      description: "Contest created successfully",
      schema: createContestSchema,
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
      description: "Contest already exists",
      schema: z.object({
        error: z.literal("Contest with this nameId already exists"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to create contest"),
      }),
    },
  },
});
