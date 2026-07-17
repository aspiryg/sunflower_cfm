import type { NextRequest } from "next/server";
import { authed, type RouteCtx } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { parseBody, updateCaseSchema } from "@/lib/validation";
import {
  findCaseById,
  updateCase,
  softDeleteCase,
} from "@/db/repositories/cases";
import { writeAudit } from "@/db/repositories/audit";

async function caseIdFrom(ctx: RouteCtx): Promise<number | null> {
  const { id } = await ctx.params;
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await caseIdFrom(ctx);
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    return ok({ case: found });
  },
  { resource: "cases", action: "read" },
);

export const PUT = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await caseIdFrom(ctx);
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "update", found).allowed) {
      return fail(403, "You cannot edit this case.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, updateCaseSchema);
    if (!parsed.ok) return parsed.response;

    const updated = await updateCase(id, parsed.data, auth.user.id);
    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "case",
      entityId: id,
    });
    return ok({ case: updated }, "Case updated.");
  },
  { resource: "cases", action: "update" },
);

export const DELETE = authed(
  async (_req, auth, ctx) => {
    const id = await caseIdFrom(ctx);
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "delete", found).allowed) {
      return fail(403, "You cannot delete this case.", "FORBIDDEN");
    }
    await softDeleteCase(id, auth.user.id);
    await writeAudit({
      userId: auth.user.id,
      action: "DELETE",
      entityType: "case",
      entityId: id,
    });
    return ok(undefined, "Case deleted.");
  },
  { resource: "cases", action: "delete" },
);
