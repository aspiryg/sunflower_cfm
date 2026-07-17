/**
 * The authorization matrix: role → resource → action → restriction.
 * Ported from v1 `backend/config/rolesConfig.js` and reconciled to the v2
 * resource set (Feedback resources dropped; case_* kept). super_admin is not
 * listed here — it bypasses the matrix entirely (see authorize()).
 */
import type { Role, Resource, Action, Restriction } from "./types";

type ResourcePerms = Partial<Record<Action, Restriction>>;
type RolePerms = Partial<Record<Resource, ResourcePerms>>;

export const ROLE_PERMISSIONS: Partial<Record<Role, RolePerms>> = {
  user: {
    cases: { create: "all", read: "own", update: "own" },
    case_history: { read: "own" },
    case_comments: {
      create: "all",
      read: "all",
      update: "own",
      delete: "own",
    },
    users: { read: "own", update: "own" },
    categories: { read: "all" },
    notifications: { read: "own", create: "all", update: "own", delete: "own" },
  },

  staff: {
    cases: { create: "all", read: "assigned", update: "assigned" },
    case_history: { read: "assigned" },
    case_comments: {
      create: "all",
      read: "all",
      update: "all",
      delete: "own",
    },
    users: { read: "all", update: "own" },
    categories: { read: "all" },
    notifications: { read: "own", create: "all", update: "own", delete: "own" },
  },

  manager: {
    cases: { create: "all", read: "all", update: "all", assign: "all" },
    case_history: { read: "all" },
    case_comments: {
      create: "all",
      read: "all",
      update: "all",
      delete: "own",
    },
    categories: { read: "all", create: "all", update: "all" },
    users: { read: "all", update: "own" },
    notifications: { read: "own", create: "all", update: "own", delete: "own" },
    analytics: { read: "all", view_analytics: "all" },
  },

  admin: {
    cases: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      assign: "all",
      export: "all",
    },
    case_history: { read: "all", delete: "all" },
    case_comments: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
    },
    users: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
      manage_users: "all",
    },
    categories: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
    },
    case_statuses: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
    },
    notifications: {
      create: "all",
      read: "all",
      update: "all",
      delete: "all",
    },
    analytics: { read: "all", view_analytics: "all" },
  },
};

/**
 * Ownership/assignment fields per resource — used for instance-level checks and
 * query scoping. `owner` matches restriction "own"; `assignee` matches "assigned".
 */
export const OWNERSHIP_FIELDS: Partial<
  Record<Resource, { owner?: string; assignee?: string }>
> = {
  cases: { owner: "createdBy", assignee: "assignedTo" },
  case_history: { owner: "createdBy" },
  case_comments: { owner: "createdBy" },
  users: { owner: "id" },
  notifications: { owner: "userId", assignee: "triggerUserId" },
};
