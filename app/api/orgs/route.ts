import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orgs } from "@/db/schema";
import { count } from "drizzle-orm";
import { createOrgSchema } from "@/lib/validations";
import * as orgsService from "./service";
import { z } from "zod";
import { getCurrentSession } from "@/lib/server/session";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Number(searchParams.get("limit") || 10);
  const offset = Number(searchParams.get("offset") || 0);

  const results = await db.select().from(orgs).limit(limit).offset(offset);
  const total = await db.select({ count: count() }).from(orgs);

  return NextResponse.json({
    data: results,
    total: total[0].count,
    limit,
    offset,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getCurrentSession();
    if (!user || !user.id)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const userId = user.id;

    const data = createOrgSchema.parse(await request.json());
    const org = await orgsService.createOrg(userId, data);
    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to create organization" },
      { status: 500 },
    );
  }
}
