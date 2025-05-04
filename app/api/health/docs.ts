import { documentRoute } from "@/lib/swagger/route-docs";
import { z } from "zod";

documentRoute({
  method: "get",
  path: "/health",
  summary: "Health check endpoint",
  description:
    "Returns the health status of the application and its dependencies",
  tags: ["System"],
  responses: {
    200: {
      description: "System is healthy",
      schema: z.object({
        status: z.literal("healthy"),
        timestamp: z.string(),
      }),
    },
    503: {
      description: "System is unhealthy",
      schema: z.object({
        status: z.literal("unhealthy"),
        error: z.string(),
        timestamp: z.string(),
      }),
    },
  },
});
