/**
 * Case-event notification fan-out. Notifies the case's stakeholders (creator +
 * current assignee), never the acting user, deduplicated — via BOTH an in-app
 * notification and a transactional email (v1 parity). Failures are logged and
 * swallowed — a notification must never fail the action that caused it.
 * The UI localizes by `type` + metadata; title/message are a plain fallback.
 */
import { createNotification } from "@/db/repositories/notifications";
import { getUserContacts } from "@/db/repositories/users";
import { sendEmailSafe } from "@/lib/email";
import { caseNotificationEmail } from "@/lib/email/templates";
import type { Case } from "@/db/schema";
import type { notifications } from "@/db/schema";

type NotificationType = (typeof notifications.type.enumValues)[number];

interface CaseEvent {
  caseRow: Pick<Case, "id" | "caseNumber" | "createdBy" | "assignedTo">;
  actorId: number;
  type: NotificationType;
  message?: string;
  /** Extra recipients (e.g. the new assignee on assignment). */
  alsoNotify?: Array<number | null | undefined>;
  /** Set false to skip the email channel (in-app only). Default true. */
  email?: boolean;
}

/** Bilingual subject + body per event type, for the email channel. */
function emailContent(type: NotificationType, caseNumber: string, message?: string) {
  const note = message ? ` — “${message}”` : "";
  const noteAr = message ? ` — «${message}»` : "";
  switch (type) {
    case "case_assigned":
      return {
        subject: "Case assigned to you",
        bodyEn: `Case ${caseNumber} has been assigned to you.`,
        bodyAr: `تم إسناد الحالة ${caseNumber} إليك.`,
      };
    case "case_status_changed":
      return {
        subject: "Case status changed",
        bodyEn: `The status of case ${caseNumber} has changed${note}.`,
        bodyAr: `تم تغيير حالة القضية ${caseNumber}${noteAr}.`,
      };
    case "escalation":
      return {
        subject: "Case escalated",
        bodyEn: `Case ${caseNumber} has been escalated${note}.`,
        bodyAr: `تم تصعيد الحالة ${caseNumber}${noteAr}.`,
      };
    case "comment_added":
      return {
        subject: "New comment on a case",
        bodyEn: `A new comment was added to case ${caseNumber}${note}.`,
        bodyAr: `تمت إضافة تعليق جديد إلى الحالة ${caseNumber}${noteAr}.`,
      };
    default:
      return {
        subject: "Case update",
        bodyEn: `There is an update on case ${caseNumber}${note}.`,
        bodyAr: `يوجد تحديث على الحالة ${caseNumber}${noteAr}.`,
      };
  }
}

export async function notifyCaseStakeholders(event: CaseEvent): Promise<void> {
  const { caseRow, actorId, type } = event;
  const recipients = new Set<number>();
  for (const id of [
    caseRow.createdBy,
    caseRow.assignedTo,
    ...(event.alsoNotify ?? []),
  ]) {
    if (id != null && id !== actorId) recipients.add(id);
  }
  if (recipients.size === 0) return;

  // In-app notifications.
  await Promise.all(
    [...recipients].map((userId) =>
      createNotification({
        userId,
        type,
        caseId: caseRow.id,
        title: caseRow.caseNumber,
        message: event.message,
        actionUrl: `/cases/${caseRow.id}`,
        triggerUserId: actorId,
        metadata: { caseNumber: caseRow.caseNumber },
      }).catch((err) =>
        console.error("[notify] failed to create notification:", err),
      ),
    ),
  );

  // Email channel (best-effort, fire-and-forget).
  if (event.email === false) return;
  try {
    const contacts = await getUserContacts([...recipients]);
    const content = emailContent(type, caseRow.caseNumber, event.message);
    for (const c of contacts) {
      sendEmailSafe(
        caseNotificationEmail(c.email, {
          caseId: caseRow.id,
          caseNumber: caseRow.caseNumber,
          subject: content.subject,
          bodyEn: content.bodyEn,
          bodyAr: content.bodyAr,
        }),
      );
    }
  } catch (err) {
    console.error("[notify] failed to send notification emails:", err);
  }
}
