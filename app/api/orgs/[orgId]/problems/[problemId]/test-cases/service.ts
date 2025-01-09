import { db } from "@/db/drizzle";
import { testCases } from "@/db/schema";
import { z } from "zod";
import { testCaseSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function addTestCase(
  problemId: number,
  data: z.infer<typeof testCaseSchema>,
) {
  const [testCase] = await db
    .insert(testCases)
    .values({ ...data, problemId })
    .returning();

  return testCase;
}

export async function getTestCases(problemId: number) {
  return await db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
  });
}
