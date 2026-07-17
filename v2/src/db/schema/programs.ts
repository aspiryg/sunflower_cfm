import {
  pgTable,
  integer,
  varchar,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { timestamps, authorship, activeFlag } from "./_shared";

// Programmatic hierarchy: programs → projects → activities.
// Projects/activities may be standalone (parent nullable, ON DELETE CASCADE).

export const programs = pgTable(
  "programs",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 200 }).notNull().unique(),
    arabicName: varchar("arabic_name", { length: 200 }),
    code: varchar("code", { length: 20 }).notNull().unique(),
    description: varchar("description", { length: 1000 }),
    arabicDescription: varchar("arabic_description", { length: 1000 }),
    color: varchar("color", { length: 20 }),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("idx_programs_name").on(t.name),
    index("idx_programs_code").on(t.code),
    index("idx_programs_is_active").on(t.isActive),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 200 }).notNull(),
    arabicName: varchar("arabic_name", { length: 200 }),
    code: varchar("code", { length: 20 }).notNull(),
    description: varchar("description", { length: 1000 }),
    arabicDescription: varchar("arabic_description", { length: 1000 }),
    programId: integer("program_id").references(() => programs.id, {
      onDelete: "cascade",
    }),
    color: varchar("color", { length: 20 }),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    unique("uq_projects_program_name").on(t.programId, t.name),
    unique("uq_projects_program_code").on(t.programId, t.code),
    index("idx_projects_program_id").on(t.programId),
    index("idx_projects_is_active").on(t.isActive),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 200 }).notNull(),
    arabicName: varchar("arabic_name", { length: 200 }),
    code: varchar("code", { length: 20 }).notNull(),
    description: varchar("description", { length: 1000 }),
    arabicDescription: varchar("arabic_description", { length: 1000 }),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    color: varchar("color", { length: 20 }),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sort_order").notNull().default(0),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    unique("uq_activities_project_name").on(t.projectId, t.name),
    unique("uq_activities_project_code").on(t.projectId, t.code),
    index("idx_activities_project_id").on(t.projectId),
    index("idx_activities_is_active").on(t.isActive),
  ],
);

export type Program = typeof programs.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Activity = typeof activities.$inferSelect;
