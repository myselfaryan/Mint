import { z } from "zod";
import { NextRequest } from "next/server";
import { addMemberSchema } from "./validation";
import * as memberService from "./service";
import { IdSchema } from "@/app/api/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } },
) {
  try {
    const groupId = IdSchema.parse(params.groupId);
    const data = addMemberSchema.parse(await request.json());

    const member = await memberService.addMember(groupId, data.userId);
    return Response.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { groupId: string; userId: string } },
) {
  try {
    const groupId = IdSchema.parse(params.groupId);
    const userId = IdSchema.parse(params.userId);

    const member = await memberService.removeMember(groupId, userId);
    if (!member) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    return Response.json(member);
  } catch (error) {
    return Response.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
