import { documentRoute } from "@/lib/swagger/route-docs";
import { z } from "zod";

// Document POST /seed
documentRoute({
  method: "post",
  path: "/seed",
  summary: "Seed database",
  description:
    "Seeds the database with initial data. Only works if database is empty.",
  tags: ["System"],
  request: {
    body: z
      .object({
        users: z.number().optional().describe("Number of users to create"),
        orgs: z
          .number()
          .optional()
          .describe("Number of organizations to create"),
        contests: z
          .number()
          .optional()
          .describe("Number of contests per organization"),
        problems: z
          .number()
          .optional()
          .describe("Number of problems per organization"),
      })
      .optional(),
  },
  responses: {
    200: {
      description: "Database seeded successfully",
      schema: z.object({
        message: z.literal("Database seeded successfully"),
      }),
    },
    400: {
      description: "Database is not empty",
      schema: z.object({
        error: z.literal("Database is not empty"),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to seed database"),
      }),
    },
  },
});
