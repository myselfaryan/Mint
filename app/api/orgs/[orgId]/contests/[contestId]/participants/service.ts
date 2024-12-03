import { db } from "@/db/drizzle";
import { contestParticipants, contests } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function registerParticipant(contestId: number, userId: number) {
  return await db.transaction(async (tx) => {
    const contest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.id, contestId),
        gte(contests.registrationEndTime, new Date()),
        lte(contests.registrationStartTime, new Date()),
      ),
    });

    if (!contest) throw new Error("Contest registration is not open");

    const [participant] = await tx
      .insert(contestParticipants)
      .values({ contestId, userId })
      .returning();

    return participant;
  });
}
