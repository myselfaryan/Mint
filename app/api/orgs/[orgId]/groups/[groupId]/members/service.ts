import { db } from "@/db/drizzle";
import { groupMemberships } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function addMember(groupId: number, userId: number) {
  const [member] = await db
    .insert(groupMemberships)
    .values({ groupId, userId })
    .returning();

  return member;
}

export async function removeMember(groupId: number, userId: number) {
  const [member] = await db
    .delete(groupMemberships)
    .where(
      and(
        eq(groupMemberships.groupId, groupId),
        eq(groupMemberships.userId, userId),
      ),
    )
    .returning();

  return member;
}
