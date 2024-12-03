import { createProblemSchema, createTestCaseSchema } from "./validation";
import * as problemService from "./service";
import { NextRequest } from "next/server";
import { IdSchema } from "../../../types";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } },
) {
  try {
    const orgId = IdSchema.parse(params.orgId);
    const body = await request.json();

    const { testCases, ...problemData } = body;
    const validatedProblem = createProblemSchema.parse(problemData);
    const validatedTestCases = z
      .array(createTestCaseSchema)
      .min(1)
      .parse(testCases);

    const problem = await problemService.createProblem(
      orgId,
      validatedProblem,
      validatedTestCases,
    );

    return Response.json(problem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to create problem" },
      { status: 500 },
    );
  }
}
