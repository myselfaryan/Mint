import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { generateUsername } from "@/lib/username";
import { prompt } from "enquirer";

async function main() {
  try {
    console.log("\n=== Create Superuser ===\n");

    // Get email
    const { email } = await prompt<{ email: string }>({
      type: "input",
      name: "email",
      message: "Enter email:",
      validate: (value) => value.includes("@") || "Invalid email address",
    });

    // Get password
    const { password } = await prompt<{ password: string }>({
      type: "password",
      name: "password",
      message: "Enter password (min 8 characters):",
      validate: (value) =>
        value.length >= 8 || "Password must be at least 8 characters long",
    });

    // Confirm password
    const { confirmPassword } = await prompt<{ confirmPassword: string }>({
      type: "password",
      name: "confirmPassword",
      message: "Confirm password:",
      validate: (value) => value === password || "Passwords do not match",
    });

    // Generate username from email
    const nameId = await generateUsername(email);

    // Create user
    const hashedPassword = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        nameId,
        name: email.split("@")[0], // Use part before @ as name
        email,
        hashedPassword,
        isSuperuser: true,
      })
      .returning();

    console.log("\nSuperuser created successfully!");
    console.log("Username:", nameId);
    console.log("Email:", email);

    process.exit(0);
  } catch (error) {
    console.error(
      "\nFailed to create superuser:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

main();
