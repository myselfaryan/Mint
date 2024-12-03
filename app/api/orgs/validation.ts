import { z } from "zod";
import { NameIdSchema } from "../types";

export const createOrgSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateOrgSchema = createOrgSchema.partial();

export const createMembershipSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(["owner", "organizer", "member"]),
});
