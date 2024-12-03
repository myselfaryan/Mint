import { NextRequest } from "next/server";
import { testCaseSchema } from "./validation";
import * as testCaseService from "./service";
import { IdSchema } from "@/app/api/types";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: { problemId: string } },
) {
  try {
    const problemId = IdSchema.parse(params.problemId);
    const testCases = await testCaseService.getTestCases(problemId);
    return Response.json(testCases);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch test cases" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { problemId: string } },
) {
  try {
    const problemId = IdSchema.parse(params.problemId);
    const data = testCaseSchema.parse(await request.json());

    const testCase = await testCaseService.addTestCase(problemId, data);
    return Response.json(testCase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to create test case" },
      { status: 500 },
    );
  }
}
