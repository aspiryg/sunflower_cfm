/**
 * Notifications — trigger fan-out via the real route handlers + self-scoping.
 * Self-skips without DATABASE_URL.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, cases, auditLogs, type User } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { signAccessToken } from "@/lib/auth/jwt";
import * as usersRepo from "@/db/repositories/users";
import * as casesRepo from "@/db/repositories/cases";
import {
  listNotifications,
  markRead,
  markAllRead,
} from "@/db/repositories/notifications";
import {
  listCategories,
  listPriorities,
  listChannels,
} from "@/db/repositories/referenceData";
import { PATCH as assignRoute } from "@/app/api/cases/[id]/assign/route";
import { PATCH as statusRoute } from "@/app/api/cases/[id]/status/route";
import { POST as commentsRoute } from "@/app/api/cases/[id]/comments/route";
import { GET as listRoute } from "@/app/api/notifications/route";

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

describe.skipIf(!hasDb)("Notifications (integration)", () => {
  const stamp = Date.now();
  let manager: User;
  let staffer: User;
  let caseId: number;

  beforeAll(async () => {
    manager = await usersRepo.createUser({
      username: `mgr_${stamp}`,
      email: `mgr_${stamp}@test.local`,
      password: "x",
      firstName: "Mana",
      lastName: "Ger",
      role: "manager",
    });
    staffer = await usersRepo.createUser({
      username: `stf_${stamp}`,
      email: `stf_${stamp}@test.local`,
      password: "x",
      firstName: "Sta",
      lastName: "Ff",
      role: "staff",
    });

    const [cat] = await listCategories();
    const [pri] = await listPriorities();
    const [ch] = await listChannels();
    const c = await casesRepo.createCase(
      {
        title: "Notify test case",
        description: "notification trigger test",
        categoryId: cat.id,
        priorityId: pri.id,
        channelId: ch.id,
      },
      manager.id,
    );
    caseId = c.id;
  });

  afterAll(async () => {
    await db.delete(cases).where(inArray(cases.id, [caseId]));
    const ids = [manager.id, staffer.id];
    await db.delete(auditLogs).where(inArray(auditLogs.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
    await pool.end();
  });

  it("assigning a case notifies the assignee (not the actor)", async () => {
    const res = await assignRoute(
      req(`/api/cases/${caseId}/assign`, {
        method: "PATCH",
        cookie: await cookieFor(manager),
        body: { assignedTo: staffer.id },
      }),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(200);

    const staffNotifs = await listNotifications(staffer.id);
    expect(staffNotifs.data.some((n) => n.type === "case_assigned")).toBe(true);
    expect(staffNotifs.unread).toBeGreaterThan(0);
    const n = staffNotifs.data.find((x) => x.type === "case_assigned")!;
    expect(n.actionUrl).toBe(`/cases/${caseId}`);
    expect(n.triggerUserId).toBe(manager.id);

    // The actor got nothing.
    const mgrNotifs = await listNotifications(manager.id);
    expect(mgrNotifs.data.some((n2) => n2.type === "case_assigned")).toBe(false);
  });

  it("status change by the assignee notifies the creator", async () => {
    const { data: statuses } = await (async () => {
      const { caseStatuses } = await import("@/db/schema");
      return { data: await db.select().from(caseStatuses) };
    })();
    const inProgress = statuses.find((s) => s.name === "In Progress")!;

    const res = await statusRoute(
      req(`/api/cases/${caseId}/status`, {
        method: "PATCH",
        cookie: await cookieFor(staffer),
        body: { statusId: inProgress.id },
      }),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(200);

    const mgrNotifs = await listNotifications(manager.id);
    expect(mgrNotifs.data.some((n) => n.type === "case_status_changed")).toBe(true);
  });

  it("a comment notifies the other stakeholder", async () => {
    const res = await commentsRoute(
      req(`/api/cases/${caseId}/comments`, {
        method: "POST",
        cookie: await cookieFor(manager),
        body: { comment: "Please investigate." },
      }),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(201);

    const staffNotifs = await listNotifications(staffer.id);
    expect(staffNotifs.data.some((n) => n.type === "comment_added")).toBe(true);
  });

  it("the notifications API is self-scoped and reports unread counts", async () => {
    const res = await listRoute(
      req("/api/notifications", { cookie: await cookieFor(staffer) }),
      ctx(),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary.unread).toBeGreaterThan(0);
    // Every row belongs to the requesting user.
    expect(
      body.data.every((n: { userId: number }) => n.userId === staffer.id),
    ).toBe(true);
  });

  it("cannot mark someone else's notification read; mark-all clears own unread", async () => {
    const mgrNotifs = await listNotifications(manager.id);
    const foreign = mgrNotifs.data[0];
    expect(foreign).toBeTruthy();

    // Staffer trying to mark the manager's notification → scoped out.
    expect(await markRead(foreign.id, staffer.id)).toBeUndefined();

    const cleared = await markAllRead(staffer.id);
    expect(cleared).toBeGreaterThan(0);
    const after = await listNotifications(staffer.id);
    expect(after.unread).toBe(0);
  });
});
