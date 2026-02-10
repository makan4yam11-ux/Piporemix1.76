import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function runDbMigrations() {
  console.log("Running database migrations...");
  try {
    const migrationsPath = path.join(process.cwd(), "migrations");
    await migrate(db, { migrationsFolder: migrationsPath });
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Database migration failed:", error);
  }
}
