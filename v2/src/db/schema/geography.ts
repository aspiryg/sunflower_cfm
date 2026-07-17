import {
  pgTable,
  integer,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { timestamps, authorship, activeFlag } from "./_shared";

// Geographic hierarchy: regions → governorates → communities (ON DELETE CASCADE).

export const regions = pgTable(
  "regions",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    arabicName: varchar("arabic_name", { length: 100 }),
    code: varchar("code", { length: 10 }).notNull().unique(),
    description: varchar("description", { length: 500 }),
    arabicDescription: varchar("arabic_description", { length: 500 }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("idx_regions_name").on(t.name),
    index("idx_regions_code").on(t.code),
    index("idx_regions_is_active").on(t.isActive),
  ],
);

export const governorates = pgTable(
  "governorates",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    arabicName: varchar("arabic_name", { length: 100 }),
    code: varchar("code", { length: 10 }).notNull(),
    description: varchar("description", { length: 500 }),
    arabicDescription: varchar("arabic_description", { length: 500 }),
    regionId: integer("region_id")
      .notNull()
      .references(() => regions.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    unique("uq_governorates_region_name").on(t.regionId, t.name),
    unique("uq_governorates_region_code").on(t.regionId, t.code),
    index("idx_governorates_region_id").on(t.regionId),
    index("idx_governorates_is_active").on(t.isActive),
  ],
);

export const communities = pgTable(
  "communities",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    arabicName: varchar("arabic_name", { length: 100 }),
    code: varchar("code", { length: 10 }),
    description: varchar("description", { length: 500 }),
    arabicDescription: varchar("arabic_description", { length: 500 }),
    governorateId: integer("governorate_id")
      .notNull()
      .references(() => governorates.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    unique("uq_communities_governorate_name").on(t.governorateId, t.name),
    index("idx_communities_governorate_id").on(t.governorateId),
    index("idx_communities_is_active").on(t.isActive),
  ],
);

export type Region = typeof regions.$inferSelect;
export type Governorate = typeof governorates.$inferSelect;
export type Community = typeof communities.$inferSelect;
