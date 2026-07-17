import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgresql://cfm:cfm@localhost:5432/cfm",
  },
  // pgvector lives in the "extensions"/public schema; keep verbose for clarity.
  verbose: true,
  strict: true,
});
