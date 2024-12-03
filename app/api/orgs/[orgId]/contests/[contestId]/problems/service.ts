import { db } from "@/db/drizzle";
import { contestProblems, problems } from "@/db/schema";
import { eq } from "drizzle-orm";

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
