import { z } from "zod";

export const CSVUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["member", "organizer", "owner"]),
  name: z.string().optional(),
});

export type CSVUser = z.infer<typeof CSVUserSchema>;

/**
 * Parse a CSV file containing user data
 * Expected format: email,role[,name]
 * - email: Valid email address (required)
 * - role: member, organizer, or owner (required)
 * - name: Display name (optional)
 *
 * @param content - Raw CSV file content
 * @returns Array of parsed user objects
 */
export function parseCSV(content: string): CSVUser[] {
  const lines = content.split("\n");
  const users: CSVUser[] = [];

  if (lines.length < 2) {
    throw new Error(
      "CSV file must contain a header row and at least one data row",
    );
  }

  // Parse header to determine column order
  const headerLine = lines[0].trim().toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim());

  const emailIndex = headers.findIndex((h) =>
    ["email", "e-mail", "mail"].includes(h),
  );
  const roleIndex = headers.findIndex((h) => ["role", "type"].includes(h));
  const nameIndex = headers.findIndex((h) =>
    ["name", "fullname", "full_name", "display_name"].includes(h),
  );

  // Validate required columns exist
  if (emailIndex === -1) {
    throw new Error('CSV must contain an "email" column');
  }
  if (roleIndex === -1) {
    throw new Error('CSV must contain a "role" column');
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted values in CSV
    const values = parseCSVLine(line);

    const email = values[emailIndex]?.trim();
    const role = values[roleIndex]?.trim().toLowerCase();
    const name = nameIndex !== -1 ? values[nameIndex]?.trim() : undefined;

    if (!email) continue; // Skip empty rows

    try {
      const user = CSVUserSchema.parse({
        email,
        role,
        name: name || undefined,
      });
      users.push(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map((i) => i.message).join(", ");
        throw new Error(`Row ${i + 1}: ${issues} (email: ${email})`);
      }
      throw new Error(`Invalid data in row ${i + 1}: ${line}`);
    }
  }

  return users;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Generate a sample CSV template
 */
export function generateCSVTemplate(): string {
  return `email,role,name
john@example.com,member,John Doe
jane@example.com,organizer,Jane Smith
admin@example.com,owner,Admin User`;
}
