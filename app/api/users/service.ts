import { db } from "@/db/drizzle";
import { users, userEmails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export async function createUser(data: {
  nameId: string;
  name: string;
  email: string;
  password: string;
  about?: string;
  avatar?: string;
}) {
  return await db.transaction(async (tx) => {
    const hashedPassword = await hash(data.password, 12);

    const [user] = await tx
      .insert(users)
      .values({
        nameId: data.nameId,
        name: data.name,
        hashedPassword,
        about: data.about,
        avatar: data.avatar,
      })
      .returning();

    await tx.insert(userEmails).values({
      email: data.email,
      userId: user.id,
    });

    return user;
  });
}

export async function updateUser(
  id: number,
  data: Partial<{
    nameId: string;
    name: string;
    about: string;
    avatar: string;
  }>,
) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return updated;
}

export async function deleteUser(id: number) {
  return await db.transaction(async (tx) => {
    await tx.delete(userEmails).where(eq(userEmails.userId, id));
    const [deleted] = await tx
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  });
}
