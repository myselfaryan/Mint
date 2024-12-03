import { z } from "zod";
import { NameIdSchema, TimestampSchema } from "../../../types";

export const createContestSchema = z.object({
  nameId: NameIdSchema,
  name: z.string().min(2).max(100),
  description: z.string(),
  rules: z.string(),
  registrationStartTime: TimestampSchema,
  registrationEndTime: TimestampSchema,
  startTime: TimestampSchema,
  endTime: TimestampSchema,
  allowList: z.array(z.string()),
  disallowList: z.array(z.string()),
});
