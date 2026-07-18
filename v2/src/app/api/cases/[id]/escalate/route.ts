import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody, escalateSchema } from "@/lib/validation";
import { findCaseById, escalateCase } from "@/db/repositories/cases";
import { writeAudit } from "@/db/repositories/audit";
import { notifyCaseStakeholders } from "@/lib/notify";

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "update", found).allowed) {
      return fail(403, "You cannot escalate this case.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, escalateSchema);
    if (!parsed.ok) return parsed.response;

    const updated = await escalateCase(id, auth.user.id, {
      reason: parsed.data.reason,
      escalatedTo: parsed.data.escalatedTo,
    });
    await writeAudit({
      userId: auth.user.id,
      action: "ESCALATE",
      entityType: "case",
      entityId: id,
    });
    // Notify stakeholders + whoever it was escalated to (was silently missing).
    await notifyCaseStakeholders({
      caseRow: found,
      actorId: auth.user.id,
      type: "escalation",
      message: parsed.data.reason,
      alsoNotify: [parsed.data.escalatedTo],
    });
    return ok({ case: updated }, "Case escalated.");
  },
  { resource: "cases", action: "update" },
);
