import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NameIdSchema } from "@/lib/validations";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import * as problemService from "./service";
import { db } from "@/db/drizzle";
import { problems, contestProblems, contests, testCases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { IdSchema } from "@/app/api/types";

export async function GET(
  request: NextRequest,
  {
    params,
  }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    // Parse and validate parameters
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);
    const problemId = params.problemId;

    // Get numeric orgId
    const orgId = await getOrgIdFromNameId(orgNameId);

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
      return NextResponse.json(
        { message: "Contest not found" },
        { status: 404 },
      );
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
      .where(eq(problems.code, problemId))
      .limit(1);

    if (problemResult.length === 0) {
      return NextResponse.json(
        { message: "Problem not found in this contest" },
        { status: 404 },
      );
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
    const currentIndex = allContestProblems.findIndex((p) => p.order === currentOrder);
    const prevProblemCode = currentIndex > 0 ? allContestProblems[currentIndex - 1].problemCode : null;
    const nextProblemCode = currentIndex < allContestProblems.length - 1 ? allContestProblems[currentIndex + 1].problemCode : null;

    // Combine the data
    const problem = {
      ...problemResult[0].problem,
      contestProblemId: problemResult[0].contestProblem.id,
      testCases: testCasesResult.map((tc) => ({
        input: tc.input,
        output: tc.output,
        kind: tc.kind,
      })),
      orgId,
      contestId,
      prevProblemCode,
      nextProblemCode,
    };

    return NextResponse.json(problem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to fetch problem" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contestId = await getContestIdFromNameId(
      orgId,
      NameIdSchema.parse(params.contestId),
    );
    const problemCode = NameIdSchema.parse(params.problemId);

    const data = await request.json();
    const order = z.number().int().min(0).parse(data.order);

    const problem = await problemService.updateContestProblem(
      contestId,
      problemCode,
      order,
    );
    return NextResponse.json(problem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found" ||
        error.message === "Problem not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update contest problem" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  {
    params,
  }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contestId = await getContestIdFromNameId(
      orgId,
      NameIdSchema.parse(params.contestId),
    );
    const problemCode = NameIdSchema.parse(params.problemId);

    await problemService.removeContestProblem(contestId, problemCode);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found" ||
        error.message === "Problem not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to remove contest problem" },
      { status: 500 },
    );
  }
}
