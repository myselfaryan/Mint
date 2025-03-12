import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NameIdSchema } from "@/lib/validations";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";
import * as problemService from "./service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contestId = await getContestIdFromNameId(orgId, NameIdSchema.parse(params.contestId));
    const problemCode = NameIdSchema.parse(params.problemId);

    const problem = await problemService.getContestProblem(contestId, problemCode);
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
      { error: "Failed to fetch contest problem" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contestId = await getContestIdFromNameId(orgId, NameIdSchema.parse(params.contestId));
    const problemCode = NameIdSchema.parse(params.problemId);
    
    const data = await request.json();
    const order = z.number().int().min(0).parse(data.order);

    const problem = await problemService.updateContestProblem(contestId, problemCode, order);
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
  { params }: { params: { orgId: string; contestId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contestId = await getContestIdFromNameId(orgId, NameIdSchema.parse(params.contestId));
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