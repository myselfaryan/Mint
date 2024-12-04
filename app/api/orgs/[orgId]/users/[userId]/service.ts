import { db } from "@/db/drizzle";
import { memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function removeUserFromOrg(orgId: number, userId: number) {
  const [deleted] = await db
    .delete(memberships)
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId)))
    .returning();

  if (!deleted) {
    throw new Error("Membership not found");
  }
  return deleted;
}

export async function updateUserRole(
  orgId: number,
  userId: number,
  role: string,
) {
  const [updated] = await db
    .update(memberships)
    .set({ role })
    .where(and(eq(memberships.orgId, orgId), eq(memberships.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("Membership not found");
  }
  return updated;
}
