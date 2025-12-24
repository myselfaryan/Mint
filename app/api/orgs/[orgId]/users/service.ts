import { db } from "@/db/drizzle";
import { users, memberships } from "@/db/schema";
import { inviteUserSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { generateUsername } from "@/lib/username";

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

/**
 * Invite or create a user from CSV import
 * If user exists - add them to the org
 * If user doesn't exist - create account with temporary password and add to org
 */
export async function inviteOrCreateUser(
  orgId: number,
  data: {
    email: string;
    role: "member" | "organizer" | "owner";
    name?: string;
  },
) {
  return await db.transaction(async (tx) => {
    // Check if user already exists
    let existingUsers = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    let userId: number;
    let isNewUser = false;

    if (existingUsers.length === 0) {
      // User doesn't exist - create a new account
      isNewUser = true;

      // Generate a temporary password (user will need to reset)
      const tempPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await hashPassword(tempPassword);

      // Generate a unique username from email
      const emailPrefix = data.email.split("@")[0];
      const nameId = await generateUsername(emailPrefix);

      // Use provided name or extract from email
      const userName = data.name || emailPrefix.replace(/[._-]/g, " ");

      const [newUser] = await tx
        .insert(users)
        .values({
          nameId,
          name: userName,
          email: data.email,
          hashedPassword,
          // Mark account as needing password reset
          about: "Account created via CSV import - password reset required",
        })
        .returning();

      userId = newUser.id;
    } else {
      userId = existingUsers[0].id;
    }

    // Check if user is already a member of this org
    const existingMembership = await tx
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, userId), eq(memberships.orgId, orgId)))
      .limit(1);

    if (existingMembership.length > 0) {
      throw new Error("User is already a member of this organization");
    }

    // Create membership
    const [membership] = await tx
      .insert(memberships)
      .values({
        userId,
        orgId,
        role: data.role,
      })
      .returning();

    return {
      membership,
      isNewUser,
      email: data.email,
    };
  });
}
