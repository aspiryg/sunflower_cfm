import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { can, hasRole } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { findCommentById, markFollowUpComplete } from "@/db/repositories/comments";
import { writeAudit } from "@/db/repositories/audit";

// Mark a comment's pending follow-up as done. Allowed for the comment author,
// staff+ (matrix update grant), or any manager+.
export const PATCH = authed(
  async (_req, auth, ctx) => {
    const caseId = await paramInt(ctx, "id");
    const commentId = await paramInt(ctx, "commentId");
    if (!caseId || !commentId) return fail(400, "Invalid id.", "INVALID_ID");

    const comment = await findCommentById(commentId);
    if (!comment || comment.caseId !== caseId) {
      return fail(404, "Comment not found.", "COMMENT_NOT_FOUND");
    }
    if (!can(auth.user, "case_comments", "update", comment) && !hasRole(auth.user, "manager")) {
      return fail(403, "You cannot update this follow-up.", "FORBIDDEN");
    }
    if (!comment.requiresFollowUp) {
      return fail(409, "This comment has no follow-up.", "NO_FOLLOW_UP");
    }

    const updated = await markFollowUpComplete(commentId, auth.user.id);
    if (!updated) return fail(404, "Comment not found.", "COMMENT_NOT_FOUND");

    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "case",
      entityId: caseId,
      metadata: { commentId, followUpCompleted: true },
    });
    return ok({ comment: updated }, "Follow-up marked complete.");
  },
  { resource: "case_comments", action: "update" },
);
