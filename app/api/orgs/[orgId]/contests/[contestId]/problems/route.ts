import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as problemService from "./service";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import { addProblemSchema, NameIdSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);
    const data = addProblemSchema.parse(await request.json());

    const problem = await problemService.addProblemToContest(
      orgId,
      contestId,
      data.problemCode,
      data.order ?? 0,
    );

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Problem not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Problem already added to contest") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }
    return NextResponse.json(
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

    const problems = await problemService.getContestProblems(orgId, contestId);
    return NextResponse.json(problems);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch contest problems" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);
    const problemCode = NameIdSchema.parse(params.problemId);

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);

    await problemService.removeProblemFromContest(
      orgId,
      contestId,
      problemCode,
    );
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
      { error: "Failed to remove problem from contest" },
      { status: 500 },
    );
  }
}
