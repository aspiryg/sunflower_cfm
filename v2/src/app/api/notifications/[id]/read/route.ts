import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramInt } from "@/lib/http/params";
import { markRead } from "@/db/repositories/notifications";

export const PATCH = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid notification id.", "INVALID_ID");
    // Repo scopes by userId — a foreign notification simply isn't found.
    const row = await markRead(id, auth.user.id);
    if (!row) return fail(404, "Notification not found.", "NOTIFICATION_NOT_FOUND");
    return ok({ notification: row });
  },
  { resource: "notifications", action: "update" },
);
