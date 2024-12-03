import { z } from "zod";
import { NextRequest } from "next/server";
import { addProblemSchema } from "./validation";
import * as problemService from "./service";
import { IdSchema } from "@/app/api/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { contestId: string; orgId: string } },
) {
  try {
    const contestId = IdSchema.parse(params.contestId);
    const data = addProblemSchema.parse(await request.json());

    const problem = await problemService.addProblemToContest(
      contestId,
      data.problemId,
      data.order ?? 0,
    );

    return Response.json(problem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: "Failed to add problem to contest" },
      { status: 500 },
    );
  }
}
