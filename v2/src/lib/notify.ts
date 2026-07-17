/**
 * Case-event notification fan-out. Notifies the case's stakeholders (creator +
 * current assignee), never the acting user, deduplicated. Failures are logged
 * and swallowed — a notification must never fail the action that caused it.
 * The UI localizes by `type` + metadata; title/message are a plain fallback.
 */
import { createNotification } from "@/db/repositories/notifications";
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
}
