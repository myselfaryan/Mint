import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

// Extend Zod with OpenAPI functionality
extendZodWithOpenApi(z);

export const registerParticipantSchema = z
  .object({
    userId: z.number().int().positive().openapi({
      example: 1,
      description: "User's ID to register as participant",
    }),
  })
  .openapi({
    title: "RegisterParticipant",
    description: "Schema for registering a participant in a contest",
  });
