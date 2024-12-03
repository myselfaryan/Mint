import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { orgs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().optional(),
  about: z.string().optional(),
  avatar: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const org = await db.query.orgs.findFirst({
    where: eq(orgs.id, Number(params.orgId)),
  });

  return org
    ? NextResponse.json(org)
    : NextResponse.json({ message: "Organization not found" }, { status: 404 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const body = await req.json();
  const validatedData = updateOrgSchema.parse(body);

  const [updatedOrg] = await db
    .update(orgs)
    .set(validatedData)
    .where(eq(orgs.id, Number(params.orgId)))
    .returning();

  return updatedOrg
    ? NextResponse.json(updatedOrg)
    : NextResponse.json({ message: "Organization not found" }, { status: 404 });
}
