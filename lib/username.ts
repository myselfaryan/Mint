import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, like } from "drizzle-orm";

export async function generateUsername(email: string): Promise<string> {
  // Get the part before @ and remove all special characters except hyphens
  let baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end

  // If username is empty after cleaning (rare case), use a default
  if (!baseUsername) {
    baseUsername = "user";
  }

  // First try the base username
  const existingUser = await db.query.users.findFirst({
    where: eq(users.nameId, baseUsername),
  });

  if (!existingUser) {
    return baseUsername;
  }

  // If username exists, find how many similar usernames exist to determine next number
  const similarUsers = await db.query.users.findMany({
    where: like(users.nameId, `${baseUsername}-%`),
  });

  // Get the highest number used
  let maxNum = 0;
  for (const user of similarUsers) {
    const match = user.nameId.match(new RegExp(`${baseUsername}-(\\d+)`));
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  }

  // Return next available number
  return `${baseUsername}-${maxNum + 1}`;
}
