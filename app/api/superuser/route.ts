import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import {
  users,
  orgs,
  contests,
  memberships,
  problems,
  testCases,
  contestProblems,
  contestParticipants,
  problemSubmissions,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/server/session";
import { count, eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    const { session } = await getCurrentSession();

    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is superuser
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.userId),
    });

    if (!user?.isSuperuser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get platform-wide statistics
    const [
      orgsCount,
      contestsCount,
      usersCount,
      problemsCount,
      submissionsCount,
    ] = await Promise.all([
      db.select({ value: count() }).from(orgs),
      db.select({ value: count() }).from(contests),
      db.select({ value: count() }).from(users),
      db.select({ value: count() }).from(problems),
      db.select({ value: count() }).from(testCases),
    ]);

    // Get organizations with their counts
    const orgsWithStats = await db
      .select({
        id: orgs.id,
        nameId: orgs.nameId,
        name: orgs.name,
        about: orgs.about,
        createdAt: orgs.createdAt,
        contestsCount: sql<number>`count(distinct ${contests.id})::integer`,
        ownerUsers: sql<number>`count(distinct case when ${memberships.role} = 'owner' then ${memberships.userId} end)::integer`,
        organizerUsers: sql<number>`count(distinct case when ${memberships.role} = 'organizer' then ${memberships.userId} end)::integer`,
        memberUsers: sql<number>`count(distinct case when ${memberships.role} = 'member' then ${memberships.userId} end)::integer`,
        problemsCount: sql<number>`count(distinct ${contestProblems.problemId})::integer`,
        submissionsCount: sql<number>`count(distinct ${problemSubmissions.id})::integer`,
      })
      .from(orgs)
      .leftJoin(
        contests,
        sql`${contests.organizerId} = ${orgs.id} AND ${contests.organizerKind} = 'org'`,
      )
      .leftJoin(memberships, eq(memberships.orgId, orgs.id))
      .leftJoin(contestProblems, eq(contestProblems.contestId, contests.id))
      .leftJoin(
        problemSubmissions,
        eq(problemSubmissions.contestProblemId, contestProblems.id),
      )
      .groupBy(orgs.id, orgs.nameId, orgs.name, orgs.about, orgs.createdAt);

    const platformStats = {
      totalOrgs: orgsCount[0].value,
      totalContests: contestsCount[0].value,
      totalUsers: usersCount[0].value,
      totalProblems: problemsCount[0].value,
      totalSubmissions: submissionsCount[0].value,
    };

    return NextResponse.json({
      platformStats,
      organizations: orgsWithStats,
    });
  } catch (error) {
    console.error("Error in superuser route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
