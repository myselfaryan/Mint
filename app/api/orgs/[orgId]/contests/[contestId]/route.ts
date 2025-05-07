import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NameIdSchema, updateContestSchema } from "@/lib/validations";
import { getOrgIdFromNameId } from "@/app/api/service";
import { deleteContest, getContestByNameId, updateContest } from "../service";
import { invalidateCacheKey } from "@/lib/cache/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contest = await getContestByNameId(
      orgId,
      NameIdSchema.parse(params.contestId),
    );
    return NextResponse.json(contest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Contest not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch contest" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const data = updateContestSchema.parse(await request.json());

    const contest = await updateContest(
      orgId,
      NameIdSchema.parse(params.contestId),
      data,
    );
    await invalidateCacheKey(`contest:${orgId}:${params.contestId}`);
    return NextResponse.json(contest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Contest not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to update contest" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const contest = await deleteContest(
      orgId,
      NameIdSchema.parse(params.contestId),
    );
    await invalidateCacheKey(`contest:${orgId}:${params.contestId}`);
    return NextResponse.json(contest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Contest not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to delete contest" },
      { status: 500 },
    );
  }
}
