import { documentRoute } from "@/lib/swagger/route-docs";
import { updateUserSchema } from "@/lib/validations";
import { IdSchema } from "@/app/api/types";
import { z } from "zod";

// Document PATCH /users/{userId} endpoint
documentRoute({
  method: "patch",
  path: "/users/{userId}",
  summary: "Update a user",
  description: "Updates an existing user with the provided data",
  tags: ["Users"],
  request: {
    params: z.object({
      userId: IdSchema,
    }),
    body: updateUserSchema,
  },
  responses: {
    200: {
      description: "User updated successfully",
      schema: updateUserSchema,
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
      description: "User not found",
      schema: z.object({
        error: z.literal("User not found"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to update user"),
      }),
    },
  },
});
