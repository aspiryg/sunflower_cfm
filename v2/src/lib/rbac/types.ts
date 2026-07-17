/**
 * RBAC core types. One shared, typed source of truth for authorization —
 * consumed by API route handlers (server) and UI gating (client), so backend
 * and frontend can never drift (a v1 deficiency; see docs/v2/IMPROVEMENTS.md).
 */

export const ROLES = ["user", "staff", "manager", "admin", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

/** Numeric precedence — higher includes the authority of lower where used. */
export const ROLE_LEVEL: Record<Role, number> = {
  user: 1,
  staff: 2,
  manager: 3,
  admin: 4,
  super_admin: 5,
};

export const RESOURCES = [
  "cases",
  "case_history",
  "case_comments",
  "users",
  "categories",
  "case_statuses",
  "notifications",
  "analytics",
  "system",
] as const;
export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "assign",
  "export",
  "import",
  "manage_settings",
  "view_analytics",
  "manage_users",
] as const;
export type Action = (typeof ACTIONS)[number];

/** Scope of a granted action. */
export type Restriction = "all" | "own" | "assigned" | "none";

/** Minimal user shape needed to make an authorization decision. */
export interface AuthUser {
  id: number;
  role: Role;
}

/** A loaded target row for instance-level ownership checks. */
export interface TargetResource {
  [key: string]: unknown;
}

export interface AuthResult {
  allowed: boolean;
  restriction: Restriction;
  /** Machine code for denials, e.g. NO_PERMISSION / NOT_OWNER. */
  code?: string;
}

/** Query-scoping descriptor for list endpoints. */
export type QueryScope =
  | { kind: "all" }
  | { kind: "none" }
  | { kind: "field"; field: string; value: number };
