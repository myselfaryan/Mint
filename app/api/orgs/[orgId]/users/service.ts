import { db } from "@/db/drizzle";
import { users, memberships } from "@/db/schema";
import { inviteUserSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export async function getOrgUsers(orgId: number) {
  return await db
    .select({
      id: users.id,
      name: users.name,
      nameId: users.nameId,
      email: users.email,
      avatar: users.avatar,
      about: users.about,
      role: memberships.role,
      joinedAt: memberships.joinedAt,
    })
    .from(users)
    .innerJoin(memberships, eq(memberships.userId, users.id))
    .where(eq(memberships.orgId, orgId))
    .orderBy(memberships.joinedAt);
}

export async function inviteUser(
  orgId: number,
  data: z.infer<typeof inviteUserSchema>,
) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (user.length === 0) {
      throw new Error("User not found");
    }

    const existingMembership = await tx
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, user[0].id), eq(memberships.orgId, orgId)),
      )
      .limit(1);

    if (existingMembership.length > 0) {
      throw new Error("User is already a member");
    }

    const [membership] = await tx
      .insert(memberships)
      .values({
        userId: user[0].id,
        orgId,
        role: data.role,
      })
      .returning();

    return membership;
  });
}
