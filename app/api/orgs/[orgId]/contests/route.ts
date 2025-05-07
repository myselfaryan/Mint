import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createContest, getOrgContests } from "./service";
import { createContestSchema, NameIdSchema } from "@/lib/validations";
import { getOrgIdFromNameId } from "@/app/api/service";

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const data = createContestSchema.parse(await request.json());
    console.log(orgId, data);

    const contest = await createContest(orgId, data);
    return NextResponse.json(contest, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Organization not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "Contest with this nameId already exists") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }
    console.error(error);
    return NextResponse.json(
      { error: `Failed to create contest: ${error}` },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const { searchParams } = req.nextUrl;
    const limit = Math.min(Number(searchParams.get("limit") || 10), 100);
    const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

    const result = await getOrgContests(orgId, limit, offset);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Organization not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch contests" },
      { status: 500 },
    );
  }
}
