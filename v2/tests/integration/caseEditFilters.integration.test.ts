/**
 * Case edit (PUT) + list filters/search via the real route handlers.
 * Self-skips without DATABASE_URL.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, cases, caseHistory, auditLogs, type User } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { signAccessToken } from "@/lib/auth/jwt";
import * as usersRepo from "@/db/repositories/users";
import * as casesRepo from "@/db/repositories/cases";
import {
  listCategories,
  listPriorities,
  listChannels,
  listStatuses,
} from "@/db/repositories/referenceData";
import { PUT as updateRoute } from "@/app/api/cases/[id]/route";
import { GET as listRoute } from "@/app/api/cases/route";

const hasDb = !!process.env.DATABASE_URL;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (params: Record<string, string> = {}): Ctx => ({
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

describe.skipIf(!hasDb)("Case edit + filters (integration)", () => {
  const stamp = Date.now();
  const uniq = `zfilter${stamp}`;
  let owner: User;
  let outsider: User;
  let caseId: number;
  let categoryId: number;
  let otherCategoryId: number;

  beforeAll(async () => {
    owner = await usersRepo.createUser({
      username: `edit_${stamp}`,
      email: `edit_${stamp}@test.local`,
      password: "x",
      firstName: "Edi",
      lastName: "Tor",
      role: "user",
    });
    outsider = await usersRepo.createUser({
      username: `edit2_${stamp}`,
      email: `edit2_${stamp}@test.local`,
      password: "x",
      firstName: "Out",
      lastName: "Sider",
      role: "user",
    });

    const cats = await listCategories();
    categoryId = cats[0].id;
    otherCategoryId = cats[1].id;
    const [pri] = await listPriorities();
    const [ch] = await listChannels();
    const c = await casesRepo.createCase(
      {
        title: `Original ${uniq}`,
        description: "case edit/filter test",
        categoryId,
        priorityId: pri.id,
        channelId: ch.id,
      },
      owner.id,
    );
    caseId = c.id;
  });

  afterAll(async () => {
    await db.delete(cases).where(inArray(cases.id, [caseId]));
    const ids = [owner.id, outsider.id];
    await db.delete(auditLogs).where(inArray(auditLogs.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
    await pool.end();
  });

  it("the owner edits title + category; history logs an UPDATE", async () => {
    const res = await updateRoute(
      req(`/api/cases/${caseId}`, {
        method: "PUT",
        cookie: await cookieFor(owner),
        body: { title: `Edited ${uniq}`, categoryId: otherCategoryId },
      }),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.case.title).toBe(`Edited ${uniq}`);
    expect(body.data.case.categoryId).toBe(otherCategoryId);

    const history = await db
      .select()
      .from(caseHistory)
      .where(eq(caseHistory.caseId, caseId));
    expect(history.some((h) => h.actionType === "UPDATE")).toBe(true);
  });

  it("a non-owner 'user' cannot edit the case", async () => {
    const res = await updateRoute(
      req(`/api/cases/${caseId}`, {
        method: "PUT",
        cookie: await cookieFor(outsider),
        body: { title: "Hijacked" },
      }),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(403);
  });

  it("status transitions cannot be smuggled through PUT", async () => {
    const statuses = await listStatuses();
    const closed = statuses.find((s) => s.name === "Closed")!;
    const res = await updateRoute(
      req(`/api/cases/${caseId}`, {
        method: "PUT",
        cookie: await cookieFor(owner),
        body: { statusId: closed.id },
      }),
      ctx({ id: String(caseId) }),
    );
    // statusId is stripped by the schema — the case's status must not change.
    expect(res.status).toBe(200);
    const [row] = await db.select().from(cases).where(eq(cases.id, caseId));
    expect(row.statusId).not.toBe(closed.id);
  });

  it("search finds the case by its edited title and by case number", async () => {
    const cookie = await cookieFor(owner);
    const byTitle = await listRoute(
      req(`/api/cases?search=${uniq}`, { cookie }),
      ctx(),
    );
    const titleBody = await byTitle.json();
    expect(titleBody.data.some((c: { id: number }) => c.id === caseId)).toBe(true);

    const [row] = await db.select().from(cases).where(eq(cases.id, caseId));
    const byNumber = await listRoute(
      req(`/api/cases?search=${row.caseNumber}`, { cookie }),
      ctx(),
    );
    expect((await byNumber.json()).data).toHaveLength(1);

    const miss = await listRoute(
      req(`/api/cases?search=nosuchcase${stamp}`, { cookie }),
      ctx(),
    );
    expect((await miss.json()).data).toHaveLength(0);
  });

  it("category filter includes/excludes correctly", async () => {
    const cookie = await cookieFor(owner);
    const match = await listRoute(
      req(`/api/cases?categoryId=${otherCategoryId}&search=${uniq}`, { cookie }),
      ctx(),
    );
    expect((await match.json()).data.some((c: { id: number }) => c.id === caseId)).toBe(true);

    const nomatch = await listRoute(
      req(`/api/cases?categoryId=${categoryId}&search=${uniq}`, { cookie }),
      ctx(),
    );
    expect((await nomatch.json()).data).toHaveLength(0);
  });
});
