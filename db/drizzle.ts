import { config } from "dotenv";
import { Pool } from "pg";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

config({ path: ".env.local" });

// Create a connection pool for better performance
// Works well with serverless environments like Vercel
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  // Pool settings optimized for serverless/Next.js
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Wait up to 10 seconds for a connection
});

export const db = drizzle(pool, { schema });
