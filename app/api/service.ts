import { db } from "@/db/drizzle";
import { groups, orgs, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getOrgIdFromNameId(nameId: string): Promise<number> {
  const org = await db
    .select({ id: orgs.id })
    .from(orgs)
    .where(eq(orgs.nameId, nameId))
    .limit(1);

  if (org.length === 0) {
    throw new Error("Organization not found");
  }

  return org[0].id;
}

export async function getUserIdFromNameId(nameId: string): Promise<number> {
  const user = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.nameId, nameId))
    .limit(1);

  if (user.length === 0) {
    throw new Error("User not found");
  }

  return user[0].id;
}

export async function getGroupIdFromNameId(orgId: number, nameId: string): Promise<number> {
  const group = await db
    .select({ id: groups.id })
    .from(groups)
    .where(and(
      eq(groups.nameId, nameId),
      eq(groups.orgId, orgId)
    ))
    .limit(1);

  if (group.length === 0) {
    throw new Error('Group not found');
  }

  return group[0].id;
}
