import { z } from "zod";
import { db } from "@/db/drizzle";
import { contests } from "@/db/schema";
import { createContestSchema } from "./validation";

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
