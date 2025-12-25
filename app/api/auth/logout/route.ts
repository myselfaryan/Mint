import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/session";
import { deleteSessionTokenCookie } from "@/lib/server/cookies";
import { invalidateSession } from "@/lib/server/session";

// This route uses cookies, so it must be dynamic
export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const { session } = await getCurrentSession();

    if (session) {
      await invalidateSession(session.id);
    }

    await deleteSessionTokenCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
