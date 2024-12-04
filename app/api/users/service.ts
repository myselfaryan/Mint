import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

export async function createUser(data: {
  nameId: string;
  name: string;
  email: string;
  password: string;
  about?: string;
  avatar?: string;
}) {
  return await db.transaction(async (tx) => {
    const hashedPassword = await hashPassword(data.password);

    const [user] = await tx
      .insert(users)
      .values({
        nameId: data.nameId,
        name: data.name,
        email: data.email,
        hashedPassword,
        about: data.about,
        avatar: data.avatar,
      })
      .returning();

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
    const [deleted] = await tx
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    return deleted;
  });
}
