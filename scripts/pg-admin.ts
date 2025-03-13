import { execSync } from "child_process";

function main() {
  try {
    console.log("\n🚀 Starting pgAdmin...");
    execSync(
      "docker run --name mint-pgadmin \
      --network mint-network \
      -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
      -e PGADMIN_DEFAULT_PASSWORD=admin \
      -e PGADMIN_SERVER_JSON_FILE=/pgadmin4/servers.json \
      -v ${PWD}/scripts/pgadmin-servers.json:/pgadmin4/servers.json \
      -p 5050:80 \
      -d dpage/pgadmin4",
    );

    console.log("\n✅ pgAdmin is running!");
    console.log("\nAccess Details:");
    console.log("  URL: http://localhost:5050");
    console.log("  Email: admin@admin.com");
    console.log("  Password: admin");
    console.log("\nPre-configured PostgreSQL Server:");
    console.log("  Name: Mint Local");
    console.log("  Host: mint-postgres");
    console.log("  Port: 5432");
    console.log("  Database: mint");
    console.log("  Username: postgres");
    console.log("  Password: postgres");
  } catch (error) {
    console.error("\n❌ Failed to start pgAdmin:", error);
    process.exit(1);
  }
}

main();
