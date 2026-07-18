/**
 * Zod request schemas + a small parse helper. Centralizes input validation so
 * every route rejects malformed input uniformly with a 400 VALIDATION_ERROR.
 */
import { z } from "zod";
import type { NextRequest, NextResponse } from "next/server";
import { fail } from "./http/respond";

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

// Names allow the Arabic range in addition to Latin (bilingual users).
const personName = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[\p{L}\s'-]+$/u, "Invalid characters in name");

export const registerSchema = z.object({
  email: z.string().email().max(100),
  password,
  firstName: personName,
  lastName: personName,
  username: z.string().min(3).max(50).optional(),
  organization: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

/** verify-email request + forgot-password both take just an email. */
export const emailOnlySchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: password,
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createCaseSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  categoryId: z.number().int().positive(),
  priorityId: z.number().int().positive(),
  channelId: z.number().int().positive(),
  statusId: z.number().int().positive().optional(),
  // Impact
  impactDescription: z.string().max(10000).optional(),
  urgencyLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
  affectedBeneficiaries: z.number().int().min(0).optional(),
  // Program context
  programId: z.number().int().positive().optional(),
  projectId: z.number().int().positive().optional(),
  activityId: z.number().int().positive().optional(),
  // Provider
  providerTypeId: z.number().int().positive().optional(),
  providerName: z.string().max(255).optional(),
  providerEmail: z.string().email().max(255).optional(),
  providerPhone: z.string().max(50).optional(),
  providerOrganization: z.string().max(255).optional(),
  providerAddress: z.string().max(255).optional(),
  individualProviderGender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional(),
  individualProviderAgeGroup: z
    .enum(["under_18", "18_25", "26_35", "36_50", "51_65", "over_65"])
    .optional(),
  individualProviderDisabilityStatus: z
    .enum(["none", "physical", "visual", "hearing", "cognitive", "multiple", "prefer_not_to_say"])
    .optional(),
  groupProviderSize: z.number().int().min(0).optional(),
  // Consent / privacy
  dataSharingConsent: z.boolean().optional(),
  followUpConsent: z.boolean().optional(),
  followUpContactMethod: z
    .enum(["email", "phone", "in_person", "sms", "none"])
    .optional(),
  privacyPolicyAccepted: z.boolean().optional(),
  isSensitive: z.boolean().optional(),
  isAnonymized: z.boolean().optional(),
  confidentialityLevel: z
    .enum(["public", "internal", "restricted", "confidential"])
    .optional(),
  // Location
  communityId: z.number().int().positive().optional(),
  location: z.string().max(255).optional(),
  coordinates: z.string().max(50).optional(),
  // Metadata
  tags: z.string().max(1000).optional(),
  externalReferences: z.string().max(500).optional(),
});

/** Field updates only — status transitions go through the status endpoint. */
export const updateCaseSchema = createCaseSchema.omit({ statusId: true }).partial();

/** Anonymous public intake — minimal, maps to a case server-side. */
export const publicFeedbackSchema = z.object({
  description: z.string().min(10, "Please describe your feedback"),
  name: z.string().max(255).optional(),
  contact: z.string().max(255).optional(),
  category: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
});

export const addCommentSchema = z.object({
  comment: z.string().min(1).max(10000),
  commentType: z
    .enum([
      "internal",
      "external",
      "resolution",
      "escalation",
      "follow_up",
      "status_update",
      "assignment",
    ])
    .optional(),
  isInternal: z.boolean().optional(),
  parentCommentId: z.number().int().positive().optional(),
  requiresFollowUp: z.boolean().optional(),
});

export const changeStatusSchema = z.object({
  statusId: z.number().int().positive(),
  reason: z.string().max(500).optional(),
  comments: z.string().max(10000).optional(),
});

export const assignSchema = z.object({
  assignedTo: z.number().int().positive(),
  comments: z.string().max(10000).optional(),
  expectedCompletionDate: z.coerce.date().optional(),
});

export const escalateSchema = z.object({
  reason: z.string().min(1).max(500),
  escalatedTo: z.number().int().positive().optional(),
});

export const updateProfileSchema = z
  .object({
    firstName: personName,
    lastName: personName,
    bio: z.string().max(500),
    phone: z.string().max(20),
    address: z.string().max(255),
    city: z.string().max(100),
    state: z.string().max(100),
    country: z.string().max(100),
    postalCode: z.string().max(20),
    organization: z.string().max(100),
  })
  .partial();

const ROLE = z.enum(["user", "staff", "manager", "admin", "super_admin"]);

export const createUserSchema = z.object({
  email: z.string().email().max(100),
  firstName: personName,
  lastName: personName,
  username: z.string().min(3).max(50).optional(),
  role: ROLE.optional(),
  organization: z.string().max(100).optional(),
  password: password.optional(),
});

export const updateRoleSchema = z.object({
  role: ROLE,
  reason: z.string().max(500).optional(),
});

export const lookupCreateSchema = z.object({
  name: z.string().min(1).max(100),
  arabicName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  code: z.string().min(1).max(10).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const lookupUpdateSchema = z
  .object({
    name: z.string().min(1).max(100),
    arabicName: z.string().max(100).nullable(),
    description: z.string().max(500).nullable(),
    sortOrder: z.number().int().min(0),
    isActive: z.boolean(),
  })
  .partial();

/** Parse+validate a JSON body; returns either the typed data or a 400 response. */
export async function parseBody<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T,
): Promise<
  { ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }
> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { ok: false, response: fail(400, "Invalid JSON body", "INVALID_JSON") };
  }
  const result = schema.safeParse(json);
  if (!result.success) {
    return {
      ok: false,
      response: fail(400, "Validation failed", "VALIDATION_ERROR", {
        details: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      }),
    };
  }
  return { ok: true, data: result.data };
}
