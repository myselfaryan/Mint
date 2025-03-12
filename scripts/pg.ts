import { execSync } from 'child_process';

function main() {
  try {
    // Create network if it doesn't exist
    console.log("\n🌐 Setting up Docker network...");
    execSync('docker network create mint-network || true');

    console.log("\n🚀 Starting PostgreSQL...");
    execSync('docker run --name mint-postgres \
      --network mint-network \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_DB=mint \
      -p 5432:5432 \
      -d postgres:15');

    console.log("\n✅ PostgreSQL is running!");
    console.log("\nConnection Details:");
    console.log("  Host: localhost");
    console.log("  Port: 5432");
    console.log("  Database: mint");
    console.log("  Username: postgres");
    console.log("  Password: postgres");
    console.log("\nConnection URL:");
    console.log("  postgres://postgres:postgres@localhost:5432/mint");
  } catch (error) {
    console.error("\n❌ Failed to start PostgreSQL:", error);
    process.exit(1);
  }
}

main();