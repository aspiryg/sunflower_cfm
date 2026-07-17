import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramInt } from "@/lib/http/params";
import { parseBody, assignSchema } from "@/lib/validation";
import { findCaseById, assignCase } from "@/db/repositories/cases";
import { findUserById } from "@/db/repositories/users";
import { writeAudit } from "@/db/repositories/audit";

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");

    const parsed = await parseBody(req, assignSchema);
    if (!parsed.ok) return parsed.response;

    const assignee = await findUserById(parsed.data.assignedTo);
    if (!assignee) return fail(400, "Assignee not found.", "INVALID_ASSIGNEE");

    const updated = await assignCase(id, parsed.data.assignedTo, auth.user.id, {
      comments: parsed.data.comments,
      expectedCompletionDate: parsed.data.expectedCompletionDate,
    });
    await writeAudit({
      userId: auth.user.id,
      action: "ASSIGN",
      entityType: "case",
      entityId: id,
      metadata: { assignedTo: parsed.data.assignedTo },
    });
    return ok({ case: updated }, "Case assigned.");
  },
  // cases:assign is granted to manager+ only (see RBAC matrix).
  { resource: "cases", action: "assign" },
);
