/**
 * Authorization API. Pure functions (no DB, no framework) so they run
 * identically on server and client and are trivially unit-testable.
 */
import {
  ROLES,
  ROLE_LEVEL,
  type Role,
  type Resource,
  type Action,
  type Restriction,
  type AuthUser,
  type AuthResult,
  type QueryScope,
} from "./types";
import { ROLE_PERMISSIONS, OWNERSHIP_FIELDS } from "./matrix";

export * from "./types";
export { ROLE_PERMISSIONS, OWNERSHIP_FIELDS } from "./matrix";

function grantedRestriction(
  role: Role,
  resource: Resource,
  action: Action,
): Restriction {
  return ROLE_PERMISSIONS[role]?.[resource]?.[action] ?? "none";
}

function ownerFieldFor(
  resource: Resource,
  restriction: Restriction,
): string | undefined {
  const fields = OWNERSHIP_FIELDS[resource];
  if (!fields) return undefined;
  return restriction === "assigned" ? fields.assignee : fields.owner;
}

/**
 * Decide whether `user` may perform `action` on `resource`. When a concrete
 * `target` row is supplied and the grant is scoped (own/assigned), ownership is
 * enforced against that row; without a target, a scoped grant is allowed at the
 * collection level and the caller must apply queryScope() to filter rows.
 */
export function authorize(
  user: AuthUser,
  resource: Resource,
  action: Action,
  // `object` (not an index signature) so concrete row types (Case, User, …) are
  // assignable at call sites without casts.
  target?: object,
): AuthResult {
  if (user.role === "super_admin") {
    return { allowed: true, restriction: "all" };
  }

  const restriction = grantedRestriction(user.role, resource, action);

  if (restriction === "none") {
    return { allowed: false, restriction: "none", code: "NO_PERMISSION" };
  }
  if (restriction === "all") {
    return { allowed: true, restriction: "all" };
  }

  // Scoped grant (own | assigned).
  if (!target) {
    // Collection-level: permitted; rows are narrowed via queryScope().
    return { allowed: true, restriction };
  }

  const field = ownerFieldFor(resource, restriction);
  if (!field) {
    // No ownership model for this resource → cannot satisfy a scoped grant.
    return { allowed: false, restriction, code: "NO_OWNERSHIP_MODEL" };
  }

  const owns =
    Number((target as Record<string, unknown>)[field]) === user.id;
  if (owns) return { allowed: true, restriction };
  return {
    allowed: false,
    restriction,
    code: restriction === "assigned" ? "NOT_ASSIGNED" : "NOT_OWNER",
  };
}

/** Convenience boolean wrapper. */
export function can(
  user: AuthUser,
  resource: Resource,
  action: Action,
  target?: object,
): boolean {
  return authorize(user, resource, action, target).allowed;
}

/**
 * Query-scoping descriptor for list endpoints: how to narrow a collection so a
 * user only sees rows their grant permits.
 */
export function queryScope(
  user: AuthUser,
  resource: Resource,
  action: Action = "read",
): QueryScope {
  if (user.role === "super_admin") return { kind: "all" };

  const restriction = grantedRestriction(user.role, resource, action);
  if (restriction === "all") return { kind: "all" };
  if (restriction === "none") return { kind: "none" };

  const field = ownerFieldFor(resource, restriction);
  if (!field) return { kind: "none" };
  return { kind: "field", field, value: user.id };
}

/** True if `actor` may act on a user whose role is `targetRole`. */
export function canManageUser(actor: AuthUser, targetRole: Role): boolean {
  if (actor.role === "super_admin") return targetRole !== "super_admin";
  return ROLE_LEVEL[actor.role] > ROLE_LEVEL[targetRole];
}

/** Roles `actor` is allowed to assign (strictly below its own level). */
export function assignableRoles(actor: AuthUser): Role[] {
  return ROLES.filter((r) => ROLE_LEVEL[r] < ROLE_LEVEL[actor.role]);
}

/** Hierarchy check: does `actor` meet or exceed `minRole`? */
export function hasRole(actor: AuthUser, minRole: Role): boolean {
  return ROLE_LEVEL[actor.role] >= ROLE_LEVEL[minRole];
}
