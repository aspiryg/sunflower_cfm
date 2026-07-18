/**
 * Reference-data admin (settings screen backend) via the real route handlers.
 * Self-skips without DATABASE_URL.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, caseCategories, auditLogs, type User } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { signAccessToken } from "@/lib/auth/jwt";
import * as usersRepo from "@/db/repositories/users";
import {
  GET as refRoute,
  POST as refCreateRoute,
} from "@/app/api/reference/[resource]/route";
import { PATCH as refUpdateRoute } from "@/app/api/reference/[resource]/[id]/route";

const hasDb = !!process.env.DATABASE_URL;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (params: Record<string, string>): Ctx => ({
  params: Promise.resolve(params),
});

async function cookieFor(u: User): Promise<string> {
  const token = await signAccessToken({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    organization: u.organization,
    isEmailVerified: u.isEmailVerified,
  });
  return `accessToken=${token}`;
}

function req(
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string } = {},
): NextRequest {
  const headers = new Headers();
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  if (opts.cookie) headers.set("cookie", opts.cookie);
  return new NextRequest(new URL(path, "http://localhost"), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

describe.skipIf(!hasDb)("Reference admin (integration)", () => {
  const stamp = Date.now();
  const name = `Test Category ${stamp}`;
  let manager: User;
  let plainUser: User;
  let createdId: number;

  beforeAll(async () => {
    manager = await usersRepo.createUser({
      username: `refmgr_${stamp}`,
      email: `refmgr_${stamp}@test.local`,
      password: "x",
      firstName: "Ref",
      lastName: "Mgr",
      role: "manager",
    });
    plainUser = await usersRepo.createUser({
      username: `refusr_${stamp}`,
      email: `refusr_${stamp}@test.local`,
      password: "x",
      firstName: "Ref",
      lastName: "Usr",
      role: "user",
    });
  });

  afterAll(async () => {
    if (createdId)
      await db.delete(caseCategories).where(eq(caseCategories.id, createdId));
    const ids = [manager.id, plainUser.id];
    await db.delete(auditLogs).where(inArray(auditLogs.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
    await pool.end();
  });

  it("a manager creates a category with an Arabic name", async () => {
    const res = await refCreateRoute(
      req("/api/reference/categories", {
        method: "POST",
        cookie: await cookieFor(manager),
        // High sortOrder so parallel test files never pick this row as their
        // "first category" and then race against our afterAll hard-delete.
        body: { name, arabicName: "فئة اختبار", sortOrder: 9999 },
      }),
      ctx({ resource: "categories" }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    createdId = body.data.item.id;
    expect(body.data.item.arabicName).toBe("فئة اختبار");
  });

  it("a plain user cannot create reference data", async () => {
    const res = await refCreateRoute(
      req("/api/reference/categories", {
        method: "POST",
        cookie: await cookieFor(plainUser),
        body: { name: `Nope ${stamp}` },
      }),
      ctx({ resource: "categories" }),
    );
    expect(res.status).toBe(403);
  });

  it("statuses are admin-only (lifecycle-critical): a manager is forbidden", async () => {
    const res = await refCreateRoute(
      req("/api/reference/statuses", {
        method: "POST",
        cookie: await cookieFor(manager),
        body: { name: "Sneaky Status", color: "#123456" },
      }),
      ctx({ resource: "statuses" }),
    );
    expect(res.status).toBe(403);
  });

  it("regions require a code", async () => {
    const res = await refCreateRoute(
      req("/api/reference/regions", {
        method: "POST",
        cookie: await cookieFor(manager),
        body: { name: `Nowhere ${stamp}` },
      }),
      ctx({ resource: "regions" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("MISSING_CODE");
  });

  it("deactivating hides the row from public lists but keeps it in the admin list", async () => {
    const cookie = await cookieFor(manager);
    const patch = await refUpdateRoute(
      req(`/api/reference/categories/${createdId}`, {
        method: "PATCH",
        cookie,
        body: { isActive: false },
      }),
      ctx({ resource: "categories", id: String(createdId) }),
    );
    expect(patch.status).toBe(200);

    const pub = await refRoute(
      req("/api/reference/categories", { cookie }),
      ctx({ resource: "categories" }),
    );
    const pubRows = (await pub.json()).data as { id: number }[];
    expect(pubRows.some((r) => r.id === createdId)).toBe(false);

    const admin = await refRoute(
      req("/api/reference/categories?all=true", { cookie }),
      ctx({ resource: "categories" }),
    );
    const adminRows = (await admin.json()).data as { id: number; isActive: boolean }[];
    const mine = adminRows.find((r) => r.id === createdId);
    expect(mine).toBeTruthy();
    expect(mine!.isActive).toBe(false);
  });

  it("hierarchy: creates a governorate under a region (code required, parent required)", async () => {
    const cookie = await cookieFor(manager);
    // Find the seeded West Bank region.
    const regions = await refRoute(
      req("/api/reference/regions", { cookie }),
      ctx({ resource: "regions" }),
    );
    const wb = ((await regions.json()).data as { id: number; name: string }[]).find(
      (r) => r.name === "West Bank",
    )!;

    // Missing parent → 400.
    const noParent = await refCreateRoute(
      req("/api/reference/governorates", {
        method: "POST",
        cookie,
        body: { name: `Gov ${stamp}`, code: "GV" },
      }),
      ctx({ resource: "governorates" }),
    );
    expect(noParent.status).toBe(400);
    expect((await noParent.json()).error).toBe("MISSING_PARENT");

    // Missing code → 400.
    const noCode = await refCreateRoute(
      req("/api/reference/governorates", {
        method: "POST",
        cookie,
        body: { name: `Gov ${stamp}`, parentId: wb.id },
      }),
      ctx({ resource: "governorates" }),
    );
    expect(noCode.status).toBe(400);
    expect((await noCode.json()).error).toBe("MISSING_CODE");

    // Valid create.
    const created = await refCreateRoute(
      req("/api/reference/governorates", {
        method: "POST",
        cookie,
        body: { name: `Gov ${stamp}`, arabicName: "محافظة اختبار", code: "GV", parentId: wb.id, sortOrder: 9999 },
      }),
      ctx({ resource: "governorates" }),
    );
    expect(created.status).toBe(201);
    const gov = (await created.json()).data.item as { id: number; regionId: number };
    expect(gov.regionId).toBe(wb.id);

    // Public drill-down sees it under the region.
    const drill = await refRoute(
      req(`/api/reference/governorates?regionId=${wb.id}`, { cookie }),
      ctx({ resource: "governorates" }),
    );
    const drillRows = (await drill.json()).data as { id: number }[];
    expect(drillRows.some((g) => g.id === gov.id)).toBe(true);

    // Cleanup (region cascade would also cover it, but the region is seeded).
    const { governorates } = await import("@/db/schema");
    const { eq: eqOp } = await import("drizzle-orm");
    await db.delete(governorates).where(eqOp(governorates.id, gov.id));
  });

  it("renaming works; the admin listing is forbidden for plain users", async () => {
    const cookie = await cookieFor(manager);
    const rename = await refUpdateRoute(
      req(`/api/reference/categories/${createdId}`, {
        method: "PATCH",
        cookie,
        body: { name: `${name} v2` },
      }),
      ctx({ resource: "categories", id: String(createdId) }),
    );
    expect(rename.status).toBe(200);
    expect((await rename.json()).data.item.name).toBe(`${name} v2`);

    const denied = await refRoute(
      req("/api/reference/categories?all=true", {
        cookie: await cookieFor(plainUser),
      }),
      ctx({ resource: "categories" }),
    );
    expect(denied.status).toBe(403);
  });
});
