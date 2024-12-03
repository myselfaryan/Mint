import { db } from "@/db/drizzle";
import { problems, testCases } from "@/db/schema";
import { z } from "zod";
import { createProblemSchema, createTestCaseSchema } from "@/lib/validations";

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
