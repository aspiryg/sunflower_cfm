/**
 * Postgres enums — translated from v1's CHECK-constrained NVARCHAR columns
 * (docs/v2/SPEC.md §1, §4). Nullable columns keep NULL out of the enum and just
 * allow null on the column (v1 sometimes listed NULL inside the CHECK).
 */
import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
  "user",
  "staff",
  "manager",
  "admin",
  "super_admin",
]);

// ---- Cases ----
export const urgencyLevel = pgEnum("urgency_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const confidentialityLevel = pgEnum("confidentiality_level", [
  "public",
  "internal",
  "restricted",
  "confidential",
]);

export const providerGender = pgEnum("provider_gender", [
  "male",
  "female",
  "other",
  "prefer_not_to_say",
]);

export const providerAgeGroup = pgEnum("provider_age_group", [
  "under_18",
  "18_25",
  "26_35",
  "36_50",
  "51_65",
  "over_65",
]);

export const providerDisabilityStatus = pgEnum("provider_disability_status", [
  "none",
  "physical",
  "visual",
  "hearing",
  "cognitive",
  "multiple",
  "prefer_not_to_say",
]);

export const followUpContactMethod = pgEnum("follow_up_contact_method", [
  "email",
  "phone",
  "in_person",
  "sms",
  "none",
]);

export const resolutionCategory = pgEnum("resolution_category", [
  "resolved",
  "closed_no_action",
  "referred",
  "duplicate",
  "withdrawn",
]);

export const resolutionSatisfaction = pgEnum("resolution_satisfaction", [
  "very_satisfied",
  "satisfied",
  "neutral",
  "dissatisfied",
  "very_dissatisfied",
]);

// ---- Case history ----
export const caseHistoryActionType = pgEnum("case_history_action_type", [
  "CREATION",
  "STATUS_CHANGE",
  "ASSIGNMENT_CHANGE",
  "PRIORITY_CHANGE",
  "CATEGORY_CHANGE",
  "UPDATE",
  "COMMENT_ADDED",
  "ESCALATION",
  "RESOLUTION",
]);

// ---- Case comments ----
export const commentType = pgEnum("comment_type", [
  "internal",
  "external",
  "resolution",
  "escalation",
  "follow_up",
  "status_update",
  "assignment",
]);

export const recipientType = pgEnum("recipient_type", [
  "case_provider",
  "team_member",
  "manager",
  "external_partner",
  "system",
]);

export const communicationMethod = pgEnum("communication_method", [
  "email",
  "phone",
  "in_person",
  "system",
  "sms",
  "video_call",
]);

export const communicationStatus = pgEnum("communication_status", [
  "sent",
  "delivered",
  "read",
  "failed",
  "pending",
]);

// ---- Case assignments ----
export const assignmentType = pgEnum("assignment_type", [
  "primary",
  "secondary",
  "reviewer",
  "escalated",
  "temporary",
  "collaborative",
]);

export const assignmentStatus = pgEnum("assignment_status", [
  "active",
  "completed",
  "transferred",
  "escalated",
  "cancelled",
  "on_hold",
]);

// ---- Case attachments ----
export const attachmentType = pgEnum("attachment_type", [
  "document",
  "image",
  "audio",
  "video",
  "other",
]);

export const attachmentCategory = pgEnum("attachment_category", [
  "evidence",
  "correspondence",
  "resolution",
  "support",
  "identity",
]);

export const encryptionStatus = pgEnum("encryption_status", [
  "none",
  "encrypted",
  "password_protected",
]);

// v1 allowed local/azure/aws/google/onedrive; v2 default is Backblaze B2 ("b2").
export const storageProvider = pgEnum("storage_provider", [
  "local",
  "b2",
  "azure",
  "aws",
  "google",
  "onedrive",
]);

export const virusScanStatus = pgEnum("virus_scan_status", [
  "pending",
  "clean",
  "infected",
  "quarantined",
  "failed",
  "skipped",
]);

// ---- Notifications ----
export const notificationType = pgEnum("notification_type", [
  "case_assigned",
  "case_updated",
  "case_status_changed",
  "comment_added",
  "escalation",
  "due_date_reminder",
  "case_resolved",
  "assignment_transferred",
  "quality_review_required",
]);

export const notificationPriority = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
  "urgent",
]);

export const notificationEntityType = pgEnum("notification_entity_type", [
  "case",
  "user",
  "assignment",
  "comment",
  "attachment",
]);

// ---- System settings ----
export const settingType = pgEnum("setting_type", [
  "string",
  "number",
  "boolean",
  "json",
  "encrypted",
]);

export const settingCategory = pgEnum("setting_category", [
  "email",
  "notification",
  "sla",
  "security",
  "ui",
  "integration",
  "general",
]);

export const environment = pgEnum("environment", [
  "development",
  "staging",
  "production",
  "all",
]);

// ---- Sessions ----
export const sessionType = pgEnum("session_type", [
  "web",
  "mobile",
  "api",
  "admin",
]);

// ---- Audit logs ----
export const auditAction = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "ASSIGN",
  "TRANSFER",
  "ESCALATE",
  "RESOLVE",
  "COMMENT",
  "ATTACH",
  "VIEW",
  "EXPORT",
  "SYSTEM_INIT",
]);

export const auditEntityType = pgEnum("audit_entity_type", [
  "case",
  "user",
  "comment",
  "attachment",
  "assignment",
  "notification",
  "setting",
  "session",
  "system",
]);

export const requestMethod = pgEnum("request_method", [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
]);
