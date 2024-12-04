import { z } from "zod";

export const createSubmissionSchema = z.object({
  userId: z.number().int().positive(),
  contestProblemId: z.number().int().positive(),
  content: z.string().min(1).max(65535),
  language: z.enum(["cpp", "javascript", "python"]),
});

export const getSubmissionsQuerySchema = z
  .object({
    userId: z.coerce.number().int().positive().optional(),
    contestProblemId: z.coerce.number().int().positive().optional(),
    status: z
      .enum(["pending", "accepted", "rejected", "processing"])
      .optional(),
  })
  .strict();
