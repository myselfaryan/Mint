import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createParticipantSchema, NameIdSchema } from "@/lib/validations";
import * as participantService from "./service";
import { getOrgIdFromNameId, getContestIdFromNameId } from "@/app/api/service";

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);
    const data = createParticipantSchema.parse(await request.json());

    const participant = await participantService.registerParticipant(
      orgId,
      contestId,
      data.email,
    );

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message === "User not found") {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (
        error.message === "User already registered" ||
        error.message === "Registration closed" ||
        error.message === "User not allowed" ||
        error.message === "User disallowed"
      ) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);

    const participants = await participantService.getContestParticipants(
      orgId,
      contestId,
    );
    return NextResponse.json(participants);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; contestId: string } },
) {
  try {
    // Validate nameIds first
    const orgNameId = NameIdSchema.parse(params.orgId);
    const contestNameId = NameIdSchema.parse(params.contestId);
    const data = createParticipantSchema.parse(await request.json());

    // Then get numeric IDs
    const orgId = await getOrgIdFromNameId(orgNameId);
    const contestId = await getContestIdFromNameId(orgId, contestNameId);

    await participantService.removeParticipant(orgId, contestId, data.email);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error) {
      if (
        error.message === "Organization not found" ||
        error.message === "Contest not found"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (
        error.message === "User not found" ||
        error.message === "User not registered"
      ) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    return NextResponse.json(
      { error: "Failed to remove participant" },
      { status: 500 },
    );
  }
}
