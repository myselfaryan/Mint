import { documentRoute } from "@/lib/swagger/route-docs";
import {
  createOrgSchema,
  updateOrgSchema,
  NameIdSchema,
} from "@/lib/validations";
import { z } from "zod";

documentRoute({
  method: "patch",
  path: "/orgs/{orgId}",
  summary: "Update organization",
  description: "Updates an existing organization",
  tags: ["Organizations"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
    }),
    body: updateOrgSchema,
  },
  responses: {
    200: {
      description: "Organization updated successfully",
      schema: createOrgSchema,
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
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to update organization"),
      }),
    },
  },
});
