import { db } from '@/db/drizzle';
import {
  problemSubmissions,
  contestProblems,
  contests,
  problems,
  users
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { createSubmissionSchema } from './validation';

export async function createSubmission(
  orgId: number,
  data: z.infer<typeof createSubmissionSchema>
) {
  return await db.transaction(async (tx) => {
    // Verify contest problem belongs to org's contest
    const contestProblem = await tx
      .select()
      .from(contestProblems)
      .innerJoin(contests, and(
        eq(contests.id, contestProblems.contestId),
        eq(contests.organizerId, orgId),
        eq(contests.organizerKind, 'org')
      ))
      .where(eq(contestProblems.id, data.contestProblemId))
      .limit(1);

    if (contestProblem.length === 0) {
      throw new Error('Contest problem not found in this organization');
    }

    // Verify contest is ongoing
    const now = new Date();
    const contest = contestProblem[0].contests;
    if (now < contest.startTime || now > contest.endTime) {
      throw new Error('Contest is not active');
    }

    const [submission] = await tx
      .insert(problemSubmissions)
      .values({
        ...data,
        status: 'pending',
        submittedAt: now
      })
      .returning();

    return submission;
  });
}

export async function getSubmission(
  orgId: number,
  submissionId: number
) {
  const submissions = await db
    .select({
      submission: problemSubmissions,
      user: {
        id: users.id,
        name: users.name,
        nameId: users.nameId
      },
      contest: {
        id: contests.id,
        name: contests.name,
        nameId: contests.nameId
      },
      problem: {
        id: problems.id,
        title: problems.title
      }
    })
    .from(problemSubmissions)
    .innerJoin(contestProblems, eq(contestProblems.id, problemSubmissions.contestProblemId))
    .innerJoin(contests, and(
      eq(contests.id, contestProblems.contestId),
      eq(contests.organizerId, orgId),
      eq(contests.organizerKind, 'org')
    ))
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .innerJoin(users, eq(users.id, problemSubmissions.userId))
    .where(eq(problemSubmissions.id, submissionId))
    .limit(1);

  return submissions[0] || null;
}

export async function getSubmissions(
  orgId: number,
  filters?: {
    userId?: number;
    contestProblemId?: number;
    status?: string;
  }
) {
  let whereClause = and(
    eq(contests.organizerId, orgId),
    eq(contests.organizerKind, 'org')
  );

  if (filters?.userId) {
    whereClause = and(whereClause, eq(problemSubmissions.userId, filters.userId));
  }
  if (filters?.contestProblemId) {
    whereClause = and(whereClause, eq(problemSubmissions.contestProblemId, filters.contestProblemId));
  }
  if (filters?.status) {
    whereClause = and(whereClause, eq(problemSubmissions.status, filters.status));
  }

  return await db
    .select({
      submission: problemSubmissions,
      user: {
        id: users.id,
        name: users.name,
        nameId: users.nameId
      },
      contest: {
        id: contests.id,
        name: contests.name,
        nameId: contests.nameId
      },
      problem: {
        id: problems.id,
        title: problems.title
      }
    })
    .from(problemSubmissions)
    .innerJoin(contestProblems, eq(contestProblems.id, problemSubmissions.contestProblemId))
    .innerJoin(contests, eq(contests.id, contestProblems.contestId))
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .innerJoin(users, eq(users.id, problemSubmissions.userId))
    .where(whereClause)
    .orderBy(problemSubmissions.submittedAt)
    .limit(50);
}
