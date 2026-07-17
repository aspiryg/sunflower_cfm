import { describe, it, expect } from "vitest";
import {
  authorize,
  can,
  queryScope,
  canManageUser,
  assignableRoles,
  hasRole,
  type AuthUser,
  type Role,
} from "@/lib/rbac";

const asUser = (role: Role, id = 10): AuthUser => ({ id, role });

describe("RBAC — collection & instance authorization", () => {
  it("user: creates cases, reads/updates only own", () => {
    const u = asUser("user", 10);
    expect(can(u, "cases", "create")).toBe(true);
    // own case (createdBy = me)
    expect(can(u, "cases", "read", { createdBy: 10, assignedTo: 99 })).toBe(true);
    // someone else's case
    expect(can(u, "cases", "read", { createdBy: 77, assignedTo: 99 })).toBe(false);
    expect(can(u, "cases", "update", { createdBy: 77 })).toBe(false);
    expect(can(u, "cases", "delete")).toBe(false);
    expect(can(u, "users", "manage_users")).toBe(false);
  });

  it("staff: reads only assigned cases", () => {
    const s = asUser("staff", 20);
    expect(can(s, "cases", "read", { createdBy: 1, assignedTo: 20 })).toBe(true);
    expect(can(s, "cases", "read", { createdBy: 1, assignedTo: 99 })).toBe(false);
    expect(can(s, "cases", "assign")).toBe(false); // staff cannot assign
    expect(can(s, "users", "read")).toBe(true); // staff read all users
  });

  it("manager: reads all cases, can assign, cannot delete", () => {
    const m = asUser("manager");
    expect(can(m, "cases", "read", { createdBy: 1, assignedTo: 2 })).toBe(true);
    expect(can(m, "cases", "assign")).toBe(true);
    expect(can(m, "cases", "delete")).toBe(false);
    expect(can(m, "analytics", "view_analytics")).toBe(true);
    expect(can(m, "categories", "create")).toBe(true);
    expect(can(m, "categories", "delete")).toBe(false);
  });

  it("admin: full CRUD on cases and users", () => {
    const a = asUser("admin");
    expect(can(a, "cases", "delete", { createdBy: 1 })).toBe(true);
    expect(can(a, "users", "manage_users")).toBe(true);
    expect(can(a, "case_statuses", "update")).toBe(true);
    expect(can(a, "system", "manage_settings")).toBe(false); // system is super_admin only
  });

  it("super_admin: bypasses the matrix for everything", () => {
    const sa = asUser("super_admin");
    expect(can(sa, "system", "manage_settings")).toBe(true);
    expect(can(sa, "cases", "delete", { createdBy: 999 })).toBe(true);
    expect(authorize(sa, "analytics", "export").restriction).toBe("all");
  });

  it("denies unknown grants with a machine code", () => {
    const u = asUser("user");
    const res = authorize(u, "system", "read");
    expect(res.allowed).toBe(false);
    expect(res.code).toBe("NO_PERMISSION");
  });
});

describe("RBAC — query scoping", () => {
  it("scopes list queries by ownership field", () => {
    expect(queryScope(asUser("user", 10), "cases")).toEqual({
      kind: "field",
      field: "createdBy",
      value: 10,
    });
    expect(queryScope(asUser("staff", 20), "cases")).toEqual({
      kind: "field",
      field: "assignedTo",
      value: 20,
    });
    expect(queryScope(asUser("manager"), "cases")).toEqual({ kind: "all" });
    expect(queryScope(asUser("super_admin"), "cases")).toEqual({ kind: "all" });
    expect(queryScope(asUser("user", 10), "notifications")).toEqual({
      kind: "field",
      field: "userId",
      value: 10,
    });
    expect(queryScope(asUser("user"), "system")).toEqual({ kind: "none" });
  });
});

describe("RBAC — user management hierarchy", () => {
  it("canManageUser respects strict precedence", () => {
    expect(canManageUser(asUser("manager"), "staff")).toBe(true);
    expect(canManageUser(asUser("manager"), "manager")).toBe(false);
    expect(canManageUser(asUser("admin"), "manager")).toBe(true);
    expect(canManageUser(asUser("admin"), "admin")).toBe(false);
    expect(canManageUser(asUser("super_admin"), "admin")).toBe(true);
    expect(canManageUser(asUser("super_admin"), "super_admin")).toBe(false);
  });

  it("assignableRoles are strictly below the actor", () => {
    expect(assignableRoles(asUser("admin"))).toEqual(["user", "staff", "manager"]);
    expect(assignableRoles(asUser("super_admin"))).toEqual([
      "user",
      "staff",
      "manager",
      "admin",
    ]);
    expect(assignableRoles(asUser("user"))).toEqual([]);
  });

  it("hasRole is hierarchical", () => {
    expect(hasRole(asUser("admin"), "staff")).toBe(true);
    expect(hasRole(asUser("staff"), "admin")).toBe(false);
  });
});
