import { z } from "zod";
import { db } from "@/db/drizzle";
import { contests } from "@/db/schema";
import { createContestSchema, updateContestSchema } from "@/lib/validations";
import { and, count, eq } from "drizzle-orm";

export async function createContest(
  orgId: number,
  data: z.infer<typeof createContestSchema>,
) {
  return await db.transaction(async (tx) => {
    // Check if a contest with the same nameId exists for this org
    const existingContest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.organizerId, orgId),
        eq(contests.nameId, data.nameId)
      ),
    });

    if (existingContest) {
      throw new Error("Contest with this nameId already exists");
    }

    const [contest] = await tx
      .insert(contests)
      .values({
        ...data,
        organizerId: orgId,
        organizerKind: "org",
      })
      .returning();

    return contest;
  });
}

export async function getOrgContests(orgId: number, limit: number, offset: number) {
  const results = await db.query.contests.findMany({
    where: eq(contests.organizerId, orgId),
    limit,
    offset,
  });

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(contests)
    .where(eq(contests.organizerId, orgId));

  return {
    data: results,
    total,
    limit,
    offset,
  };
}

export async function getContestByNameId(orgId: number, nameId: string) {
  const contest = await db.query.contests.findFirst({
    where: and(
      eq(contests.organizerId, orgId),
      eq(contests.nameId, nameId)
    ),
  });

  if (!contest) {
    throw new Error("Contest not found");
  }

  return contest;
}

export async function updateContest(
  orgId: number,
  nameId: string,
  data: z.infer<typeof updateContestSchema>
) {
  return await db.transaction(async (tx) => {
    // Check if contest exists and belongs to the org
    const contest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.organizerId, orgId),
        eq(contests.nameId, nameId)
      ),
    });

    if (!contest) {
      throw new Error("Contest not found");
    }

    const [updatedContest] = await tx
      .update(contests)
      .set(data)
      .where(eq(contests.id, contest.id))
      .returning();

    return updatedContest;
  });
}

export async function deleteContest(orgId: number, nameId: string) {
  return await db.transaction(async (tx) => {
    // Check if contest exists and belongs to the org
    const contest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.organizerId, orgId),
        eq(contests.nameId, nameId)
      ),
    });

    if (!contest) {
      throw new Error("Contest not found");
    }

    await tx
      .delete(contests)
      .where(eq(contests.id, contest.id));

    return contest;
  });
}
