import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize, canManageUser, assignableRoles } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import {
  parseBody,
  updateProfileSchema,
  adminUpdateUserSchema,
} from "@/lib/validation";
import type { NewUser } from "@/db/schema";
import {
  findUserById,
  findUserByIdIncludingInactive,
  findUserByEmail,
  findUserByUsername,
  updateUser,
  updateUserById,
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

/**
 * Admin edit of another user: identity fields, organization, role, and
 * activation state. Distinct from PUT (self-profile). Fetches the target
 * *including* deactivated accounts so an admin can edit/reactivate them.
 * Privileged changes (role, isActive) are gated by canManageUser +
 * assignableRoles; a non-admin can never escalate a role.
 */
export const PATCH = authed(
  async (req: NextRequest, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid user id.", "INVALID_ID");
    if (id === auth.user.id) {
      return fail(
        403,
        "You cannot manage your own account here.",
        "CANNOT_MANAGE_SELF",
      );
    }
    const target = await findUserByIdIncludingInactive(id);
    if (!target) return fail(404, "User not found.", "USER_NOT_FOUND");
    if (!canManageUser(auth.user, target.role)) {
      return fail(403, "You cannot manage this user.", "CANNOT_MANAGE_USER");
    }

    const parsed = await parseBody(req, adminUpdateUserSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;

    const patch: Partial<NewUser> = {};

    // Identity
    if (body.firstName !== undefined) patch.firstName = body.firstName;
    if (body.lastName !== undefined) patch.lastName = body.lastName;
    if (body.organization !== undefined) patch.organization = body.organization;

    // Email uniqueness (ignore the target's own current address).
    if (body.email !== undefined && body.email !== target.email) {
      const dupe = await findUserByEmail(body.email);
      if (dupe && dupe.id !== id) {
        return fail(409, "Email is already registered.", "DUPLICATE_EMAIL");
      }
      patch.email = body.email;
    }
    // Username uniqueness.
    if (body.username !== undefined && body.username !== target.username) {
      const dupe = await findUserByUsername(body.username);
      if (dupe && dupe.id !== id) {
        return fail(409, "Username is already taken.", "DUPLICATE_USERNAME");
      }
      patch.username = body.username;
    }

    // Role change — may only assign a role strictly below one's own.
    let roleChanged = false;
    if (body.role !== undefined && body.role !== target.role) {
      if (!assignableRoles(auth.user).includes(body.role)) {
        return fail(403, "You cannot assign that role.", "INVALID_ROLE_ASSIGNMENT");
      }
      patch.role = body.role;
      roleChanged = true;
    }

    // Activation: reactivate clears the soft-delete triplet; deactivate mirrors
    // the DELETE endpoint's effect.
    if (body.isActive === true) {
      patch.isActive = true;
      patch.isDeleted = false;
      patch.deletedAt = null;
      patch.deletedBy = null;
    } else if (body.isActive === false) {
      patch.isActive = false;
      patch.isDeleted = true;
      patch.deletedAt = new Date();
      patch.deletedBy = auth.user.id;
    }

    if (Object.keys(patch).length === 0) {
      return ok({ user: toSafeUser(target) }, "No changes.");
    }

    patch.updatedBy = auth.user.id;
    const updated = await updateUserById(id, patch);
    await writeAudit({
      userId: auth.user.id,
      action: "UPDATE",
      entityType: "user",
      entityId: id,
      metadata: roleChanged
        ? { previousRole: target.role, newRole: body.role, reason: body.reason }
        : undefined,
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
