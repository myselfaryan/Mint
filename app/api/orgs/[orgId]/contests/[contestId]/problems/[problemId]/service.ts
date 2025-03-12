import { db } from "@/db/drizzle";
import { problems, contestProblems, testCases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getProblemIdFromCode } from "../../../../problems/service";

export async function getContestProblem(
  contestId: number,
  problemCode: string,
) {
  // First, find the problem ID from the contest problems
  const contestProblemResult = await db
    .select({
      problemId: contestProblems.problemId,
      order: contestProblems.order,
    })
    .from(contestProblems)
    .innerJoin(problems, eq(problems.id, contestProblems.problemId))
    .where(
      and(
        eq(contestProblems.contestId, contestId),
        eq(problems.code, problemCode),
      ),
    )
    .limit(1);

  if (!contestProblemResult[0]) {
    throw new Error("Problem not found");
  }

  const { problemId, order } = contestProblemResult[0];

  // Then, get the problem with its example test cases
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
    columns: {
      id: true,
      code: true,
      title: true,
      description: true,
      allowedLanguages: true,
    },
    with: {
      testCases: {
        where: eq(testCases.kind, "example"),
        columns: {
          input: true,
          output: true,
        },
      },
    },
  });

  if (!problem) {
    throw new Error("Problem not found");
  }

  // Add the order from contest problems
  return {
    ...problem,
    order,
  };
}

export async function updateContestProblem(
  contestId: number,
  problemCode: string,
  order: number,
) {
  return await db.transaction(async (tx) => {
    // Get the problem ID from the code
    const problemId = await getProblemIdFromCode(contestId, problemCode);

    // Update the order
    const [updated] = await tx
      .update(contestProblems)
      .set({ order })
      .where(
        and(
          eq(contestProblems.contestId, contestId),
          eq(contestProblems.problemId, problemId),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error("Problem not found");
    }

    // Return the full problem details
    return await getContestProblem(contestId, problemCode);
  });
}

export async function removeContestProblem(
  contestId: number,
  problemCode: string,
) {
  return await db.transaction(async (tx) => {
    // Get the problem ID from the code
    const problemId = await getProblemIdFromCode(contestId, problemCode);

    // Delete the contest problem association
    const [deleted] = await tx
      .delete(contestProblems)
      .where(
        and(
          eq(contestProblems.contestId, contestId),
          eq(contestProblems.problemId, problemId),
        ),
      )
      .returning();

    if (!deleted) {
      throw new Error("Problem not found");
    }

    return deleted;
  });
}
