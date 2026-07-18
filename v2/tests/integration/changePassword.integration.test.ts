/**
 * Change-password endpoint. Self-skips without DATABASE_URL.
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
import { hashPassword } from "@/lib/auth/service";
import { POST as changePassword } from "@/app/api/auth/change-password/route";
import { POST as login } from "@/app/api/auth/login/route";

const hasDb = !!process.env.DATABASE_URL;
type Ctx = { params: Promise<Record<string, string>> };
const ctx = (): Ctx => ({ params: Promise.resolve({}) });

function req(path: string, body: unknown, cookie?: string): NextRequest {
  const headers = new Headers({ "content-type": "application/json" });
  if (cookie) headers.set("cookie", cookie);
  headers.set("x-forwarded-for", "203.0.113.11");
  return new NextRequest(new URL(path, "http://localhost"), {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe.skipIf(!hasDb)("Change password (integration)", () => {
  const stamp = Date.now();
  const email = `pw_${stamp}@test.local`;
  let user: User;
  let cookie: string;

  beforeAll(async () => {
    user = await usersRepo.createUser({
      username: `pw_${stamp}`,
      email,
      password: await hashPassword("OldPassw0rd!"),
      firstName: "Pass",
      lastName: "Word",
      role: "user",
    });
    const token = await signAccessToken({
      id: user.id, email: user.email, username: user.username,
      role: user.role, organization: user.organization,
      isEmailVerified: user.isEmailVerified,
    });
    cookie = `accessToken=${token}`;
  });

  afterAll(async () => {
    await db.delete(auditLogs).where(inArray(auditLogs.userId, [user.id]));
    await db.delete(users).where(inArray(users.id, [user.id]));
    await pool.end();
  });

  it("rejects a wrong current password", async () => {
    const res = await changePassword(
      req("/api/auth/change-password", {
        currentPassword: "Wrong1!",
        newPassword: "FreshPassw0rd!",
        confirmPassword: "FreshPassw0rd!",
      }, cookie),
      ctx(),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("INCORRECT_CURRENT_PASSWORD");
  });

  it("changes the password; the new one logs in, the old one doesn't", async () => {
    const res = await changePassword(
      req("/api/auth/change-password", {
        currentPassword: "OldPassw0rd!",
        newPassword: "FreshPassw0rd!",
        confirmPassword: "FreshPassw0rd!",
      }, cookie),
      ctx(),
    );
    expect(res.status).toBe(200);

    const oldLogin = await login(
      req("/api/auth/login", { email, password: "OldPassw0rd!" }),
      ctx(),
    );
    expect(oldLogin.status).toBe(401);

    const newLogin = await login(
      req("/api/auth/login", { email, password: "FreshPassw0rd!" }),
      ctx(),
    );
    expect(newLogin.status).toBe(200);
  });
});
