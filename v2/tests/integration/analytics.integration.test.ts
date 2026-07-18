/**
 * Dashboard analytics aggregates — scoping + counts via the real route handler.
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
  listCategories,
  listPriorities,
  listChannels,
} from "@/db/repositories/referenceData";
import { GET as analyticsRoute } from "@/app/api/cases/analytics/route";

const hasDb = !!process.env.DATABASE_URL;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (): Ctx => ({ params: Promise.resolve({}) });

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

describe.skipIf(!hasDb)("Case analytics (integration)", () => {
  const stamp = Date.now();
  let alice: User;
  let bob: User;
  const caseIds: number[] = [];
  let categoryId: number;

  beforeAll(async () => {
    alice = await usersRepo.createUser({
      username: `ana_${stamp}`, email: `ana_${stamp}@test.local`, password: "x",
      firstName: "Ana", lastName: "Lytics", role: "user",
    });
    bob = await usersRepo.createUser({
      username: `anb_${stamp}`, email: `anb_${stamp}@test.local`, password: "x",
      firstName: "Bob", lastName: "Lytics", role: "user",
    });
    const [cat] = await listCategories();
    categoryId = cat.id;
    const [pri] = await listPriorities();
    const [ch] = await listChannels();
    for (const [owner, n] of [[alice, 2], [bob, 1]] as const) {
      for (let i = 0; i < n; i++) {
        const c = await casesRepo.createCase(
          { title: `Analytics ${owner.username} ${i}`, description: "analytics scoping test", categoryId, priorityId: pri.id, channelId: ch.id },
          owner.id,
        );
        caseIds.push(c.id);
      }
    }
  });

  afterAll(async () => {
    await db.delete(cases).where(inArray(cases.id, caseIds));
    const ids = [alice.id, bob.id];
    await db.delete(auditLogs).where(inArray(auditLogs.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
    await pool.end();
  });

  it("a 'user' role only sees their own cases in the aggregates", async () => {
    const res = await analyticsRoute(
      new NextRequest(new URL("/api/cases/analytics", "http://localhost"), {
        headers: new Headers({ cookie: await cookieFor(alice) }),
      }),
      ctx(),
    );
    expect(res.status).toBe(200);
    const a = (await res.json()).data;

    const totalFromStatus = a.byStatus.reduce(
      (sum: number, s: { count: number }) => sum + s.count, 0);
    expect(totalFromStatus).toBe(2); // alice's cases only, not bob's

    const catRow = a.byCategory.find((c: { id: number }) => c.id === categoryId);
    expect(catRow?.count).toBe(2);

    const trendTotal = a.trend.reduce(
      (sum: number, p: { count: number }) => sum + p.count, 0);
    expect(trendTotal).toBe(2);
    expect(a.byStatus[0]).toHaveProperty("color");
    expect(a.byCategory[0]).toHaveProperty("arabicName");
  });
});
