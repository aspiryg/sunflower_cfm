/**
 * Notification data access — self-scoped: every read/write is keyed by the
 * owning userId so a user can never touch another user's notifications.
 * Delivery channels (email/push) hang off the same rows later (IMPROVEMENTS).
 */
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../index";
import { notifications, type Notification } from "../schema";

type NotificationType = (typeof notifications.type.enumValues)[number];
type NotificationPriority = (typeof notifications.priority.enumValues)[number];

export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  caseId?: number;
  title?: string;
  message?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  triggerUserId?: number;
  metadata?: Record<string, unknown>;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<Notification> {
  const [row] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      type: input.type,
      caseId: input.caseId,
      title: input.title,
      message: input.message,
      priority: input.priority ?? "normal",
      actionUrl: input.actionUrl,
      triggerUserId: input.triggerUserId,
      metadata: input.metadata,
    })
    .returning();
  return row;
}

export async function listNotifications(
  userId: number,
  opts: { page?: number; limit?: number; unreadOnly?: boolean } = {},
): Promise<{ data: Notification[]; total: number; unread: number }> {
  const { page = 1, limit = 10, unreadOnly = false } = opts;
  const base = and(
    eq(notifications.userId, userId),
    eq(notifications.isActive, true),
    unreadOnly ? eq(notifications.isRead, false) : undefined,
  );
  const offset = (Math.max(1, page) - 1) * limit;

  const [data, [{ total }], [{ unread }]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(base)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(notifications).where(base),
    db
      .select({ unread: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isActive, true),
          eq(notifications.isRead, false),
        ),
      ),
  ]);

  return { data, total: Number(total), unread: Number(unread) };
}

/** Mark one notification read — only if it belongs to userId. */
export async function markRead(
  id: number,
  userId: number,
): Promise<Notification | undefined> {
  const [row] = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return row;
}

export async function markAllRead(userId: number): Promise<number> {
  const rows = await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .returning({ id: notifications.id });
  return rows.length;
}

export async function deleteNotification(
  id: number,
  userId: number,
): Promise<boolean> {
  const rows = await db
    .delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });
  return rows.length > 0;
}
