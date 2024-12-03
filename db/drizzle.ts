import { config } from 'dotenv';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/node-postgres';

config({ path: '.env.local' });

/*
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
    // ssl: true
  }
}, { schema });
*/

export const db = drizzle(process.env.DATABASE_URL!, { schema });
