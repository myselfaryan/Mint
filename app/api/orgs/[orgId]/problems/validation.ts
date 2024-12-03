import { z } from "zod";

export const createProblemSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string(),
  allowedLanguages: z.array(z.string()),
});

export const createTestCaseSchema = z.object({
  input: z.string(),
  output: z.string(),
  kind: z.enum(["example", "test"]).default("test"),
});
