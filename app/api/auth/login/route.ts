import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSessionToken, createSession } from "@/lib/server/session";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { Argon2id } from "oslo/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const argon2id = new Argon2id();
    const isValidPassword = await argon2id.verify(
      user.hashedPassword,
      validatedData.password,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

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
