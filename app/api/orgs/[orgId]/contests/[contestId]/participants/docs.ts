import { documentRoute } from "@/lib/swagger/route-docs";
import { NameIdSchema, createParticipantSchema } from "@/lib/validations";
import { z } from "zod";

// Document GET /orgs/{orgId}/contests/{contestId}/participants
documentRoute({
  method: "get",
  path: "/orgs/{orgId}/contests/{contestId}/participants",
  summary: "List contest participants",
  description: "Returns all participants in a contest",
  tags: ["Contest Participants"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      contestId: NameIdSchema,
    }),
  },
  responses: {
    200: {
      description: "List of participants",
      schema: z.array(
        z.object({
          id: z.number(),
          email: z.string().email(),
          registeredAt: z.string().datetime(),
        }),
      ),
    },
    404: {
      description: "Organization or contest not found",
      schema: z.object({
        error: z.enum(["Organization not found", "Contest not found"]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Failed to fetch participants"),
      }),
    },
  },
});

// Document POST /orgs/{orgId}/contests/{contestId}/participants
documentRoute({
  method: "post",
  path: "/orgs/{orgId}/contests/{contestId}/participants",
  summary: "Register participant",
  description: "Registers a new participant in the contest",
  tags: ["Contest Participants"],
  request: {
    params: z.object({
      orgId: NameIdSchema,
      contestId: NameIdSchema,
    }),
    body: createParticipantSchema,
  },
  responses: {
    201: {
      description: "Participant registered successfully",
      schema: z.object({
        id: z.number(),
        email: z.string().email(),
        registeredAt: z.string().datetime(),
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
    403: {
      description: "Registration not allowed",
      schema: z.object({
        error: z.enum([
          "User already registered",
          "Registration closed",
          "User not allowed",
          "User disallowed",
        ]),
      }),
    },
    404: {
      description: "Organization, contest, or user not found",
      schema: z.object({
        error: z.enum([
          "Organization not found",
          "Contest not found",
          "User not found",
        ]),
      }),
    },
    500: {
      description: "Internal server error",
      schema: z.object({
        error: z.literal("Registration failed"),
      }),
    },
  },
});
