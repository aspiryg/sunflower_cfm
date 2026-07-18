import type { NextRequest } from "next/server";
import { z } from "zod";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize, hasRole } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody } from "@/lib/validation";
import { findCaseById } from "@/db/repositories/cases";
import { addComment, listComments } from "@/db/repositories/comments";
import { writeAudit } from "@/db/repositories/audit";
import { notifyCaseStakeholders } from "@/lib/notify";

// Inline schema (extends v1's addComment with an optional ISO follow-up date).
const postCommentSchema = z.object({
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
  followUpDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected yyyy-mm-dd")
    .optional(),
});

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    // Only staff and above may see internal (staff-only) comments.
    const includeInternal = hasRole(auth.user, "staff");
    return ok(await listComments(id, { includeInternal }));
  },
  { resource: "case_comments", action: "read" },
);

export const POST = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, postCommentSchema);
    if (!parsed.ok) return parsed.response;
    const { comment, commentType, isInternal, parentCommentId, requiresFollowUp, followUpDate } =
      parsed.data;

    // Derive a comment type when the caller didn't set one explicitly.
    const derivedType =
      commentType ??
      (requiresFollowUp ? "follow_up" : isInternal === false ? "external" : "internal");

    const created = await addComment(id, auth.user.id, {
      comment,
      commentType: derivedType,
      isInternal,
      parentCommentId,
      requiresFollowUp,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
    });
    await writeAudit({
      userId: auth.user.id,
      action: "COMMENT",
      entityType: "case",
      entityId: id,
    });
    await notifyCaseStakeholders({
      caseRow: found,
      actorId: auth.user.id,
      type: "comment_added",
    });
    return ok({ comment: created }, "Comment added.", { status: 201 });
  },
  { resource: "case_comments", action: "create" },
);
