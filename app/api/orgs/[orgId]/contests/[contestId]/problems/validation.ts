import { z } from "zod";

export const addProblemSchema = z.object({
  problemId: z.number().int().positive(),
  order: z.number().int().min(0).optional(),
});
