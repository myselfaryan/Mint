import { NextRequest } from "next/server";
import { createTestCaseSchema } from "@/lib/validations";
import * as testCaseService from "./service";
import { NameIdSchema } from "@/app/api/types";
import { getOrgIdFromNameId } from "@/app/api/service";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const problemCode = NameIdSchema.parse(params.problemId);
    console.log(params.orgId, orgId, params.problemId, problemCode);
    const testCases = await testCaseService.getTestCases(orgId, problemCode);
    return Response.json(testCases);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Problem not found") {
      return Response.json({ error: error.message }, { status: 404 });
    }
    return Response.json(
      { error: "Failed to fetch test cases" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string; problemId: string } },
) {
  try {
    const orgId = await getOrgIdFromNameId(NameIdSchema.parse(params.orgId));
    const problemCode = NameIdSchema.parse(params.problemId);
    const data = createTestCaseSchema.parse(await request.json());

    const testCase = await testCaseService.addTestCase(
      orgId,
      problemCode,
      data,
    );
    return Response.json(testCase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Problem not found") {
      return Response.json({ error: error.message }, { status: 404 });
    }
    return Response.json(
      { error: "Failed to create test case" },
      { status: 500 },
    );
  }
}
