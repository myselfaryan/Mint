import { db } from "@/db/drizzle";
import { problems, contestProblems, testCases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { updateProblemSchema } from "@/lib/validations";
import { withDataCache } from "@/lib/cache/utils";
import { CACHE_TTL } from "@/db/redis";

export async function getProblem(orgId: number, code: string) {
  return withDataCache(
    `org:problem:${orgId}:${code}`,
    async () => {
      const problem = await db.query.problems.findFirst({
        where: and(eq(problems.orgId, orgId), eq(problems.code, code)),
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

      return problem;
    },
    CACHE_TTL.MEDIUM,
  );
}

export async function updateProblem(
  orgId: number,
  code: string,
  data: z.infer<typeof updateProblemSchema>,
) {
  return await db.transaction(async (tx) => {
    // Check if problem exists and belongs to org
    const problem = await tx.query.problems.findFirst({
      where: and(eq(problems.orgId, orgId), eq(problems.code, code)),
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Update the problem
    const [updated] = await tx
      .update(problems)
      .set(data)
      .where(eq(problems.id, problem.id))
      .returning();

    return updated;
  });
}

export async function deleteProblem(orgId: number, code: string) {
  return await db.transaction(async (tx) => {
    // Check if problem exists and belongs to org
    const problem = await tx.query.problems.findFirst({
      where: and(eq(problems.orgId, orgId), eq(problems.code, code)),
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    // Check if problem is used in any contests
    const contestProblem = await tx.query.contestProblems.findFirst({
      where: eq(contestProblems.problemId, problem.id),
    });

    if (contestProblem) {
      throw new Error("Problem is used in contests");
    }

    // Delete the problem
    const [deleted] = await tx
      .delete(problems)
      .where(eq(problems.id, problem.id))
      .returning();

    return deleted;
  });
}
