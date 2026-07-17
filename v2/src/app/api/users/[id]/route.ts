import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize, canManageUser } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody, updateProfileSchema } from "@/lib/validation";
import {
  findUserById,
  updateUser,
  softDeleteUser,
  toSafeUser,
} from "@/db/repositories/users";
import { writeAudit } from "@/db/repositories/audit";

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid user id.", "INVALID_ID");
    const target = await findUserById(id);
    if (!target) return fail(404, "User not found.", "USER_NOT_FOUND");
    if (!authorize(auth.user, "users", "read", target).allowed) {
      return fail(403, "You cannot view this user.", "FORBIDDEN");
    }
    return ok({ user: toSafeUser(target) });
  },
  { resource: "users", action: "read" },
);

export const PUT = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid user id.", "INVALID_ID");
    const target = await findUserById(id);
    if (!target) return fail(404, "User not found.", "USER_NOT_FOUND");
    if (!authorize(auth.user, "users", "update", target).allowed) {
      return fail(403, "You cannot edit this user.", "FORBIDDEN");
    }
    const parsed = await parseBody(req, updateProfileSchema);
    if (!parsed.ok) return parsed.response;

    const updated = await updateUser(id, parsed.data);
    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "user",
      entityId: id,
    });
    return ok({ user: updated ? toSafeUser(updated) : null }, "User updated.");
  },
  { resource: "users", action: "update" },
);

export const DELETE = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid user id.", "INVALID_ID");
    if (id === auth.user.id) {
      return fail(403, "You cannot delete your own account here.", "CANNOT_DELETE_SELF");
    }
    const target = await findUserById(id);
    if (!target) return fail(404, "User not found.", "USER_NOT_FOUND");
    if (!canManageUser(auth.user, target.role)) {
      return fail(403, "You cannot delete this user.", "CANNOT_MANAGE_USER");
    }
    await softDeleteUser(id, auth.user.id);
    await writeAudit({
      userId: auth.user.id,
      action: "DELETE",
      entityType: "user",
      entityId: id,
    });
    return ok(undefined, "User deleted.");
  },
  { resource: "users", action: "delete" },
);
