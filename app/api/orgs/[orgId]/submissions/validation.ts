import { z } from "zod";

export const createSubmissionSchema = z.object({
  userId: z.number().int().positive(),
  problemId: z.number().int().positive(),
  content: z.string().min(1, "Code content is required"),
  language: z.string().min(1, "Programming language is required"),
  contestNameId: z.string().min(1, "Contest name ID is required"),
});

export const getSubmissionsQuerySchema = z.object({
  contestId: z.string().optional(),
  userId: z.string().optional(),
  status: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
