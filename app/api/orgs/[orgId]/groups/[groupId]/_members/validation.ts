import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

export const addMemberSchema = z
  .object({
    userId: z.number().int().positive().openapi({
      example: 1,
      description: "User's ID to add to the group",
    }),
  })
  .openapi({
    title: "AddGroupMember",
    description: "Schema for adding a member to a group",
  });
