import { documentRoute } from "@/lib/swagger/route-docs";
import { NameIdSchema, createPostSchema, updatePostSchema } from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/posts
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/posts",
  summary: "List organization posts",
  description: "Returns all posts for an organization",
  tags: ["Posts"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    query: z.object({
      limit: z.string().optional().describe("Number of posts to return"),
      offset: z.string().optional().describe("Offset for pagination"),
      search: z.string().optional().describe("Search term"),
    }),
  },
  responses: {
    200: {
      description: "List of posts",
      schema: z.object({
        data: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            content: z.string(),
            orgId: z.number(),
            authorId: z.number(),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime(),
            isPublished: z.boolean(),
            slug: z.string(),
            author: z.object({
              id: z.number(),
              name: z.string(),
              nameId: z.string(),
            }),
            tags: z.string(),
          }),
        ),
        total: z.number(),
        limit: z.number(),
        offset: z.number(),
      }),
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
        error: z.literal("Failed to fetch posts"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/posts
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/posts",
  summary: "Create post",
  description: "Creates a new post in the organization",
  tags: ["Posts"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: createPostSchema,
  },
  responses: {
    201: {
      description: "Post created successfully",
      schema: z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        orgId: z.number(),
        authorId: z.number(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        isPublished: z.boolean(),
        slug: z.string(),
        tags: z.string(),
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
    401: {
      description: "Unauthorized",
      schema: z.object({
        error: z.literal("Unauthorized"),
      }),
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
        error: z.literal("Failed to create post"),
      }),
    },
  },
});