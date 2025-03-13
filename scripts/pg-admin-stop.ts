import { execSync } from "child_process";

function main() {
  try {
    console.log("\n🛑 Stopping pgAdmin...");
    execSync("docker stop mint-pgadmin && docker rm mint-pgadmin");
    console.log("✅ pgAdmin stopped and container removed!");

    // Remove network if both containers are stopped
    try {
      execSync("docker network rm mint-network");
      console.log("🌐 Network removed!");
    } catch (error) {
      // Network might still be in use by PostgreSQL, ignore error
    }
  } catch (error) {
    console.error("\n❌ Failed to stop pgAdmin:", error);
    process.exit(1);
  }
}

main();
