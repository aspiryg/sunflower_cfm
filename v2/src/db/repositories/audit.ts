/**
 * Global audit-log writer (insert-only). Fire-and-forget friendly — never let an
 * audit failure break the request it describes.
 */
import { db } from "../index";
import { auditLogs } from "../schema";

type AuditAction = (typeof auditLogs.action.enumValues)[number];
type AuditEntity = (typeof auditLogs.entityType.enumValues)[number];

export interface AuditInput {
  userId?: number | null;
  action: AuditAction;
  entityType?: AuditEntity;
  entityId?: number;
  success?: boolean;
  errorMessage?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}

export async function writeAudit(entry: AuditInput): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      success: entry.success ?? true,
      errorMessage: entry.errorMessage,
      ipAddress: entry.ipAddress,
      metadata: entry.metadata,
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}
