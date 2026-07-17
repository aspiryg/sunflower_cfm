import { authed } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { markAllRead } from "@/db/repositories/notifications";

export const PATCH = authed(
  async (_req, auth) => {
    const updated = await markAllRead(auth.user.id);
    return ok({ updated }, "All notifications marked as read.");
  },
  { resource: "notifications", action: "update" },
);
