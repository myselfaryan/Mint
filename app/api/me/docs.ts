import { documentRoute } from "@/lib/swagger/route-docs";
import { z } from "zod";
import { EmailSchema, NameIdSchema } from "@/lib/validations";

documentRoute({
  method: "get",
  path: "/me",
  summary: "Get current user",
  description:
    "Returns the currently authenticated user and their organization memberships",
  tags: ["Users"],
  responses: {
    200: {
      description: "Current user details retrieved successfully",
      schema: z.object({
        id: z.number(),
        email: EmailSchema,
        name: z.string(),
        organizations: z.array(
          z.object({
            id: z.number(),
            name: z.string(),
            nameId: NameIdSchema,
            role: z.enum(["owner", "organizer", "member"]),
          }),
        ),
      }),
    },
    401: {
      description: "Not authenticated",
      schema: z.object({
        error: z.literal("Unauthorized"),
      }),
    },
    404: {
      description: "User not found",
      schema: z.object({
        error: z.literal("User not found"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Internal server error"),
      }),
    },
  },
});
