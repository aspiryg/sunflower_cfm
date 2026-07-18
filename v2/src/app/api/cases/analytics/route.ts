import { authed } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { queryScope } from "@/lib/rbac";
import { caseAnalytics } from "@/db/repositories/cases";

export const GET = authed(
  async (_req, auth) => {
    const scope = queryScope(auth.user, "cases", "read");
    return ok(await caseAnalytics(scope));
  },
  { resource: "cases", action: "read" },
);
