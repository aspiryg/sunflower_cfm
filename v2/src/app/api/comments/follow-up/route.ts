import { authed } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { queryScope } from "@/lib/rbac";
import { listCommentsRequiringFollowUp } from "@/db/repositories/comments";

// Cross-case queue of comments still awaiting follow-up. Rows are narrowed to
// the caller's visible cases using the same scope as reading cases.
export const GET = authed(
  async (_req, auth) => {
    const scope = queryScope(auth.user, "cases", "read");
    return ok(await listCommentsRequiringFollowUp(scope));
  },
  { resource: "case_comments", action: "read" },
);
