import { db } from "@/db/drizzle";
import { testCases } from "@/db/schema";
import { z } from "zod";
import { createTestCaseSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { getProblemIdFromCode } from "../../service";

export async function addTestCase(
  orgId: number,
  problemCode: string,
  data: z.infer<typeof createTestCaseSchema>,
) {
  const problemId = await getProblemIdFromCode(orgId, problemCode);
  const [testCase] = await db
    .insert(testCases)
    .values({ ...data, problemId })
    .returning();

  return testCase;
}

export async function getTestCases(orgId: number, problemCode: string) {
  const problemId = await getProblemIdFromCode(orgId, problemCode);
  return await db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
  });
}
