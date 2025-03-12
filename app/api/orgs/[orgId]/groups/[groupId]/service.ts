import { db } from "@/db/drizzle";
import { groups, groupMemberships, users } from "@/db/schema";
import { eq, and, not, inArray } from "drizzle-orm";

export async function getGroup(orgId: number, groupId: number) {
  const result = await db
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
    .where(and(eq(groups.id, groupId), eq(groups.orgId, orgId)));

  if (result.length === 0) {
    return null;
  }

  // Group the emails
  const { userEmails, ...groupDetails } = result[0];
  return {
    ...groupDetails,
    userEmails: result
      .map((row) => row.userEmails)
      .filter((email): email is string => email !== null),
  };
}

export async function updateGroupMembers(
  orgId: number,
  groupId: number,
  emails: string[],
) {
  await db.transaction(async (tx) => {
    // Verify group belongs to org
    const group = await tx
      .select()
      .from(groups)
      .where(and(eq(groups.id, groupId), eq(groups.orgId, orgId)))
      .limit(1);

      console.log("group selected",group);
      
    if (group.length === 0) {
      throw new Error("Group not found");
    }

    // Get users by emails
    const users_to_keep = await tx
      .select()
      .from(users)
      .where(inArray(users.email, emails));

      console.log("users to keep",users_to_keep);
      
    const user_ids_to_keep = users_to_keep.map((u) => u.id);

    console.log("users ids to keep",user_ids_to_keep);
    // Remove members not in the new list
    await tx
      .delete(groupMemberships)
      .where(
        and(
          eq(groupMemberships.groupId, groupId),
          not(inArray(groupMemberships.userId, user_ids_to_keep)),
        ),
      );

    // Add new members
    for (const user of users_to_keep) {
      await tx
        .insert(groupMemberships)
        .values({
          groupId,
          userId: user.id,
        })
        .onConflictDoNothing();
    }
  });
  return await getGroup(orgId, groupId);
}

export async function deleteGroup(orgId: number, groupId: number) {
  const [deleted] = await db
    .delete(groups)
    .where(and(eq(groups.id, groupId), eq(groups.orgId, orgId)))
    .returning();

  if (!deleted) {
    throw new Error("Group not found");
  }

  return deleted;
}
