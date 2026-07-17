import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody, changeStatusSchema } from "@/lib/validation";
import { findCaseById, changeCaseStatus } from "@/db/repositories/cases";
import { writeAudit } from "@/db/repositories/audit";
import { notifyCaseStakeholders } from "@/lib/notify";

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "update", found).allowed) {
      return fail(403, "You cannot change this case's status.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, changeStatusSchema);
    if (!parsed.ok) return parsed.response;

    const result = await changeCaseStatus(id, parsed.data.statusId, auth.user.id, {
      reason: parsed.data.reason,
      comments: parsed.data.comments,
    });
    if (!result.ok) {
      const status = result.code === "CASE_NOT_FOUND" ? 404 : 409;
      return fail(status, result.reason ?? "Invalid status transition.", result.code);
    }
    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "case",
      entityId: id,
      metadata: { statusId: parsed.data.statusId },
    });
    await notifyCaseStakeholders({
      caseRow: result.case,
      actorId: auth.user.id,
      type: "case_status_changed",
      message: parsed.data.reason,
    });
    return ok({ case: result.case }, "Status updated.");
  },
  { resource: "cases", action: "update" },
);
