import { authed } from "@/lib/http/guard";
import { ok } from "@/lib/http/respond";
import { listNotifications } from "@/db/repositories/notifications";

/** Own notifications only — always scoped to the authenticated user. */
export const GET = authed(
  async (req, auth) => {
    const q = new URL(req.url).searchParams;
    const page = Math.max(1, Number(q.get("page")) || 1);
    const limit = Math.min(Math.max(1, Number(q.get("limit")) || 10), 50);
    const unreadOnly = q.get("unread") === "true";

    const { data, total, unread } = await listNotifications(auth.user.id, {
      page,
      limit,
      unreadOnly,
    });
    return ok(data, undefined, {
      extra: {
        summary: { unread },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  },
  { resource: "notifications", action: "read" },
);
