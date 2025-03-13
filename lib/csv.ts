import { z } from "zod";

export const CSVUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "organizer"]),
});

export type CSVUser = z.infer<typeof CSVUserSchema>;

export function parseCSV(content: string): CSVUser[] {
  const lines = content.split("\n");
  const users: CSVUser[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [email, role] = line.split(",").map((s) => s.trim());

    try {
      const user = CSVUserSchema.parse({ email, role });
      users.push(user);
    } catch (error) {
      throw new Error(`Invalid data in row ${i + 1}: ${line}`);
    }
  }

  return users;
}
