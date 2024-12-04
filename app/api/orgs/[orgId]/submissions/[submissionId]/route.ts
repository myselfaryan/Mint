import { z } from "zod";
import { IdSchema } from "@/app/api/types";
import { NextRequest, NextResponse } from "next/server";
import * as submissionService from "../service";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; submissionId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const submissionId = IdSchema.parse(params.submissionId);

    const submission = await submissionService.getSubmission(
      orgId,
      submissionId,
    );
    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to fetch submission" },
      { status: 500 },
    );
  }
}
