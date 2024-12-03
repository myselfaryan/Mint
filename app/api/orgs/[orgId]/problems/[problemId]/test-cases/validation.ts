import { z } from "zod";

export const testCaseSchema = z.object({
  input: z.string(),
  output: z.string(),
  kind: z.enum(["example", "test"]).default("test"),
});
