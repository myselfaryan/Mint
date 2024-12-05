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
        ...data,
        orgId,
      })
      .returning();

    if (testCasesData.length > 0) {
      await tx.insert(testCases).values(
        testCasesData.map((tc) => ({
          ...tc,
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
      problem: {
        id: problems.id,
        nameId: problems.code, // using the new 'code' field as nameId
        title: problems.title,
        description: problems.description,
        allowedLanguages: problems.allowedLanguages,
        createdAt: problems.createdAt,
        orgId: problems.orgId,
      },
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
          createdAt: problem.createdAt.toISOString(), // Convert Date to string
          testCases: [],
        };
      }

      if (testCase !== null && testCase.input !== null) {
        // Check if testCase exists (due to left join)
        acc[problemId].testCases?.push({
          input: testCase.input,
          output: testCase.output,
          kind: testCase.kind ?? "test", // Use default 'test' if kind is null
        });
      }

      return acc;
    },
    {} as Record<number, any>,
  );

  return Object.values(groupedProblems);
}
