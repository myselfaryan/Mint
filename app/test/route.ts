import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { sql } from "drizzle-orm";

async function debugDatabaseQuery() {
  try {
    console.log("Starting database query debug...");

    // 1. Check database connection
    console.log("Checking database connection...");
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful.");

    // 2. Query users table directly
    console.log("Querying users table...");
    const rawUsers = await db.execute(sql`SELECT * FROM users`);
    console.log("Raw users query result:", rawUsers);

    // 3. Use Drizzle ORM to query users
    console.log("Querying users with Drizzle ORM...");
    const selectedUsers = await db.select().from(users);
    console.log("Selected users:", selectedUsers);

    // 4. Check table schema
    console.log("Checking users table schema...");
    const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log("Users table schema:", tableInfo);

    // 5. Check for any active transactions
    console.log("Checking for active transactions...");
    const activeTransactions = await db.execute(sql`
      SELECT * FROM pg_stat_activity 
      WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%'
    `);
    console.log("Active transactions:", activeTransactions);
  } catch (error) {
    console.error("Error during debugging:", error);
  } finally {
    // Close the database connection if necessary
    // await db.close();
  }
}

async function getData() {
  /*
  const tableInfo = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
  console.log('Users table schema:', tableInfo);

  const rawUsers = await db.execute(sql`SELECT * FROM users`);
  console.log('Raw users query result:', rawUsers);
  */

  const selectedUsers = await db.select({ userId: users.id }).from(users);
  console.log(selectedUsers);
}

// Call the function to insert the seed data
export async function GET() {
  try {
    // await debugDatabaseQuery();
    await getData();
    return Response.json({ message: "Database seeded successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
