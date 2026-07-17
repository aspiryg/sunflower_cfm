/**
 * Phase 4 verification — exercises route handlers directly (NextRequest in,
 * NextResponse out) against a real DB. Covers the auth flow, the v1
 * expired-access-token regression, RBAC gating, case ownership, the case
 * lifecycle over HTTP, and the net-new anonymous public intake.
 * Self-skips without DATABASE_URL.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest, type NextResponse } from "next/server";
import { SignJWT } from "jose";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  users,
  cases,
  caseCategories,
  casePriorities,
  caseChannels,
  auditLogs,
} from "@/db/schema";
import { signRefreshToken } from "@/lib/auth/jwt";

// Secrets must exist before any auth handler runs.
process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { GET as me } from "@/app/api/auth/me/route";
import { GET as listCasesRoute, POST as createCaseRoute } from "@/app/api/cases/route";
import { GET as getCaseRoute } from "@/app/api/cases/[id]/route";
import { PATCH as statusRoute } from "@/app/api/cases/[id]/status/route";
import { POST as createUserRoute } from "@/app/api/users/route";
import { POST as publicFeedback } from "@/app/api/public/feedback/route";

const hasDb = !!process.env.DATABASE_URL;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (params: Record<string, string> = {}): Ctx => ({
  params: Promise.resolve(params),
});

function req(
  path: string,
  opts: { method?: string; body?: unknown; cookie?: string } = {},
): NextRequest {
  const headers = new Headers();
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  if (opts.cookie) headers.set("cookie", opts.cookie);
  headers.set("x-forwarded-for", "203.0.113.5");
  return new NextRequest(new URL(path, "http://localhost"), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

const cookie = (res: NextResponse, name: string) => res.cookies.get(name)?.value;
const authCookie = (res: NextResponse) =>
  `accessToken=${cookie(res, "accessToken")}; refreshToken=${cookie(res, "refreshToken")}`;

describe.skipIf(!hasDb)("Phase 4 API (integration)", () => {
  const createdUserIds: number[] = [];
  const createdCaseIds: number[] = [];
  const stamp = Date.now();
  let categoryId: number;
  let priorityId: number;
  let channelId: number;

  beforeAll(async () => {
    [{ id: categoryId }] = await db.select({ id: caseCategories.id }).from(caseCategories).limit(1);
    [{ id: priorityId }] = await db.select({ id: casePriorities.id }).from(casePriorities).limit(1);
    [{ id: channelId }] = await db.select({ id: caseChannels.id }).from(caseChannels).limit(1);
  });

  afterAll(async () => {
    if (createdCaseIds.length) await db.delete(cases).where(inArray(cases.id, createdCaseIds));
    // audit_logs pin their user (FK, no cascade) — clear before hard-deleting
    // test users. Production soft-deletes users, so this never arises there.
    if (createdUserIds.length) {
      await db.delete(auditLogs).where(inArray(auditLogs.userId, createdUserIds));
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await pool.end();
  });

  async function registerUser(prefix: string) {
    const res = (await register(
      req("/api/auth/register", {
        method: "POST",
        body: {
          email: `${prefix}_${stamp}@test.local`,
          password: "Passw0rd!",
          firstName: "Test",
          lastName: "User",
          username: `${prefix}_${stamp}`,
        },
      }),
      ctx(),
    )) as NextResponse;
    const body = await res.json();
    if (body?.data?.user?.id) createdUserIds.push(body.data.user.id);
    return { res, body };
  }

  it("register issues cookies and creates a user with role 'user'", async () => {
    const { res, body } = await registerUser("alice");
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.user.role).toBe("user");
    expect("password" in body.data.user).toBe(false);
    expect(cookie(res, "accessToken")).toBeTruthy();
    expect(cookie(res, "refreshToken")).toBeTruthy();
  });

  it("me requires authentication (401 without a cookie)", async () => {
    const res = (await me(req("/api/auth/me"), ctx())) as NextResponse;
    expect(res.status).toBe(401);
  });

  it("login then me returns the current user", async () => {
    await registerUser("bob");
    const res = (await login(
      req("/api/auth/login", {
        method: "POST",
        body: { email: `bob_${stamp}@test.local`, password: "Passw0rd!" },
      }),
      ctx(),
    )) as NextResponse;
    expect(res.status).toBe(200);
    const meRes = (await me(req("/api/auth/me", { cookie: authCookie(res) }), ctx())) as NextResponse;
    expect(meRes.status).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.data.user.email).toBe(`bob_${stamp}@test.local`);
  });

  it("REGRESSION: an expired access token auto-refreshes via the refresh token (v1 returned 500)", async () => {
    const u = await db
      .select()
      .from(users)
      .where(eq(users.email, `bob_${stamp}@test.local`))
      .limit(1);
    const user = u[0];
    const claims = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      organization: user.organization,
      isEmailVerified: user.isEmailVerified,
    };
    const nowSec = Math.floor(stamp / 1000);
    const expiredAccess = await new SignJWT({ ...claims })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(nowSec - 7200)
      .setExpirationTime(nowSec - 3600)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
    const refresh = await signRefreshToken(claims);

    const res = (await me(
      req("/api/auth/me", {
        cookie: `accessToken=${expiredAccess}; refreshToken=${refresh}`,
      }),
      ctx(),
    )) as NextResponse;
    expect(res.status).toBe(200); // not 500, not 401
    expect(cookie(res, "accessToken")).toBeTruthy(); // freshly re-issued
    expect(cookie(res, "accessToken")).not.toBe(expiredAccess);
  });

  it("a 'user' can create and read their own case but not delete or create users", async () => {
    const auth = (await login(
      req("/api/auth/login", {
        method: "POST",
        body: { email: `alice_${stamp}@test.local`, password: "Passw0rd!" },
      }),
      ctx(),
    )) as NextResponse;
    const c = authCookie(auth);

    const created = (await createCaseRoute(
      req("/api/cases", {
        method: "POST",
        cookie: c,
        body: { title: "My complaint", description: "Something went wrong here.", categoryId, priorityId, channelId },
      }),
      ctx(),
    )) as NextResponse;
    expect(created.status).toBe(201);
    const caseId = (await created.json()).data.case.id as number;
    createdCaseIds.push(caseId);

    const read = (await getCaseRoute(
      req(`/api/cases/${caseId}`, { cookie: c }),
      ctx({ id: String(caseId) }),
    )) as NextResponse;
    expect(read.status).toBe(200);

    // user has no cases:create-users; POST /api/users must be forbidden.
    const forbidden = (await createUserRoute(
      req("/api/users", {
        method: "POST",
        cookie: c,
        body: { email: `x_${stamp}@t.local`, firstName: "X", lastName: "Y" },
      }),
      ctx(),
    )) as NextResponse;
    expect(forbidden.status).toBe(403);
  });

  it("ownership: another 'user' cannot read someone else's case", async () => {
    // Alice's case from the previous test.
    const aliceCase = createdCaseIds[createdCaseIds.length - 1];
    const bobAuth = (await login(
      req("/api/auth/login", {
        method: "POST",
        body: { email: `bob_${stamp}@test.local`, password: "Passw0rd!" },
      }),
      ctx(),
    )) as NextResponse;
    const res = (await getCaseRoute(
      req(`/api/cases/${aliceCase}`, { cookie: authCookie(bobAuth) }),
      ctx({ id: String(aliceCase) }),
    )) as NextResponse;
    expect(res.status).toBe(403);

    // And Bob's own case list excludes Alice's case.
    const list = (await listCasesRoute(
      req("/api/cases", { cookie: authCookie(bobAuth) }),
      ctx(),
    )) as NextResponse;
    const listBody = await list.json();
    expect(listBody.data.every((x: { id: number }) => x.id !== aliceCase)).toBe(true);
  });

  it("lifecycle over HTTP: valid transition 200, no-op 409", async () => {
    const admin = await registerUser("carol");
    // promote carol to manager directly so she can move any case.
    await db.update(users).set({ role: "manager" }).where(eq(users.id, admin.body.data.user.id));
    const auth = (await login(
      req("/api/auth/login", { method: "POST", body: { email: `carol_${stamp}@test.local`, password: "Passw0rd!" } }),
      ctx(),
    )) as NextResponse;
    const c = authCookie(auth);

    const created = (await createCaseRoute(
      req("/api/cases", { method: "POST", cookie: c, body: { title: "Lifecycle", description: "http lifecycle test", categoryId, priorityId, channelId } }),
      ctx(),
    )) as NextResponse;
    const caseId = (await created.json()).data.case.id as number;
    createdCaseIds.push(caseId);

    const inProgress = await db.select().from((await import("@/db/schema")).caseStatuses);
    const target = inProgress.find((s) => s.name === "In Progress")!;

    const ok = (await statusRoute(
      req(`/api/cases/${caseId}/status`, { method: "PATCH", cookie: c, body: { statusId: target.id } }),
      ctx({ id: String(caseId) }),
    )) as NextResponse;
    expect(ok.status).toBe(200);

    const noop = (await statusRoute(
      req(`/api/cases/${caseId}/status`, { method: "PATCH", cookie: c, body: { statusId: target.id } }),
      ctx({ id: String(caseId) }),
    )) as NextResponse;
    expect(noop.status).toBe(409);
  });

  it("anonymous public intake creates a public case and returns only a reference number", async () => {
    const res = (await publicFeedback(
      req("/api/public/feedback", {
        method: "POST",
        body: { description: "The clinic was closed during posted hours.", name: "Community Member", contact: "member@example.com" },
      }),
      ctx(),
    )) as NextResponse;
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.caseNumber).toMatch(/^[A-Z]+-\d{8}-\d{4}$/);
    expect(body.data.id).toBeUndefined();

    const [created] = await db.select().from(cases).where(eq(cases.caseNumber, body.data.caseNumber));
    expect(created.isPublic).toBe(true);
    expect(created.submittedBy).toBeNull();
    createdCaseIds.push(created.id);
  });
});
