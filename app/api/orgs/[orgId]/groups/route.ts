import { z } from "zod";
import { NextRequest } from "next/server";
import { createGroupSchema } from "./validation";
import * as groupService from "./service";
import { IdSchema } from "@/app/api/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const groups = await groupService.getGroups(orgId);
    return Response.json(groups);
  } catch (error) {
    return Response.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const data = createGroupSchema.parse(await request.json());

    const group = await groupService.createGroup(orgId, data);
    return Response.json(group, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to create group" }, { status: 500 });
  }
}
