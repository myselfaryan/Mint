import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSessionToken, createSession } from "@/lib/server/session";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { Argon2id } from "oslo/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const argon2id = new Argon2id();
    const hashedPassword = await argon2id.hash(validatedData.password);

    const [user] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        hashedPassword: hashedPassword,
        name: validatedData.fullName,
      })
      .returning();

    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    await setSessionTokenCookie(token, session.expiresAt);

    return NextResponse.json({
      _id: user.id,
      email: user.email,
      fullName: user.name,
      //   role: user.role,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
