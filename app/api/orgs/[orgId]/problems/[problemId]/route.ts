import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NameIdSchema, updateProblemSchema } from "@/lib/validations";
import { getOrgIdFromNameId } from "@/app/api/service";
import * as problemService from "./service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const problemCode = NameIdSchema.parse(params.problemId);

    const problem = await problemService.getProblem(orgId, problemCode);
    return NextResponse.json(problem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Problem not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const problemCode = NameIdSchema.parse(params.problemId);
    const data = updateProblemSchema.parse(await request.json());

    const problem = await problemService.updateProblem(orgId, problemCode, data);
    return NextResponse.json(problem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Problem not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { orgId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const problemCode = NameIdSchema.parse(params.problemId);

    await problemService.deleteProblem(orgId, problemCode);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Problem not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Problem is used in contests") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 },
    );
  }
} 