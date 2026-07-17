import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody, addCommentSchema } from "@/lib/validation";
import { findCaseById } from "@/db/repositories/cases";
import { addComment, listComments } from "@/db/repositories/comments";
import { writeAudit } from "@/db/repositories/audit";

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    return ok(await listComments(id));
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
    const parsed = await parseBody(req, addCommentSchema);
    if (!parsed.ok) return parsed.response;

    const comment = await addComment(id, auth.user.id, parsed.data);
    await writeAudit({
      userId: auth.user.id,
      action: "COMMENT",
      entityType: "case",
      entityId: id,
    });
    return ok({ comment }, "Comment added.", { status: 201 });
  },
  { resource: "case_comments", action: "create" },
);
