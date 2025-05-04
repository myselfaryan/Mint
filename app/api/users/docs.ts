import { documentRoute } from "@/lib/swagger/route-docs";
import { createUserSchema } from "@/lib/validations";
import { z } from "zod";

// Document POST /users endpoint
documentRoute({
  method: "post",
  path: "/users",
  summary: "Create a new user",
  description: "Creates a new user with the provided data",
  tags: ["Users"],
  request: {
    body: createUserSchema,
  },
  responses: {
    201: {
      description: "User created successfully",
      schema: createUserSchema,
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
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.string(),
      }),
    },
  },
});
