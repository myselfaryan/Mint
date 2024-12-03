import { db } from "@/db/drizzle";
import { orgs, memberships } from "@/db/schema";

export async function createOrg(data: {
  nameId: string;
  name: string;
  about?: string;
  avatar?: string;
  ownerId: number;
}) {
  return await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(orgs)
      .values({
        nameId: data.nameId,
        name: data.name,
        about: data.about,
        avatar: data.avatar,
      })
      .returning();

    await tx.insert(memberships).values({
      orgId: org.id,
      userId: data.ownerId,
      role: "owner",
    });

    return org;
  });
}
