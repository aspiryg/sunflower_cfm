import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramStr } from "@/lib/http/params";
import { findCaseByNumber } from "@/db/repositories/cases";

export const GET = authed(
  async (_req, auth, ctx) => {
    const caseNumber = await paramStr(ctx, "caseNumber");
    if (!caseNumber) return fail(400, "Invalid case number.", "INVALID_CASE_NUMBER");
    const found = await findCaseByNumber(caseNumber);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    return ok({ case: found });
  },
  { resource: "cases", action: "read" },
);
