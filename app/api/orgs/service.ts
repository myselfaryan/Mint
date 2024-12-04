import { db } from "@/db/drizzle";
import { orgs, memberships } from "@/db/schema";
import { z } from "zod";
import { createOrgSchema } from "./validation";

export async function createOrg(
  userId: number,
  data: z.infer<typeof createOrgSchema>,
) {
  return await db.transaction(async (tx) => {
    const [org] = await tx.insert(orgs).values(data).returning();

    await tx.insert(memberships).values({
      orgId: org.id,
      userId,
      role: "owner",
    });

    return org;
  });
}
