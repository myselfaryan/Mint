import { z } from "zod";

export const IdSchema = z.coerce.number().int().positive();

export const NameIdSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(
    /^[a-z0-9-]+$/,
    "Name ID must contain only lowercase letters, numbers, and hyphens",
  );

export const EmailSchema = z.string().email();
export const TimestampSchema = z.coerce.date();
