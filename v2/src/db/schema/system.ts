import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import {
  notificationType,
  notificationPriority,
  notificationEntityType,
  settingType,
  settingCategory,
  environment,
  sessionType,
  auditAction,
  auditEntityType,
  requestMethod,
} from "./enums";
import { users } from "./users";
import { cases } from "./cases";
import { timestamps, authorship, activeFlag } from "./_shared";

export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    caseId: integer("case_id").references(() => cases.id, {
      onDelete: "cascade",
    }),
    entityType: notificationEntityType("entity_type"),
    entityId: integer("entity_id"),
    type: notificationType("type").notNull(),
    title: varchar("title", { length: 255 }),
    message: text("message"),
    priority: notificationPriority("priority").notNull().default("normal"),
    actionUrl: varchar("action_url", { length: 500 }),
    actionText: varchar("action_text", { length: 100 }),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    isEmailSent: boolean("is_email_sent").notNull().default(false),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    emailError: text("email_error"),
    isPushSent: boolean("is_push_sent").notNull().default(false),
    pushSentAt: timestamp("push_sent_at", { withTimezone: true }),
    pushError: text("push_error"),
    metadata: jsonb("metadata"),
    triggerUserId: integer("trigger_user_id").references(() => users.id),
    triggerAction: varchar("trigger_action", { length: 100 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
    ...activeFlag,
  },
  (t) => [
    index("idx_notifications_user_id").on(t.userId),
    index("idx_notifications_case_id").on(t.caseId),
    index("idx_notifications_type").on(t.type),
    index("idx_notifications_is_read").on(t.isRead),
    index("idx_notifications_created_at").on(t.createdAt),
  ],
);

export const systemSettings = pgTable(
  "system_settings",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
    settingValue: text("setting_value"),
    settingType: settingType("setting_type").notNull().default("string"),
    category: settingCategory("category").notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    description: varchar("description", { length: 1000 }),
    validationRules: jsonb("validation_rules"),
    defaultValue: text("default_value"),
    isPublic: boolean("is_public").notNull().default(false),
    isEncrypted: boolean("is_encrypted").notNull().default(false),
    requiresRestart: boolean("requires_restart").notNull().default(false),
    environment: environment("environment").notNull().default("all"),
    ...activeFlag,
    ...timestamps,
    ...authorship,
  },
  (t) => [
    index("idx_system_settings_key").on(t.settingKey),
    index("idx_system_settings_category").on(t.category),
  ],
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    sessionToken: varchar("session_token", { length: 1000 })
      .notNull()
      .unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    refreshToken: varchar("refresh_token", { length: 1000 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 1000 }),
    deviceInfo: jsonb("device_info"),
    location: varchar("location", { length: 200 }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    isRevoked: boolean("is_revoked").notNull().default(false),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokedBy: integer("revoked_by").references(() => users.id),
    revokeReason: varchar("revoke_reason", { length: 500 }),
    sessionType: sessionType("session_type").notNull().default("web"),
    ...timestamps,
    ...activeFlag,
  },
  (t) => [
    index("idx_user_sessions_user_id").on(t.userId),
    index("idx_user_sessions_expires_at").on(t.expiresAt),
    index("idx_user_sessions_is_revoked").on(t.isRevoked),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    userId: integer("user_id").references(() => users.id), // null = system action
    action: auditAction("action").notNull(),
    entityType: auditEntityType("entity_type"),
    entityId: integer("entity_id"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    fieldChanges: jsonb("field_changes"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    requestMethod: requestMethod("request_method"),
    requestUrl: text("request_url"),
    requestHeaders: jsonb("request_headers"),
    success: boolean("success").notNull().default(true),
    errorMessage: text("error_message"),
    responseCode: integer("response_code"),
    executionTimeMs: integer("execution_time_ms"),
    sessionId: varchar("session_id", { length: 1000 }),
    correlationId: varchar("correlation_id", { length: 100 }),
    riskScore: numeric("risk_score", { precision: 3, scale: 2 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ...activeFlag,
  },
  (t) => [
    index("idx_audit_logs_user_id").on(t.userId),
    index("idx_audit_logs_action").on(t.action),
    index("idx_audit_logs_entity").on(t.entityType, t.entityId),
    index("idx_audit_logs_created_at").on(t.createdAt),
  ],
);

export type Notification = typeof notifications.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
