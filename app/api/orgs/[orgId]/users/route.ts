import { NextRequest, NextResponse } from "next/server";
import * as userService from "./service";
import { IdSchema } from "@/app/api/types";
import { inviteUserSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const users = await userService.getOrgUsers(orgId);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const data = inviteUserSchema.parse(await request.json());

    const membership = await userService.inviteUser(orgId, data);
    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to invite user" },
      { status: 500 },
    );
  }
}
