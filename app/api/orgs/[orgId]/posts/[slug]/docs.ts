import { documentRoute } from "@/lib/swagger/route-docs";
import { NameIdSchema, updatePostSchema } from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/posts/{slug}
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/posts/{slug}",
  summary: "Get post by slug",
  description: "Returns a specific post by its slug",
  tags: ["Posts"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      slug: z.string().describe("Unique slug for the post"),
    }),
  },
  responses: {
    200: {
      description: "Post details",
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
        author: z.object({
          id: z.number(),
          name: z.string(),
          nameId: z.string(),
        }),
        tags: z.string(),
      }),
    },
    404: {
      description: "Organization or post not found",
      schema: z.object({
        error: z.enum(["Organization not found", "Post not found"]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to fetch post"),
      }),
    },
  },
});

// Document PATCH /orgs/{orgId}/posts/{slug}
documentRoute({
  method: "patch",
  path: "/orgs/{orgId}/posts/{slug}",
  summary: "Update post",
  description: "Updates an existing post",
  tags: ["Posts"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      slug: z.string().describe("Unique slug for the post"),
    }),
    body: updatePostSchema,
  },
  responses: {
    200: {
      description: "Post updated successfully",
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
        author: z.object({
          id: z.number(),
          name: z.string(),
          nameId: z.string(),
        }),
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
    403: {
      description: "Forbidden",
      schema: z.object({
        error: z.literal("Unauthorized"),
      }),
    },
    404: {
      description: "Organization or post not found",
      schema: z.object({
        error: z.enum(["Organization not found", "Post not found"]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to update post"),
      }),
    },
  },
});

// Document DELETE /orgs/{orgId}/posts/{slug}
documentRoute({
  method: "delete",
  path: "/orgs/{orgId}/posts/{slug}",
  summary: "Delete post",
  description: "Deletes an existing post",
  tags: ["Posts"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      slug: z.string().describe("Unique slug for the post"),
    }),
  },
  responses: {
    200: {
      description: "Post deleted successfully",
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
      }),
    },
    401: {
      description: "Unauthorized",
      schema: z.object({
        error: z.literal("Unauthorized"),
      }),
    },
    403: {
      description: "Forbidden",
      schema: z.object({
        error: z.literal("Unauthorized"),
      }),
    },
    404: {
      description: "Organization or post not found",
      schema: z.object({
        error: z.enum(["Organization not found", "Post not found"]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to delete post"),
      }),
    },
  },
});