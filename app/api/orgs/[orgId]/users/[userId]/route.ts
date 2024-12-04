import { NextRequest, NextResponse } from "next/server";
import * as userService from "./service";
import { IdSchema } from "@/app/api/types";
import { updateUserRoleSchema } from "@/lib/validations";
import { z } from "zod";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { orgId: string; userId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const userId = IdSchema.parse(params.userId);

    const deleted = await userService.removeUserFromOrg(orgId, userId);
    return NextResponse.json(deleted);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to remove user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { orgId: string; userId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const userId = IdSchema.parse(params.userId);
    const { role } = updateUserRoleSchema.parse(await _req.json());

    const updated = await userService.updateUserRole(orgId, userId, role);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to update role" },
      { status: 500 },
    );
  }
}
