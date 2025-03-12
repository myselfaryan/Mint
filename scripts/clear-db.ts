import { clearDatabase } from "@/lib/seeder";

async function main() {
  try {
    await clearDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Failed to clear database:", error);
    process.exit(1);
  }
}

main();