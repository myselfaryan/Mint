import { execSync } from 'child_process';

function main() {
  try {
    console.log("\n🔄 Generating migrations...");
    execSync('bunx drizzle-kit generate', { stdio: 'inherit' });

    console.log("\n⬆️  Applying migrations...");
    execSync('bunx drizzle-kit push', { stdio: 'inherit' });

    console.log("\n✅ Database migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();