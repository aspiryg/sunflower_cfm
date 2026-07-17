import {
  pgTable,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  jsonb,
  vector,
  index,
} from "drizzle-orm/pg-core";
import {
  urgencyLevel,
  confidentialityLevel,
  providerGender,
  providerAgeGroup,
  providerDisabilityStatus,
  followUpContactMethod,
  resolutionCategory,
  resolutionSatisfaction,
} from "./enums";
import { users } from "./users";
import {
  caseCategories,
  casePriorities,
  caseStatuses,
  caseChannels,
  providerTypes,
} from "./lookups";
import { communities } from "./geography";
import { programs, projects, activities } from "./programs";
import { timestamps, authorship, activeFlag, softDelete } from "./_shared";

/**
 * Embedding dimensionality for semantic search / AI classification (Phase 6).
 * Data is disposable pre-launch, so this can be re-pinned once the embedding
 * provider/model is chosen (e.g. Voyage voyage-3 = 1024). The ANN index on this
 * column is added in Phase 6 alongside the embedding pipeline.
 */
export const EMBEDDING_DIMENSIONS = 1024;

export const cases = pgTable(
  "cases",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),

    // Identity
    caseNumber: varchar("case_number", { length: 20 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),

    // Classification (required)
    categoryId: integer("category_id")
      .notNull()
      .references(() => caseCategories.id),
    priorityId: integer("priority_id")
      .notNull()
      .references(() => casePriorities.id),
    statusId: integer("status_id")
      .notNull()
      .references(() => caseStatuses.id),
    channelId: integer("channel_id")
      .notNull()
      .references(() => caseChannels.id),

    // Dates
    caseDate: timestamp("case_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    resolvedDate: timestamp("resolved_date", { withTimezone: true }),

    // Impact
    impactDescription: text("impact_description"),
    urgencyLevel: urgencyLevel("urgency_level"),
    affectedBeneficiaries: integer("affected_beneficiaries"),

    // Program context (nullable, ON DELETE SET NULL)
    programId: integer("program_id").references(() => programs.id, {
      onDelete: "set null",
    }),
    projectId: integer("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    activityId: integer("activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    isProjectRelated: boolean("is_project_related").notNull().default(false),

    // Provider
    providerTypeId: integer("provider_type_id").references(
      () => providerTypes.id,
    ),
    individualProviderGender: providerGender("individual_provider_gender"),
    individualProviderAgeGroup: providerAgeGroup(
      "individual_provider_age_group",
    ),
    individualProviderDisabilityStatus: providerDisabilityStatus(
      "individual_provider_disability_status",
    ),
    groupProviderSize: integer("group_provider_size"),
    groupProviderGenderComposition: text("group_provider_gender_composition"),

    // Contact
    providerName: varchar("provider_name", { length: 255 }),
    providerEmail: varchar("provider_email", { length: 255 }),
    providerPhone: varchar("provider_phone", { length: 50 }),
    providerOrganization: varchar("provider_organization", { length: 255 }),
    providerAddress: varchar("provider_address", { length: 255 }),

    // Consent / privacy
    dataSharingConsent: boolean("data_sharing_consent").notNull().default(false),
    followUpConsent: boolean("follow_up_consent").notNull().default(false),
    followUpContactMethod: followUpContactMethod("follow_up_contact_method"),
    privacyPolicyAccepted: boolean("privacy_policy_accepted")
      .notNull()
      .default(false),
    isSensitive: boolean("is_sensitive").notNull().default(false),
    isAnonymized: boolean("is_anonymized").notNull().default(false),
    isPublic: boolean("is_public").notNull().default(false),
    confidentialityLevel: confidentialityLevel("confidentiality_level")
      .notNull()
      .default("internal"),

    // Location
    communityId: integer("community_id").references(() => communities.id),
    location: varchar("location", { length: 255 }),
    coordinates: varchar("coordinates", { length: 50 }),

    // Assignment
    assignedTo: integer("assigned_to").references(() => users.id),
    assignedBy: integer("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    assignmentComments: text("assignment_comments"),

    // Submission / data entry
    submittedBy: integer("submitted_by").references(() => users.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    submittedByInitials: varchar("submitted_by_initials", { length: 10 }),
    submittedByConfirmation: boolean("submitted_by_confirmation"),
    submittedByComments: text("submitted_by_comments"),

    // Processing
    firstResponseDate: timestamp("first_response_date", { withTimezone: true }),
    lastActivityDate: timestamp("last_activity_date", { withTimezone: true }),
    escalationLevel: integer("escalation_level").notNull().default(0),
    escalatedAt: timestamp("escalated_at", { withTimezone: true }),
    escalatedBy: integer("escalated_by").references(() => users.id),
    escalationReason: varchar("escalation_reason", { length: 500 }),

    // Resolution
    resolutionSummary: text("resolution_summary"),
    resolutionCategory: resolutionCategory("resolution_category"),
    resolutionSatisfaction: resolutionSatisfaction("resolution_satisfaction"),

    // Metadata
    tags: varchar("tags", { length: 1000 }),
    attachments: jsonb("attachments"),
    externalReferences: varchar("external_references", { length: 500 }),

    // Follow-up / monitoring
    followUpRequired: boolean("follow_up_required").notNull().default(false),
    followUpDate: timestamp("follow_up_date", { withTimezone: true }),
    monitoringRequired: boolean("monitoring_required").notNull().default(false),
    monitoringDate: timestamp("monitoring_date", { withTimezone: true }),

    // Quality assurance
    qualityReviewed: boolean("quality_reviewed").notNull().default(false),
    qualityReviewedBy: integer("quality_reviewed_by").references(
      () => users.id,
    ),
    qualityReviewedAt: timestamp("quality_reviewed_at", { withTimezone: true }),
    qualityScore: numeric("quality_score", { precision: 3, scale: 2 }),
    qualityComments: varchar("quality_comments", { length: 500 }),

    // AI (Phase 6): semantic search / classification vector.
    embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }),

    ...timestamps,
    ...authorship,
    ...activeFlag,
    ...softDelete,
  },
  (t) => [
    index("idx_cases_case_number").on(t.caseNumber),
    index("idx_cases_category_id").on(t.categoryId),
    index("idx_cases_priority_id").on(t.priorityId),
    index("idx_cases_status_id").on(t.statusId),
    index("idx_cases_channel_id").on(t.channelId),
    index("idx_cases_assigned_to").on(t.assignedTo),
    index("idx_cases_submitted_by").on(t.submittedBy),
    index("idx_cases_community_id").on(t.communityId),
    index("idx_cases_program_id").on(t.programId),
    index("idx_cases_case_date").on(t.caseDate),
    index("idx_cases_due_date").on(t.dueDate),
    index("idx_cases_confidentiality_level").on(t.confidentialityLevel),
    index("idx_cases_is_sensitive").on(t.isSensitive),
    index("idx_cases_is_deleted").on(t.isDeleted),
    index("idx_cases_is_active").on(t.isActive),
    index("idx_cases_created_at").on(t.createdAt),
  ],
);

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;
