import { db } from "@/db/drizzle";
import { problems, testCases } from "@/db/schema";
import { z } from "zod";
import { createProblemSchema, createTestCaseSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function createProblem(
  orgId: number,
  data: z.infer<typeof createProblemSchema>,
  testCasesData: z.infer<typeof createTestCaseSchema>[],
) {
  return await db.transaction(async (tx) => {
    const [problem] = await tx
      .insert(problems)
      .values({
        code: data.code,
        title: data.title,
        description: data.description,
        allowedLanguages: data.allowedLanguages,
        orgId,
      })
      .returning();

    if (testCasesData.length > 0) {
      await tx.insert(testCases).values(
        testCasesData.map((tc) => ({
          input: tc.input,
          output: tc.output,
          kind: tc.kind,
          problemId: problem.id,
        })),
      );
    }

    return problem;
  });
}

export async function getOrgProblems(orgId: number) {
  const problemsWithTestCases = await db
    .select({
      problem: problems,
      testCase: {
        input: testCases.input,
        output: testCases.output,
        kind: testCases.kind,
      },
    })
    .from(problems)
    .leftJoin(testCases, eq(testCases.problemId, problems.id))
    .where(eq(problems.orgId, orgId));

  // Group test cases by problem
  const groupedProblems = problemsWithTestCases.reduce(
    (acc, row) => {
      const { problem, testCase } = row;
      const problemId = problem.id;

      if (!acc[problemId]) {
        acc[problemId] = {
          ...problem,
          createdAt: problem.createdAt.toISOString(),
          testCases: [],
        };
      }

      if (testCase !== null && testCase.input !== null) {
        acc[problemId].testCases.push({
          input: testCase.input,
          output: testCase.output,
          kind: testCase.kind ?? "test",
        });
      }

      return acc;
    },
    {} as Record<number, any>,
  );

  return Object.values(groupedProblems);
}
