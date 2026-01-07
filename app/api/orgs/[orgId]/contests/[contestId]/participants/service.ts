import { db } from "@/db/drizzle";
import { contestParticipants, contests, users } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function registerParticipant(
  orgId: number,
  contestId: number,
  email: string,
) {
  return await db.transaction(async (tx) => {
    // Find the user by email
    const user = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new Error("User not found");

    // Check if contest registration is open
    const contest = await tx.query.contests.findFirst({
      where: and(
        eq(contests.id, contestId),
        eq(contests.organizerId, orgId),
        gte(contests.registrationEndTime, new Date()),
        lte(contests.registrationStartTime, new Date()),
      ),
    });

    if (!contest) throw new Error("Registration closed");

    // Check if user is already registered
    const existing = await tx.query.contestParticipants.findFirst({
      where: and(
        eq(contestParticipants.contestId, contestId),
        eq(contestParticipants.userId, user.id),
      ),
    });

    if (existing) throw new Error("User already registered");

    const [participant] = await tx
      .insert(contestParticipants)
      .values({ contestId, userId: user.id })
      .returning();

    return participant;
  });
}

export async function getContestParticipants(orgId: number, contestId: number) {
  // Verify the contest belongs to the org
  const contest = await db.query.contests.findFirst({
    where: and(eq(contests.id, contestId), eq(contests.organizerId, orgId)),
  });

  if (!contest) throw new Error("Contest not found");

  const participants = await db
    .select({
      id: contestParticipants.id,
      contestId: contestParticipants.contestId,
      userId: contestParticipants.userId,
      registeredAt: contestParticipants.registeredAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(contestParticipants)
    .innerJoin(users, eq(users.id, contestParticipants.userId))
    .where(eq(contestParticipants.contestId, contestId));

  return participants;
}

export async function removeParticipant(
  orgId: number,
  contestId: number,
  email: string,
) {
  return await db.transaction(async (tx) => {
    // Find the user by email
    const user = await tx.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) throw new Error("User not found");

    // Verify the contest belongs to the org
    const contest = await tx.query.contests.findFirst({
      where: and(eq(contests.id, contestId), eq(contests.organizerId, orgId)),
    });

    if (!contest) throw new Error("Contest not found");

    // Check if user is registered
    const existing = await tx.query.contestParticipants.findFirst({
      where: and(
        eq(contestParticipants.contestId, contestId),
        eq(contestParticipants.userId, user.id),
      ),
    });

    if (!existing) throw new Error("User not registered");

    await tx
      .delete(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.userId, user.id),
        ),
      );

    return { success: true };
  });
}
