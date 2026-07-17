import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loud in real runtime; tests inject their own DATABASE_URL.
  console.warn("[db] DATABASE_URL is not set — database access will fail.");
}

// Single shared pool per server process.
export const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });

export type DB = typeof db;
