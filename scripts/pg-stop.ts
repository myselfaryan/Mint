import { execSync } from 'child_process';

function main() {
  try {
    console.log("\n🛑 Stopping PostgreSQL...");
    execSync('docker stop mint-postgres && docker rm mint-postgres');
    console.log("✅ PostgreSQL stopped and container removed!");

    // Remove network if both containers are stopped
    try {
      execSync('docker network rm mint-network');
      console.log("🌐 Network removed!");
    } catch (error) {
      // Network might still be in use by pgAdmin, ignore error
    }
  } catch (error) {
    console.error("\n❌ Failed to stop PostgreSQL:", error);
    process.exit(1);
  }
}

main();