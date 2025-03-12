import { z } from "zod";
import { NextRequest } from "next/server";
import { createGroupSchema } from "@/lib/validations";
import * as groupsService from "./service";
import * as groupService from "./[groupId]/service";
import { NameIdSchema } from "@/app/api/types";
import { getOrgIdFromNameId } from "@/app/api/service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));

    const groups = await groupsService.getGroups(orgId);
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
    // console.log("request",await request.json());

    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const requestData = await request.json();
    console.log("request data", requestData);

    // Rename 'users' to 'emails' in the request data
    const { users, ...restRequestData } = requestData;
    const processedData = {
      ...restRequestData,
      emails: users, // Rename 'users' to 'emails'
    };
    console.log("emails", processedData.emails);
    console.log("emails", restRequestData);

    // Now validate with your schema
    const { emails, ...rest } = createGroupSchema.parse(processedData);

    console.log("emails", emails);
    console.log("rest", rest);

    const group = await groupsService.createGroup(orgId, rest);

    if (emails) {
      const groupWithUserEmails = await groupService.updateGroupMembers(
        orgId,
        group.id,
        emails,
      );
      return Response.json(groupWithUserEmails, { status: 201 });
    }

    return Response.json(group, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({ error: "Failed to create group" }, { status: 500 });
  }
}
