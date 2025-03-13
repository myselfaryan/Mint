import { seedDatabase } from "@/lib/seeder";

async function main() {
  try {
    await seedDatabase();

    // Print login details
    console.log("\n=== Seeding Complete! ===\n");
    console.log("You can login with any of these credentials:\n");

    console.log("Admin Users:");
    for (let i = 1; i <= 2; i++) {
      console.log(`- Email: admin${i}@example.com`);
    }

    console.log("\nOrganizer Users:");
    for (let i = 1; i <= 3; i++) {
      console.log(`- Email: organizer${i}@example.com`);
    }

    console.log("\nMember Users:");
    for (let i = 1; i <= 5; i++) {
      console.log(`- Email: member${i}@example.com`);
    }

    console.log("\nPassword for all users: password123");

    console.log("\nOrganizations:");
    for (let i = 1; i <= 3; i++) {
      console.log(`- org-${i}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}

main();
