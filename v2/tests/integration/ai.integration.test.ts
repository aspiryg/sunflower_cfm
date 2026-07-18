/**
 * AI classification (Phase 6) — one live round-trip through the real route.
 * Self-skips unless BOTH DATABASE_URL and OPENAI_API_KEY are set (never
 * runs in CI; runs locally when the owner's key is configured).
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, auditLogs, type User } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { signAccessToken } from "@/lib/auth/jwt";
import * as usersRepo from "@/db/repositories/users";
import { listCategories, listPriorities } from "@/db/repositories/referenceData";
import { POST as classifyRoute } from "@/app/api/cases/classify/route";

const hasDb = !!process.env.DATABASE_URL;
const hasAi = !!process.env.OPENAI_API_KEY;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (): Ctx => ({ params: Promise.resolve({}) });

describe.skipIf(!hasDb || !hasAi)("AI classification (integration, live API)", () => {
  const stamp = Date.now();
  let user: User;
  let cookie: string;

  beforeAll(async () => {
    user = await usersRepo.createUser({
      username: `ai_${stamp}`, email: `ai_${stamp}@test.local`, password: "x",
      firstName: "Ai", lastName: "Tester", role: "user",
    });
    cookie = `accessToken=${await signAccessToken({
      id: user.id, email: user.email, username: user.username,
      role: user.role, organization: user.organization,
      isEmailVerified: user.isEmailVerified,
    })}`;
  });

  afterAll(async () => {
    await db.delete(auditLogs).where(inArray(auditLogs.userId, [user.id]));
    await db.delete(users).where(inArray(users.id, [user.id]));
    await pool.end();
  });

  it("suggests a plausible category/priority for a safety report", async () => {
    const res = await classifyRoute(
      new NextRequest(new URL("/api/cases/classify", "http://localhost"), {
        method: "POST",
        headers: new Headers({ "content-type": "application/json", cookie }),
        body: JSON.stringify({
          title: "Unexploded ordnance near the school playground",
          description:
            "Children found a suspicious metal object next to the east fence of the primary school. The area is not cordoned off and classes continue as normal.",
        }),
      }),
      ctx(),
    );
    expect(res.status).toBe(200);
    const { suggestion } = (await res.json()).data;

    const categories = await listCategories();
    const priorities = await listPriorities();
    expect(categories.some((c) => c.id === suggestion.categoryId)).toBe(true);
    expect(priorities.some((p) => p.id === suggestion.priorityId)).toBe(true);
    // A live-ordnance report must not be classified as low urgency.
    expect(["high", "critical"]).toContain(suggestion.urgencyLevel);
    expect(suggestion.rationale.length).toBeGreaterThan(10);
  }, 120_000);
});
