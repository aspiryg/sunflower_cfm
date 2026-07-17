import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { canManageUser, assignableRoles } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { parseBody, updateRoleSchema } from "@/lib/validation";
import { findUserById, updateUser, toSafeUser } from "@/db/repositories/users";
import { writeAudit } from "@/db/repositories/audit";

export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid user id.", "INVALID_ID");
    if (id === auth.user.id) {
      return fail(403, "You cannot change your own role.", "CANNOT_CHANGE_OWN_ROLE");
    }
    const target = await findUserById(id);
    if (!target) return fail(404, "User not found.", "USER_NOT_FOUND");

    const parsed = await parseBody(req, updateRoleSchema);
    if (!parsed.ok) return parsed.response;
    const { role, reason } = parsed.data;

    if (!canManageUser(auth.user, target.role) || !assignableRoles(auth.user).includes(role)) {
      return fail(403, "You cannot assign this role.", "CANNOT_MANAGE_USER");
    }

    const previousRole = target.role;
    const updated = await updateUser(id, { role });
    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "user",
      entityId: id,
      metadata: { previousRole, newRole: role, reason },
    });
    return ok(
      { user: updated ? toSafeUser(updated) : null, change: { previousRole, newRole: role } },
      "Role updated.",
    );
  },
  { resource: "users", action: "update" },
);
