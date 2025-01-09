import { z } from "zod";
import { db } from "@/db/drizzle";
import { contests } from "@/db/schema";
import { createContestSchema } from "@/lib/validations";
import { count, eq } from "drizzle-orm";

export async function createContest(
  orgId: number,
  data: z.infer<typeof createContestSchema>,
) {
  return await db.transaction(async (tx) => {
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
