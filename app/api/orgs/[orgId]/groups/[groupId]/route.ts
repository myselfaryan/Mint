import { getGroupIdFromNameId, getOrgIdFromNameId } from "@/app/api/service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import * as groupService from "./service";
import { updateGroupMembersSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; groupId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(params.orgId);
    const groupId = await getGroupIdFromNameId(orgId, params.groupId);

    const group = await groupService.getGroup(orgId, groupId);
    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Organization not found" ||
        error.message === "Group not found")
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to fetch group" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string; groupId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(params.orgId);
    const groupId = await getGroupIdFromNameId(orgId, params.groupId);
    const { emails } = updateGroupMembersSchema.parse(await req.json());

    const updated = await groupService.updateGroupMembers(
      orgId,
      groupId,
      emails,
    );
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (
      error instanceof Error &&
      (error.message === "Organization not found" ||
        error.message === "Group not found")
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to update group" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { orgId: string; groupId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(params.orgId);
    const groupId = await getGroupIdFromNameId(orgId, params.groupId);

    const deleted = await groupService.deleteGroup(orgId, groupId);
    return NextResponse.json(deleted);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Organization not found" ||
        error.message === "Group not found")
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to delete group" },
      { status: 500 },
    );
  }
}
