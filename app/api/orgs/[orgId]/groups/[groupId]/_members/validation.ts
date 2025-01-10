import { z } from "zod";

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
});
