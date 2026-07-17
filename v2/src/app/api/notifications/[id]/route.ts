import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { paramInt } from "@/lib/http/params";
import { deleteNotification } from "@/db/repositories/notifications";

export const DELETE = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid notification id.", "INVALID_ID");
    const deleted = await deleteNotification(id, auth.user.id);
    if (!deleted) return fail(404, "Notification not found.", "NOTIFICATION_NOT_FOUND");
    return ok(undefined, "Notification deleted.");
  },
  { resource: "notifications", action: "delete" },
);
