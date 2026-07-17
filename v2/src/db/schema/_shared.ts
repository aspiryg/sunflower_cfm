/**
 * Reusable column groups. Spread into pgTable definitions.
 *
 * v2 decision (see docs/v2/SPEC.md): generic audit columns
 * (createdBy/updatedBy/deletedBy) are plain integers, NOT foreign keys to users.
 * v1 wired dozens of these FKs to Users, which add little integrity value and
 * complicate cascade/delete semantics. Real relationships (classification,
 * hierarchy, ownership like assignedTo/submittedBy, case-children → cases,
 * notifications.userId → users) keep their FKs, defined explicitly per table.
 */
import { boolean, integer, timestamp } from "drizzle-orm/pg-core";

/** createdAt + updatedAt (auto-touched on update). */
export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Who created/updated (soft reference to a user id — see file header). */
export const authorship = {
  createdBy: integer("created_by"),
  updatedBy: integer("updated_by"),
};

/** isActive flag used across lookup + transactional tables. */
export const activeFlag = {
  isActive: boolean("is_active").notNull().default(true),
};

/** Soft-delete triplet (users, cases, case_comments, case_attachments). */
export const softDelete = {
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: integer("deleted_by"),
};
