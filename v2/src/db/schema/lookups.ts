import {
  pgTable,
  integer,
  varchar,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { timestamps, authorship, activeFlag } from "./_shared";

/**
 * Columns common to every lookup/reference table (bilingual name+description).
 * MUST be a factory: column builders are stateful and get bound to a table, so
 * sharing the same `.unique()` builder across tables makes them all inherit the
 * first table's constraint name. Calling this per table yields fresh builders.
 */
const lookupBase = () => ({
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  arabicName: varchar("arabic_name", { length: 100 }),
  description: varchar("description", { length: 500 }),
  arabicDescription: varchar("arabic_description", { length: 500 }),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").notNull().default(0),
  ...activeFlag,
  ...timestamps,
  ...authorship,
});

export const caseCategories = pgTable(
  "case_categories",
  {
    ...lookupBase(),
    color: varchar("color", { length: 20 }),
  },
  (t) => [
    index("idx_case_categories_name").on(t.name),
    index("idx_case_categories_is_active").on(t.isActive),
    index("idx_case_categories_sort_order").on(t.sortOrder),
  ],
);

export const caseStatuses = pgTable(
  "case_statuses",
  {
    ...lookupBase(),
    color: varchar("color", { length: 20 }).notNull(),
    // Lifecycle behavior flags.
    isInitial: boolean("is_initial").notNull().default(false),
    isFinal: boolean("is_final").notNull().default(false),
    allowReopen: boolean("allow_reopen").notNull().default(true),
  },
  (t) => [
    index("idx_case_statuses_name").on(t.name),
    index("idx_case_statuses_is_active").on(t.isActive),
    index("idx_case_statuses_sort_order").on(t.sortOrder),
    index("idx_case_statuses_is_initial").on(t.isInitial),
    index("idx_case_statuses_is_final").on(t.isFinal),
  ],
);

export const casePriorities = pgTable(
  "case_priorities",
  {
    ...lookupBase(),
    color: varchar("color", { length: 20 }).notNull(),
    level: integer("level").notNull().unique(), // 1 = highest
    // SLA targets (hours).
    responseTimeHours: integer("response_time_hours"),
    resolutionTimeHours: integer("resolution_time_hours"),
    escalationTimeHours: integer("escalation_time_hours"),
  },
  (t) => [
    index("idx_case_priorities_name").on(t.name),
    index("idx_case_priorities_level").on(t.level),
    index("idx_case_priorities_is_active").on(t.isActive),
  ],
);

export const caseChannels = pgTable(
  "case_channels",
  {
    ...lookupBase(),
    color: varchar("color", { length: 20 }),
  },
  (t) => [
    index("idx_case_channels_name").on(t.name),
    index("idx_case_channels_is_active").on(t.isActive),
    index("idx_case_channels_sort_order").on(t.sortOrder),
  ],
);

export const providerTypes = pgTable(
  "provider_types",
  {
    ...lookupBase(),
    color: varchar("color", { length: 20 }),
  },
  (t) => [
    index("idx_provider_types_name").on(t.name),
    index("idx_provider_types_is_active").on(t.isActive),
    index("idx_provider_types_sort_order").on(t.sortOrder),
  ],
);

export type CaseCategory = typeof caseCategories.$inferSelect;
export type CaseStatus = typeof caseStatuses.$inferSelect;
export type CasePriority = typeof casePriorities.$inferSelect;
export type CaseChannel = typeof caseChannels.$inferSelect;
export type ProviderType = typeof providerTypes.$inferSelect;
