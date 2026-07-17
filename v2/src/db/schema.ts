/*
 * Drizzle schema — populated in Phase 2 (full Case-schema translation from
 * docs/v2/SPEC.md §1). Kept as an empty module in Phase 1 so `db` type-checks
 * and the pgvector-enabled Postgres container has something to migrate against.
 */

// Phase 1 placeholder: prove the migration pipeline end-to-end.
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const migrationSmokeTest = pgTable("_migration_smoke_test", {
  id: serial("id").primaryKey(),
  note: text("note").notNull().default("phase-1 skeleton"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
