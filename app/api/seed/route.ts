import { NextResponse } from "next/server";
import { seedDatabase, isDatabaseEmpty } from "@/lib/seeder";

export async function POST(request: Request) {
  try {
    // Optional: Check if database is already seeded
    const isEmpty = await isDatabaseEmpty();
    if (!isEmpty) {
      return NextResponse.json(
        { error: "Database is not empty" },
        { status: 400 },
      );
    }

    // Optionally accept custom config
    const config = await request.json().catch(() => undefined);
    await seedDatabase(config);

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error in seed route:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 },
    );
  }
}
