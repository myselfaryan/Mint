import { z } from "zod";
import { EmailSchema, NameIdSchema } from "../types";

export const createUserSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  email: EmailSchema,
  password: z.string().min(8),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });
