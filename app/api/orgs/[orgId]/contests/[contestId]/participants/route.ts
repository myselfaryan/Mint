import { z } from "zod";
import { NextRequest } from "next/server";
import { registerParticipantSchema } from "./validation";
import * as participantService from "./service";
import { IdSchema } from "@/app/api/types";

export async function POST(
  request: NextRequest,
  { params }: { params: { contestId: string } },
) {
  try {
    const contestId = IdSchema.parse(params.contestId);
    const data = registerParticipantSchema.parse(await request.json());

    const participant = await participantService.registerParticipant(
      contestId,
      data.userId,
    );

    return Response.json(participant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 },
    );
  }
}
