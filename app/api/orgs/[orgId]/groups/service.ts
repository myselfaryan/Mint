import { z } from "zod";
import { db } from "@/db/drizzle";
import { groups, groupMemberships, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { createGroupSchema } from "@/lib/validations";

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
  return await db
    .select({
      id: groups.id,
      nameId: groups.nameId,
      name: groups.name,
      about: groups.about,
      avatar: groups.avatar,
      createdAt: groups.createdAt,
      orgId: groups.orgId,
      userEmails: users.email,
    })
    .from(groups)
    .leftJoin(groupMemberships, eq(groupMemberships.groupId, groups.id))
    .leftJoin(users, eq(users.id, groupMemberships.userId))
    .where(eq(groups.orgId, orgId))
    .then((rows) => {
      // Group by group details and collect emails
      const groupMap = new Map();

      rows.forEach((row) => {
        const { userEmails, ...groupDetails } = row;
        if (!groupMap.has(row.id)) {
          groupMap.set(row.id, {
            ...groupDetails,
            userEmails: userEmails ? [userEmails] : [],
          });
        } else if (userEmails) {
          groupMap.get(row.id).userEmails.push(userEmails);
        }
      });

      return Array.from(groupMap.values());
    });
}
