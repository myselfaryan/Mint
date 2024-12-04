import { z } from "zod";

export const bookSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Book name is required"),
  author: z.string().min(1, "Author name is required"),
  pages: z.number().int().positive("Pages must be a positive number"),
  publicationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  copiesAvailable: z
    .number()
    .int()
    .nonnegative("Copies available must be a non-negative number"),
});

export type BookSchema = z.infer<typeof bookSchema>;
