import { documentRoute } from "@/lib/swagger/route-docs";
import {
  NameIdSchema,
  createGroupSchema,
  updateGroupSchema,
  updateGroupMembersSchema,
} from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/groups
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/groups",
  summary: "List organization groups",
  description: "Returns all groups in an organization",
  tags: ["Groups"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of groups",
      schema: z.array(
        z.object({
          id: z.number(),
          nameId: NameIdSchema,
          name: z.string(),
          description: z.string().optional(),
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
        error: z.literal("Failed to fetch groups"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/groups
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/groups",
  summary: "Create group",
  description: "Creates a new group in the organization",
  tags: ["Groups"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: createGroupSchema,
  },
  responses: {
    201: {
      description: "Group created successfully",
      schema: z.object({
        id: z.number(),
        nameId: NameIdSchema,
        name: z.string(),
        description: z.string().optional(),
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
      description: "Organization not found",
      schema: z.object({
        error: z.literal("Organization not found"),
      }),
    },
    409: {
      description: "Group already exists",
      schema: z.object({
        error: z.literal("Group with this nameId already exists"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to create group"),
      }),
    },
  },
});
