import { z } from "zod";
import { db } from "@/db/drizzle";
import { groups, groupMemberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createGroupSchema } from "./validation";

export async function createGroup(
  orgId: number,
  data: z.infer<typeof createGroupSchema>,
) {
  return await db.transaction(async (tx) => {
    const [group] = await tx
      .insert(groups)
      .values({
        ...data,
        orgId,
      })
      .returning();

    return group;
  });
}

export async function addGroupMember(groupId: number, userId: number) {
  return await db.transaction(async (tx) => {
    // Check if already a member
    const existing = await tx.query.groupMemberships.findFirst({
      where: and(
        eq(groupMemberships.groupId, groupId),
        eq(groupMemberships.userId, userId),
      ),
    });

    if (existing) {
      throw new Error("User is already a member");
    }

    const [membership] = await tx
      .insert(groupMemberships)
      .values({
        groupId,
        userId,
      })
      .returning();

    return membership;
  });
}

export async function getGroups(orgId: number) {
  return await db.query.groups.findMany({
    where: eq(groups.orgId, orgId),
  });
}
