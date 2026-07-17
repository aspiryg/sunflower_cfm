import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { findCaseById, listCaseHistory } from "@/db/repositories/cases";

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    return ok(await listCaseHistory(id));
  },
  { resource: "case_history", action: "read" },
);
