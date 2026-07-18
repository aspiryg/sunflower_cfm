import type { NextRequest } from "next/server";
import { z } from "zod";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { can, hasRole } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody } from "@/lib/validation";
import {
  findCommentById,
  updateComment,
  softDeleteComment,
} from "@/db/repositories/comments";
import { writeAudit } from "@/db/repositories/audit";

const editCommentSchema = z.object({
  comment: z.string().min(1).max(10000),
  editReason: z.string().max(500).optional(),
});

// Edit the comment body. Allowed for the author, or (via the RBAC matrix)
// staff+ with an "update:all" grant, or any manager+.
export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const caseId = await paramInt(ctx, "id");
    const commentId = await paramInt(ctx, "commentId");
    if (!caseId || !commentId) return fail(400, "Invalid id.", "INVALID_ID");

    const comment = await findCommentById(commentId);
    if (!comment || comment.caseId !== caseId) {
      return fail(404, "Comment not found.", "COMMENT_NOT_FOUND");
    }
    if (!can(auth.user, "case_comments", "update", comment) && !hasRole(auth.user, "manager")) {
      return fail(403, "You cannot edit this comment.", "FORBIDDEN");
    }

    const parsed = await parseBody(req, editCommentSchema);
    if (!parsed.ok) return parsed.response;

    const updated = await updateComment(
      commentId,
      auth.user.id,
      parsed.data.comment,
      parsed.data.editReason,
    );
    if (!updated) return fail(404, "Comment not found.", "COMMENT_NOT_FOUND");

    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "case",
      entityId: caseId,
      metadata: { commentId },
    });
    return ok({ comment: updated }, "Comment updated.");
  },
  { resource: "case_comments", action: "update" },
);

// Soft-delete the comment. Allowed for the author, or (via the RBAC matrix)
// an admin with "delete:all", or any manager+.
export const DELETE = authed(
  async (_req, auth, ctx) => {
    const caseId = await paramInt(ctx, "id");
    const commentId = await paramInt(ctx, "commentId");
    if (!caseId || !commentId) return fail(400, "Invalid id.", "INVALID_ID");

    const comment = await findCommentById(commentId);
    if (!comment || comment.caseId !== caseId) {
      return fail(404, "Comment not found.", "COMMENT_NOT_FOUND");
    }
    if (!can(auth.user, "case_comments", "delete", comment) && !hasRole(auth.user, "manager")) {
      return fail(403, "You cannot delete this comment.", "FORBIDDEN");
    }

    await softDeleteComment(commentId, auth.user.id);
    await writeAudit({
      userId: auth.user.id,
      action: "DELETE",
      entityType: "case",
      entityId: caseId,
      metadata: { commentId },
    });
    return ok(null, "Comment deleted.");
  },
  { resource: "case_comments", action: "delete" },
);
