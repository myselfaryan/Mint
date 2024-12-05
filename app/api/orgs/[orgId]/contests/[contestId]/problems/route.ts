import * as problemService from "./service";
import { IdSchema } from "@/app/api/types";
import { addProblemSchema } from "@/lib/validations";

// /app/api/orgs/[orgId]/contests/[contestId]/problems/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import { NameIdSchema } from "@/app/api/types";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: { contestId: string; orgId: string } },
) {
  try {
    const contestId = IdSchema.parse(params.contestId);
    const data = addProblemSchema.parse(await request.json());

    const problem = await problemService.addProblemToContest(
      contestId,
      data.problemId,
      data.order ?? 0,
    );

    return Response.json(problem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to add problem to contest" },
      { status: 500 },
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);

    const problems = await problemService.getContestProblems(contestId);
    return NextResponse.json(problems);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (
      error instanceof Error &&
      (error.message === "Organization not found" ||
        error.message === "Contest not found")
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to fetch contest problems" },
      { status: 500 },
    );
  }
}
