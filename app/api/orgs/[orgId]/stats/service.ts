import { db } from "@/db/drizzle";
import {
  memberships,
  contests,
  problems,
  groups,
  orgs,
  contestProblems,
  problemSubmissions,
} from "@/db/schema";
import { eq, and, sql, gt, lt, count } from "drizzle-orm";

export type Period = "day" | "week" | "month" | "year";

export function getPeriodStart(period: Period): Date {
  const start = new Date();

  switch (period) {
    case "day":
      start.setDate(start.getDate() - 1);
      break;
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return start;
}

export async function getOrgIdFromNameId(nameId: string) {
  const org = await db.query.orgs.findFirst({
    where: eq(orgs.nameId, nameId),
    columns: {
      id: true,
    },
  });

  return org?.id;
}

// First get user's role in the organization
export async function getUserRole(userId: number, orgId: number) {
  const membership = await db.query.memberships.findFirst({
    where: and(eq(memberships.userId, userId), eq(memberships.orgId, orgId)),
  });

  return membership?.role ?? null;
}

// User Stats
export async function getOrgMembersCount(orgId: number) {
  const result = await db
    .select({ value: count() })
    .from(memberships)
    .where(eq(memberships.orgId, orgId));

  return result[0].value;
}

export async function getOrgMembersByRole(orgId: number, role: string) {
  const result = await db
    .select({ value: count() })
    .from(memberships)
    .where(
      and(eq(memberships.orgId, orgId), eq(memberships.role as any, role)),
    );

  return result[0].value;
}

// Contest Stats
export async function getOrgContestsCount(orgId: number) {
  const result = await db
    .select({ value: count() })
    .from(contests)
    .where(
      and(eq(contests.organizerId, orgId), eq(contests.organizerKind, "org")),
    );

  return result[0].value;
}

export async function getOrgRecentContests(orgId: number, period: Period) {
  const start = getPeriodStart(period);

  const result = await db
    .select({ value: count() })
    .from(contests)
    .where(
      and(
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, "org"),
        gt(contests.startTime, start),
      ),
    );

  return result[0].value;
}

export async function getOrgEndedContests(orgId: number) {
  const now = new Date();
  const result = await db
    .select({ value: count() })
    .from(contests)
    .where(
      and(
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, "org"),
        lt(contests.endTime, now),
      ),
    );

  return result[0].value;
}

export async function getOrgUpcomingContests(orgId: number) {
  const now = new Date();
  const result = await db
    .select({ value: count() })
    .from(contests)
    .where(
      and(
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, "org"),
        gt(contests.startTime, now),
      ),
    );

  return result[0].value;
}

// Problem Stats
export async function getOrgProblemsCount(orgId: number) {
  const result = await db
    .select({ value: count() })
    .from(problems)
    .where(eq(problems.orgId, orgId));

  return result[0].value;
}

export async function getOrgRecentProblems(orgId: number, period: Period) {
  const start = getPeriodStart(period);

  const result = await db
    .select({ value: count() })
    .from(problems)
    .where(and(eq(problems.orgId, orgId), gt(problems.createdAt, start)));

  return result[0].value;
}

// Group Stats
export async function getOrgGroupsCount(orgId: number) {
  const result = await db
    .select({ value: count() })
    .from(groups)
    .where(eq(groups.orgId, orgId));

  return result[0].value;
}

export async function getOrgRecentGroups(orgId: number, period: Period) {
  const start = getPeriodStart(period);

  const result = await db
    .select({ value: count() })
    .from(groups)
    .where(and(eq(groups.orgId, orgId), gt(groups.createdAt, start)));

  return result[0].value;
}

export async function getOrgSubmissionsCount(orgId: number) {
  try {
    const result = await db
      .select({ value: count() })
      .from(problemSubmissions)
      .innerJoin(
        contestProblems,
        eq(problemSubmissions.contestProblemId, contestProblems.id),
      )
      .innerJoin(
        contests,
        eq(contestProblems.contestId, contests.id),
      )
      .where(
        and(
          eq(contests.organizerId, orgId),
          eq(contests.organizerKind, "org"),
        )
      );

    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error getting submissions count:", error);
    return 0;
  }
}

export async function getOrgRecentSubmissions(orgId: number, period: Period) {
  try {
    const start = getPeriodStart(period);

    const result = await db
      .select({ value: count() })
      .from(problemSubmissions)
      .innerJoin(
        contestProblems,
        eq(problemSubmissions.contestProblemId, contestProblems.id),
      )
      .innerJoin(
        contests,
        eq(contestProblems.contestId, contests.id),
      )
      .where(
        and(
          eq(contests.organizerId, orgId),
          eq(contests.organizerKind, "org"),
          gt(problemSubmissions.submittedAt, start),
        )
      );

    return result[0]?.value ?? 0;
  } catch (error) {
    console.error("Error getting recent submissions:", error);
    return 0;
  }
}

