import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  bigint,
  jsonb,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import {
  caseHistoryActionType,
  commentType,
  recipientType,
  communicationMethod,
  communicationStatus,
  confidentialityLevel,
  assignmentType,
  assignmentStatus,
  attachmentType,
  attachmentCategory,
  encryptionStatus,
  storageProvider,
  virusScanStatus,
} from "./enums";
import { cases } from "./cases";
import { users } from "./users";
import { caseStatuses } from "./lookups";
import { timestamps, authorship, activeFlag, softDelete } from "./_shared";

// Per-case field-level change log (insert-only; no updatedAt).
export const caseHistory = pgTable(
  "case_history",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    caseId: integer("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    actionType: caseHistoryActionType("action_type").notNull(),
    fieldName: varchar("field_name", { length: 100 }),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    changeDescription: varchar("change_description", { length: 500 }),
    comments: text("comments"),
    assignedTo: integer("assigned_to").references(() => users.id),
    assignedBy: integer("assigned_by").references(() => users.id),
    assignmentComments: text("assignment_comments"),
    statusId: integer("status_id").references(() => caseStatuses.id),
    statusReason: varchar("status_reason", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: integer("created_by").notNull(),
    ...activeFlag,
  },
  (t) => [
    index("idx_case_history_case_id").on(t.caseId),
    index("idx_case_history_action_type").on(t.actionType),
    index("idx_case_history_created_at").on(t.createdAt),
    index("idx_case_history_created_by").on(t.createdBy),
  ],
);

// Threaded case comments (self-referential parent).
export const caseComments = pgTable(
  "case_comments",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    caseId: integer("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    comment: text("comment").notNull(),
    commentType: commentType("comment_type").notNull().default("internal"),
    isInternal: boolean("is_internal").notNull().default(true),
    isPublic: boolean("is_public").notNull().default(false),
    confidentialityLevel: confidentialityLevel("confidentiality_level")
      .notNull()
      .default("internal"),
    recipientType: recipientType("recipient_type"),
    recipientEmail: varchar("recipient_email", { length: 255 }),
    communicationMethod: communicationMethod("communication_method"),
    communicationStatus: communicationStatus("communication_status"),
    attachments: jsonb("attachments"),
    attachmentCount: integer("attachment_count").notNull().default(0),
    parentCommentId: integer("parent_comment_id").references(
      (): AnyPgColumn => caseComments.id,
    ),
    isResponse: boolean("is_response").notNull().default(false),
    responseToUserId: integer("response_to_user_id").references(() => users.id),
    mentionedUsers: jsonb("mentioned_users"),
    tags: varchar("tags", { length: 500 }),
    requiresFollowUp: boolean("requires_follow_up").notNull().default(false),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    followUpCompleted: boolean("follow_up_completed").notNull().default(false),
    followUpCompletedAt: timestamp("follow_up_completed_at", {
      withTimezone: true,
    }),
    isEdited: boolean("is_edited").notNull().default(false),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    editedBy: integer("edited_by"),
    editReason: varchar("edit_reason", { length: 500 }),
    originalComment: text("original_comment"),
    ...timestamps,
    ...authorship,
    ...softDelete,
    ...activeFlag,
  },
  (t) => [
    index("idx_case_comments_case_id").on(t.caseId),
    index("idx_case_comments_parent").on(t.parentCommentId),
    index("idx_case_comments_is_deleted").on(t.isDeleted),
    index("idx_case_comments_created_at").on(t.createdAt),
  ],
);

// Assignment / transfer / escalation history (one row per event).
export const caseAssignments = pgTable(
  "case_assignments",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    caseId: integer("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    assignedTo: integer("assigned_to")
      .notNull()
      .references(() => users.id),
    assignedBy: integer("assigned_by")
      .notNull()
      .references(() => users.id),
    assignmentType: assignmentType("assignment_type")
      .notNull()
      .default("primary"),
    assignmentReason: varchar("assignment_reason", { length: 500 }),
    comments: text("comments"),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expectedCompletionDate: timestamp("expected_completion_date", {
      withTimezone: true,
    }),
    actualCompletionDate: timestamp("actual_completion_date", {
      withTimezone: true,
    }),
    assignmentStatus: assignmentStatus("assignment_status")
      .notNull()
      .default("active"),
    completionComments: text("completion_comments"),
    workloadPercentage: numeric("workload_percentage", {
      precision: 5,
      scale: 2,
    }),
    estimatedHours: numeric("estimated_hours", { precision: 8, scale: 2 }),
    actualHours: numeric("actual_hours", { precision: 8, scale: 2 }),
    transferredTo: integer("transferred_to").references(() => users.id),
    transferredBy: integer("transferred_by").references(() => users.id),
    transferredAt: timestamp("transferred_at", { withTimezone: true }),
    transferReason: varchar("transfer_reason", { length: 500 }),
    escalatedTo: integer("escalated_to").references(() => users.id),
    escalatedBy: integer("escalated_by").references(() => users.id),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    escalationLevel: integer("escalation_level").notNull().default(0),
    escalationReason: varchar("escalation_reason", { length: 500 }),
    responseTime: numeric("response_time", { precision: 10, scale: 2 }),
    resolutionTime: numeric("resolution_time", { precision: 10, scale: 2 }),
    qualityScore: numeric("quality_score", { precision: 3, scale: 2 }),
    ...timestamps,
    ...authorship,
    ...activeFlag,
  },
  (t) => [
    index("idx_case_assignments_case_id").on(t.caseId),
    index("idx_case_assignments_assigned_to").on(t.assignedTo),
    index("idx_case_assignments_status").on(t.assignmentStatus),
  ],
);

// File attachments (default storage provider = Backblaze B2 in v2).
export const caseAttachments = pgTable(
  "case_attachments",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    caseId: integer("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }),
    originalFileName: varchar("original_file_name", { length: 255 }),
    filePath: varchar("file_path", { length: 1000 }),
    fileSize: bigint("file_size", { mode: "number" }),
    fileType: varchar("file_type", { length: 100 }),
    fileExtension: varchar("file_extension", { length: 10 }),
    attachmentType: attachmentType("attachment_type")
      .notNull()
      .default("document"),
    attachmentCategory: attachmentCategory("attachment_category"),
    description: text("description"),
    confidentialityLevel: confidentialityLevel("confidentiality_level"),
    encryptionStatus: encryptionStatus("encryption_status")
      .notNull()
      .default("none"),
    accessControl: jsonb("access_control"),
    storageProvider: storageProvider("storage_provider")
      .notNull()
      .default("b2"),
    storageLocation: varchar("storage_location", { length: 1000 }),
    checksum: varchar("checksum", { length: 128 }),
    downloadCount: integer("download_count").notNull().default(0),
    lastDownloadedAt: timestamp("last_downloaded_at", { withTimezone: true }),
    lastDownloadedBy: integer("last_downloaded_by").references(() => users.id),
    virusScanStatus: virusScanStatus("virus_scan_status")
      .notNull()
      .default("pending"),
    virusScanDate: timestamp("virus_scan_date", { withTimezone: true }),
    virusScanResult: text("virus_scan_result"),
    thumbnailPath: varchar("thumbnail_path", { length: 1000 }),
    previewPath: varchar("preview_path", { length: 1000 }),
    hasPreview: boolean("has_preview").notNull().default(false),
    ...timestamps,
    ...authorship,
    ...softDelete,
    ...activeFlag,
  },
  (t) => [
    index("idx_case_attachments_case_id").on(t.caseId),
    index("idx_case_attachments_is_deleted").on(t.isDeleted),
  ],
);

export type CaseHistoryEntry = typeof caseHistory.$inferSelect;
export type CaseComment = typeof caseComments.$inferSelect;
export type CaseAssignment = typeof caseAssignments.$inferSelect;
export type CaseAttachment = typeof caseAttachments.$inferSelect;
