import { z } from "zod";
import { NameIdSchema } from "../../../types";

export const createGroupSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export const addGroupMemberSchema = z.object({
  userId: z.number().int().positive(),
});
