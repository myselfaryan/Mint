import { CodeEditorV2 } from "@/components/code-editor-v2";
import { notFound } from "next/navigation";
import { db } from "@/db/drizzle";
import {
  problems,
  contestProblems,
  contests,
  testCases,
  orgs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getProblem(
  orgNameId: string,
  contestNameId: string,
  problemCode: string,
) {
  try {
    // Get org ID from nameId
    const orgResult = await db
      .select({ id: orgs.id })
      .from(orgs)
      .where(eq(orgs.nameId, orgNameId))
      .limit(1);

    if (orgResult.length === 0) {
      console.error("Organization not found:", orgNameId);
      return null;
    }

    const orgId = orgResult[0].id;

    // Find the contest by nameId
    const contestResult = await db
      .select({ id: contests.id })
      .from(contests)
      .where(
        and(
          eq(contests.nameId, contestNameId),
          eq(contests.organizerId, orgId),
          eq(contests.organizerKind, "org"),
        ),
      )
      .limit(1);

    if (contestResult.length === 0) {
      console.error("Contest not found:", contestNameId);
      return null;
    }

    const contestId = contestResult[0].id;

    // Find the problem and its associated contest problem
    const problemResult = await db
      .select({
        problem: problems,
        contestProblem: contestProblems,
      })
      .from(problems)
      .innerJoin(
        contestProblems,
        and(
          eq(contestProblems.problemId, problems.id),
          eq(contestProblems.contestId, contestId),
        ),
      )
      .where(eq(problems.code, problemCode))
      .limit(1);

    if (problemResult.length === 0) {
      console.error("Problem not found in contest:", problemCode);
      return null;
    }

    // Get test cases for the problem
    const testCasesResult = await db
      .select()
      .from(testCases)
      .where(eq(testCases.problemId, problemResult[0].problem.id));

    // Get all problems in this contest to determine prev/next
    const allContestProblems = await db
      .select({
        problemCode: problems.code,
        order: contestProblems.order,
      })
      .from(contestProblems)
      .innerJoin(problems, eq(problems.id, contestProblems.problemId))
      .where(eq(contestProblems.contestId, contestId))
      .orderBy(contestProblems.order);

    // Find current problem index and get prev/next
    const currentOrder = problemResult[0].contestProblem.order;
    const currentIndex = allContestProblems.findIndex(
      (p) => p.order === currentOrder,
    );
    const prevProblemCode =
      currentIndex > 0
        ? allContestProblems[currentIndex - 1].problemCode
        : null;
    const nextProblemCode =
      currentIndex < allContestProblems.length - 1
        ? allContestProblems[currentIndex + 1].problemCode
        : null;

    // Combine the data
    return {
      ...problemResult[0].problem,
      contestProblemId: problemResult[0].contestProblem.id,
      testCases: testCasesResult.map((tc) => ({
        input: tc.input,
        output: tc.output,
        kind: tc.kind,
      })),
      orgId,
      contestId,
      contestNameId,
      orgNameId,
      prevProblemCode,
      nextProblemCode,
    };
  } catch (error) {
    console.error("Error fetching problem:", error);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: { orgId: string; id: string; problemId: string };
}) {
  const problem = await getProblem(params.orgId, params.id, params.problemId);

  if (!problem) {
    notFound();
  }

  return (
    <>
      <CodeEditorV2 problem={problem} />
    </>
  );
}
