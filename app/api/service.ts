import { db } from "@/db/drizzle";
import { contests, groups, orgs, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { withDataCache } from "@/lib/cache/utils";
import { CACHE_TTL } from "@/db/redis";

export async function getOrgIdFromNameId(nameId: string): Promise<number> {
  return withDataCache(
    `org:nameid:${nameId}`,
    async () => {
      const org = await db
        .select({ id: orgs.id })
        .from(orgs)
        .where(eq(orgs.nameId, nameId))
        .limit(1);

      if (org.length === 0) {
        throw new Error("Organization not found");
      }

      return org[0].id;
    },
    CACHE_TTL.LONG,
  );
}

export async function getUserIdFromNameId(nameId: string): Promise<number> {
  return withDataCache(
    `user:nameid:${nameId}`,
    async () => {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.nameId, nameId))
        .limit(1);

      if (user.length === 0) {
        throw new Error("User not found");
      }

      return user[0].id;
    },
    CACHE_TTL.LONG,
  );
}

export async function getGroupIdFromNameId(
  orgId: number,
  nameId: string,
): Promise<number> {
  return withDataCache(
    `group:nameid:${orgId}:${nameId}`,
    async () => {
      const group = await db
        .select({ id: groups.id })
        .from(groups)
        .where(and(eq(groups.nameId, nameId), eq(groups.orgId, orgId)))
        .limit(1);

      if (group.length === 0) {
        throw new Error("Group not found");
      }

      return group[0].id;
    },
    CACHE_TTL.LONG,
  );
}

export async function getContestIdFromNameId(
  orgId: number,
  nameId: string,
): Promise<number> {
  return withDataCache(
    `contest:nameid:${orgId}:${nameId}`,
    async () => {
      const contest = await db
        .select({ id: contests.id })
        .from(contests)
        .where(
          and(
            eq(contests.nameId, nameId),
            eq(contests.organizerId, orgId),
            eq(contests.organizerKind, "org"),
          ),
        )
        .limit(1);

      if (contest.length === 0) {
        throw new Error("Contest not found");
      }

      return contest[0].id;
    },
    CACHE_TTL.LONG,
  );
}
