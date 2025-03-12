import { db } from "@/db/drizzle";
import { contestProblems, problems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function addProblemToContest(
  contestId: number,
  problemId: number,
  order: number,
) {
  return await db.transaction(async (tx) => {
    // Verify problem exists
    const problem = await tx.query.problems.findFirst({
      where: eq(problems.id, problemId),
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Add to contest
    const [contestProblem] = await tx
      .insert(contestProblems)
      .values({
        contestId,
        problemId,
        order,
      })
      .returning();

    return contestProblem;
  });
}

export async function getContestProblems(contestId: number) {
  return await db
    .select({
      problemId: problems.id,
      problemNameId: problems.code,
      title: problems.title,
      description: problems.description,
      allowedLanguages: problems.allowedLanguages,
      order: contestProblems.order,
    })
    .from(contestProblems)
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .where(eq(contestProblems.contestId, contestId))
    .orderBy(contestProblems.order);
}

export async function removeProblemFromContest(
  orgId: number,
  contestId: number,
  problemCode: string,
) {
  return await db.transaction(async (tx) => {
    // First, find the problem ID from the problem code
    const problem = await tx.query.problems.findFirst({
      where: and(
        eq(problems.orgId, orgId),
        eq(problems.code, problemCode)
      ),
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Delete the contest problem entry
    const deleted = await tx
      .delete(contestProblems)
      .where(
        and(
          eq(contestProblems.contestId, contestId),
          eq(contestProblems.problemId, problem.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      throw new Error("Problem not found in contest");
    }

    return deleted[0];
  });
}
