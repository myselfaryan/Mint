import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSessionToken, createSession } from "@/lib/server/session";
import { setSessionTokenCookie } from "@/lib/server/cookies";
import { verifyPassword } from "@/lib/password";
import { ZodError } from "zod";

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

    const isValidPassword = await verifyPassword(
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
      name: user.name,
      //   role: user.role,
    });
  } catch (error) {
    // Handle Zod validation errors specifically
    if (error instanceof ZodError) {
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return NextResponse.json(
        { error: "Validation failed", details: fieldErrors },
        { status: 400 }
      );
    }

    // Log other errors for debugging
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Invalid request", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
