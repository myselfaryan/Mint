import { NextRequest, NextResponse } from "next/server";
import {
  createSubmissionSchema,
  getSubmissionsQuerySchema,
} from "./validation";
import { IdSchema } from "@/app/api/types";
import { z } from "zod";
import * as submissionService from "./service";
import { getOrgIdFromNameId } from "@/app/api/service";
import { NameIdSchema } from "@/app/api/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    // Validate orgId format
    const orgNameId = NameIdSchema.parse(params.orgId);

    // Get numeric orgId
    const orgId = await getOrgIdFromNameId(orgNameId);
    console.log("orgid=", orgId);

    const submissions = await submissionService.getOrgSubmissions(orgId);
    console.log("sub", submissions);

    return NextResponse.json(submissions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Organization not found") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}

/*
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const filters = getSubmissionsQuerySchema.parse(searchParams);

    const submissions = await submissionService.getSubmissions(orgId, filters);
    return NextResponse.json(submissions);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
*/

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const data = createSubmissionSchema.parse(await request.json());

    const submission = await submissionService.createSubmission(orgId, data);
    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to create submission" },
      { status: 500 },
    );
  }
}
