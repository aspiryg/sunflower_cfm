import { NextResponse } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { findCaseById } from "@/db/repositories/cases";
import {
  findAttachment,
  recordDownload,
  softDeleteAttachment,
} from "@/db/repositories/attachments";
import { presignDownload, isStorageConfigured } from "@/lib/storage/s3";
import { writeAudit } from "@/db/repositories/audit";

/** Download: 302 to a short-lived presigned URL. */
export const GET = authed(
  async (_req, auth, ctx) => {
    if (!isStorageConfigured()) {
      return fail(503, "File storage is not configured.", "STORAGE_UNAVAILABLE");
    }
    const id = await paramInt(ctx, "id");
    const attachmentId = await paramInt(ctx, "attachmentId");
    if (!id || !attachmentId) return fail(400, "Invalid id.", "INVALID_ID");

    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    const attachment = await findAttachment(id, attachmentId);
    if (!attachment?.filePath) {
      return fail(404, "Attachment not found.", "ATTACHMENT_NOT_FOUND");
    }

    const url = await presignDownload(
      attachment.filePath,
      attachment.originalFileName ?? attachment.fileName ?? "download",
    );
    await recordDownload(attachmentId, auth.user.id);
    return NextResponse.redirect(url, 302);
  },
  { resource: "cases", action: "read" },
);

export const DELETE = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    const attachmentId = await paramInt(ctx, "attachmentId");
    if (!id || !attachmentId) return fail(400, "Invalid id.", "INVALID_ID");

    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "update", found).allowed) {
      return fail(403, "You cannot modify this case.", "FORBIDDEN");
    }
    const attachment = await findAttachment(id, attachmentId);
    if (!attachment) {
      return fail(404, "Attachment not found.", "ATTACHMENT_NOT_FOUND");
    }

    // Soft delete only — the object stays in storage for audit/restore.
    await softDeleteAttachment(attachmentId, auth.user.id);
    await writeAudit({
      userId: auth.user.id,
      action: "DELETE",
      entityType: "attachment",
      entityId: attachmentId,
      metadata: { caseId: id },
    });
    return ok(undefined, "Attachment deleted.");
  },
  { resource: "cases", action: "update" },
);
