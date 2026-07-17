/**
 * Seed reference/lookup data + the initial admin user. Idempotent: every insert
 * uses onConflictDoNothing against a unique key, so re-running is safe.
 *
 *   npm run db:seed   (requires DATABASE_URL and a migrated database)
 *
 * Bilingual (name + arabicName) reference data — the AR side gives Phase 5 real
 * content to render in /ar without placeholder translations.
 */
import bcrypt from "bcryptjs";
import { db, pool } from "./index";
import {
  users,
  caseCategories,
  caseStatuses,
  casePriorities,
  caseChannels,
  providerTypes,
  regions,
  systemSettings,
} from "./schema";

async function seed() {
  // ---- Admin user ----
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db
    .insert(users)
    .values({
      username: "admin",
      email: process.env.ADMIN_EMAIL ?? "admin@sunflower-cfm.org",
      password: passwordHash,
      firstName: "System",
      lastName: "Administrator",
      role: "super_admin",
      organization: "Sunflower CFM",
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .onConflictDoNothing();

  // ---- Case categories ----
  await db
    .insert(caseCategories)
    .values([
      { name: "Service Quality", arabicName: "جودة الخدمة", color: "#3b82f6", icon: "star", sortOrder: 1 },
      { name: "Access & Availability", arabicName: "الوصول والتوفر", color: "#14b8a6", icon: "key", sortOrder: 2 },
      { name: "Staff Conduct", arabicName: "سلوك الموظفين", color: "#a855f7", icon: "users", sortOrder: 3 },
      { name: "Safety & Security", arabicName: "السلامة والأمن", color: "#ef4444", icon: "shield", sortOrder: 4 },
      { name: "Discrimination", arabicName: "التمييز", color: "#f97316", icon: "alert-triangle", sortOrder: 5 },
      { name: "Positive Feedback", arabicName: "ملاحظات إيجابية", color: "#22c55e", icon: "thumbs-up", sortOrder: 6 },
      { name: "Suggestion", arabicName: "اقتراح", color: "#6366f1", icon: "lightbulb", sortOrder: 7 },
      { name: "Other", arabicName: "أخرى", color: "#6b7280", icon: "more-horizontal", sortOrder: 8 },
    ])
    .onConflictDoNothing();

  // ---- Case statuses (lifecycle) ----
  await db
    .insert(caseStatuses)
    .values([
      { name: "New", arabicName: "جديد", color: "#3b82f6", sortOrder: 1, isInitial: true, isFinal: false, allowReopen: true },
      { name: "In Review", arabicName: "قيد المراجعة", color: "#6366f1", sortOrder: 2, isInitial: false, isFinal: false, allowReopen: true },
      { name: "Assigned", arabicName: "تم التعيين", color: "#a855f7", sortOrder: 3, isInitial: false, isFinal: false, allowReopen: true },
      { name: "In Progress", arabicName: "قيد المعالجة", color: "#14b8a6", sortOrder: 4, isInitial: false, isFinal: false, allowReopen: true },
      { name: "Pending Info", arabicName: "بانتظار معلومات", color: "#eab308", sortOrder: 5, isInitial: false, isFinal: false, allowReopen: true },
      { name: "Escalated", arabicName: "تم التصعيد", color: "#f97316", sortOrder: 6, isInitial: false, isFinal: false, allowReopen: true },
      { name: "Resolved", arabicName: "تم الحل", color: "#22c55e", sortOrder: 7, isInitial: false, isFinal: true, allowReopen: true },
      { name: "Closed", arabicName: "مغلق", color: "#6b7280", sortOrder: 8, isInitial: false, isFinal: true, allowReopen: false },
      { name: "Reopened", arabicName: "أعيد فتحه", color: "#ef4444", sortOrder: 9, isInitial: false, isFinal: false, allowReopen: true },
    ])
    .onConflictDoNothing();

  // ---- Case priorities (with SLA targets, hours) ----
  await db
    .insert(casePriorities)
    .values([
      { name: "Low", arabicName: "منخفض", color: "#22c55e", level: 5, sortOrder: 4, responseTimeHours: 72, resolutionTimeHours: 720, escalationTimeHours: 480 },
      { name: "Medium", arabicName: "متوسط", color: "#eab308", level: 3, sortOrder: 3, responseTimeHours: 24, resolutionTimeHours: 168, escalationTimeHours: 120 },
      { name: "High", arabicName: "مرتفع", color: "#f97316", level: 2, sortOrder: 2, responseTimeHours: 4, resolutionTimeHours: 48, escalationTimeHours: 24 },
      { name: "Critical", arabicName: "حرج", color: "#ef4444", level: 1, sortOrder: 1, responseTimeHours: 1, resolutionTimeHours: 24, escalationTimeHours: 8 },
    ])
    .onConflictDoNothing();

  // ---- Case channels ----
  await db
    .insert(caseChannels)
    .values([
      { name: "Website", arabicName: "الموقع الإلكتروني", icon: "globe", sortOrder: 1 },
      { name: "Mobile App", arabicName: "تطبيق الهاتف", icon: "smartphone", sortOrder: 2 },
      { name: "Email", arabicName: "البريد الإلكتروني", icon: "mail", sortOrder: 3 },
      { name: "Phone", arabicName: "الهاتف", icon: "phone", sortOrder: 4 },
      { name: "In-Person", arabicName: "شخصياً", icon: "user", sortOrder: 5 },
      { name: "Social Media", arabicName: "وسائل التواصل الاجتماعي", icon: "share-2", sortOrder: 6 },
      { name: "Partner Organization", arabicName: "منظمة شريكة", icon: "briefcase", sortOrder: 7 },
      { name: "Other", arabicName: "أخرى", icon: "more-horizontal", sortOrder: 8 },
    ])
    .onConflictDoNothing();

  // ---- Provider types ----
  await db
    .insert(providerTypes)
    .values([
      { name: "Individual Beneficiary", arabicName: "مستفيد فردي", icon: "user", sortOrder: 1 },
      { name: "Group of Beneficiaries", arabicName: "مجموعة مستفيدين", icon: "users", sortOrder: 2 },
      { name: "Community Representative", arabicName: "ممثل المجتمع", icon: "user-check", sortOrder: 3 },
      { name: "Partner Organization", arabicName: "منظمة شريكة", icon: "briefcase", sortOrder: 4 },
      { name: "Government Entity", arabicName: "جهة حكومية", icon: "landmark", sortOrder: 5 },
      { name: "Staff Member", arabicName: "موظف", icon: "id-card", sortOrder: 6 },
      { name: "Anonymous", arabicName: "مجهول", icon: "user-x", sortOrder: 7 },
    ])
    .onConflictDoNothing();

  // ---- Regions (geographic hierarchy roots) ----
  await db
    .insert(regions)
    .values([
      { name: "West Bank", arabicName: "الضفة الغربية", code: "WB", sortOrder: 1 },
      { name: "Gaza Strip", arabicName: "قطاع غزة", code: "GZ", sortOrder: 2 },
      { name: "Jerusalem", arabicName: "القدس", code: "JER", sortOrder: 3 },
    ])
    .onConflictDoNothing();

  // ---- System settings ----
  await db
    .insert(systemSettings)
    .values([
      { settingKey: "app.name", settingValue: "Sunflower CFM", settingType: "string", category: "general", displayName: "Application Name" },
      { settingKey: "app.version", settingValue: "2.0.0", settingType: "string", category: "general", displayName: "Application Version" },
      { settingKey: "case.number.prefix", settingValue: "CFM", settingType: "string", category: "general", displayName: "Case Number Prefix" },
      { settingKey: "case.auto.assignment", settingValue: "false", settingType: "boolean", category: "general", displayName: "Automatic Case Assignment" },
      { settingKey: "notification.email.enabled", settingValue: "true", settingType: "boolean", category: "notification", displayName: "Email Notifications Enabled" },
      { settingKey: "notification.push.enabled", settingValue: "true", settingType: "boolean", category: "notification", displayName: "Push Notifications Enabled" },
      { settingKey: "sla.default.response.hours", settingValue: "24", settingType: "number", category: "sla", displayName: "Default SLA Response (hours)" },
      { settingKey: "sla.default.resolution.hours", settingValue: "168", settingType: "number", category: "sla", displayName: "Default SLA Resolution (hours)" },
      { settingKey: "security.session.timeout.minutes", settingValue: "480", settingType: "number", category: "security", displayName: "Session Timeout (minutes)" },
      { settingKey: "security.max.login.attempts", settingValue: "5", settingType: "number", category: "security", displayName: "Max Login Attempts" },
    ])
    .onConflictDoNothing();
}

seed()
  .then(async () => {
    console.log("✅ Seed complete");
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Seed failed:", err);
    await pool.end();
    process.exit(1);
  });
