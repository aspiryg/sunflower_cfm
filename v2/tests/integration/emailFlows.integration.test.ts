/**
 * Email flows — verification + password reset end-to-end via the real route
 * handlers and the console email transport (the raw token is extracted from
 * the captured email, exactly as a user would follow the link).
 * Self-skips without DATABASE_URL.
 */
import { describe, it, expect, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, auditLogs } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";
process.env.EMAIL_TRANSPORT = "console";

import { consoleMailbox } from "@/lib/email";
import { verifyPassword } from "@/lib/auth/service";
import { POST as registerRoute } from "@/app/api/auth/register/route";
import { POST as requestVerifyRoute } from "@/app/api/auth/verify-email/request/route";
import { GET as verifyRoute } from "@/app/api/auth/verify-email/[token]/route";
import { POST as forgotRoute } from "@/app/api/auth/forgot-password/route";
import { POST as resetRoute } from "@/app/api/auth/reset-password/[token]/route";
import { POST as loginRoute } from "@/app/api/auth/login/route";

const hasDb = !!process.env.DATABASE_URL;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (params: Record<string, string> = {}): Ctx => ({
  params: Promise.resolve(params),
});

function req(path: string, opts: { method?: string; body?: unknown } = {}): NextRequest {
  const headers = new Headers();
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  headers.set("x-forwarded-for", "203.0.113.9");
  return new NextRequest(new URL(path, "http://localhost"), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}

/** Pull the raw token out of the last console email's link. */
function tokenFromLastEmail(pathSegment: string): string {
  const mail = consoleMailbox.last;
  expect(mail).toBeTruthy();
  const m = mail!.text.match(new RegExp(`/${pathSegment}/([a-f0-9]{64})`));
  expect(m).toBeTruthy();
  return m![1];
}

// Wait for fire-and-forget email sends to settle.
const settle = () => new Promise((r) => setTimeout(r, 50));

describe.skipIf(!hasDb)("Email flows (integration)", () => {
  const stamp = Date.now();
  const email = `mailflow_${stamp}@test.local`;
  const createdUserIds: number[] = [];

  afterAll(async () => {
    if (createdUserIds.length) {
      await db.delete(auditLogs).where(inArray(auditLogs.userId, createdUserIds));
      await db.delete(users).where(inArray(users.id, createdUserIds));
    }
    await pool.end();
  });

  it("registration sends a verification email whose token verifies the account", async () => {
    const res = await registerRoute(
      req("/api/auth/register", {
        method: "POST",
        body: {
          email,
          password: "Passw0rd!",
          firstName: "Mail",
          lastName: "Flow",
          username: `mailflow_${stamp}`,
        },
      }),
      ctx(),
    );
    expect(res.status).toBe(201);
    const userId = (await res.json()).data.user.id as number;
    createdUserIds.push(userId);
    await settle();

    // Token is stored hashed, never raw.
    const raw = tokenFromLastEmail("verify-email");
    const [row] = await db.select().from(users).where(eq(users.id, userId));
    expect(row.isEmailVerified).toBe(false);
    expect(row.emailVerificationToken).not.toBe(raw);
    expect(row.emailVerificationToken).toMatch(/^[a-f0-9]{64}$/);

    const verify = await verifyRoute(
      req(`/api/auth/verify-email/${raw}`),
      ctx({ token: raw }),
    );
    expect(verify.status).toBe(200);

    const [after] = await db.select().from(users).where(eq(users.id, userId));
    expect(after.isEmailVerified).toBe(true);
    expect(after.emailVerificationToken).toBeNull();

    // A consumed token cannot be replayed.
    const replay = await verifyRoute(
      req(`/api/auth/verify-email/${raw}`),
      ctx({ token: raw }),
    );
    expect(replay.status).toBe(400);
  });

  it("re-requesting verification for a verified account sends nothing", async () => {
    consoleMailbox.last = null;
    const res = await requestVerifyRoute(
      req("/api/auth/verify-email/request", { method: "POST", body: { email } }),
      ctx(),
    );
    expect(res.status).toBe(200);
    await settle();
    expect(consoleMailbox.last).toBeNull();
  });

  it("forgot-password answers 200 for unknown emails (no enumeration) and sends nothing", async () => {
    consoleMailbox.last = null;
    const res = await forgotRoute(
      req("/api/auth/forgot-password", {
        method: "POST",
        body: { email: `nobody_${stamp}@test.local` },
      }),
      ctx(),
    );
    expect(res.status).toBe(200);
    await settle();
    expect(consoleMailbox.last).toBeNull();
  });

  it("password reset flow: email token sets a new password that logs in", async () => {
    const res = await forgotRoute(
      req("/api/auth/forgot-password", { method: "POST", body: { email } }),
      ctx(),
    );
    expect(res.status).toBe(200);
    await settle();
    const raw = tokenFromLastEmail("reset-password");

    // Mismatched confirmation is rejected.
    const mismatch = await resetRoute(
      req(`/api/auth/reset-password/${raw}`, {
        method: "POST",
        body: { password: "NewPassw0rd!", confirmPassword: "Different1!" },
      }),
      ctx({ token: raw }),
    );
    expect(mismatch.status).toBe(400);

    const reset = await resetRoute(
      req(`/api/auth/reset-password/${raw}`, {
        method: "POST",
        body: { password: "NewPassw0rd!", confirmPassword: "NewPassw0rd!" },
      }),
      ctx({ token: raw }),
    );
    expect(reset.status).toBe(200);

    // Old password is dead, new one works.
    const [row] = await db.select().from(users).where(eq(users.email, email));
    expect(await verifyPassword("Passw0rd!", row.password)).toBe(false);
    expect(await verifyPassword("NewPassw0rd!", row.password)).toBe(true);
    expect(row.passwordResetToken).toBeNull();

    const login = await loginRoute(
      req("/api/auth/login", {
        method: "POST",
        body: { email, password: "NewPassw0rd!" },
      }),
      ctx(),
    );
    expect(login.status).toBe(200);

    // Token replay after use fails.
    const replay = await resetRoute(
      req(`/api/auth/reset-password/${raw}`, {
        method: "POST",
        body: { password: "Another1!", confirmPassword: "Another1!" },
      }),
      ctx({ token: raw }),
    );
    expect(replay.status).toBe(400);
  });

  it("an expired reset token is rejected", async () => {
    await forgotRoute(
      req("/api/auth/forgot-password", { method: "POST", body: { email } }),
      ctx(),
    );
    await settle();
    const raw = tokenFromLastEmail("reset-password");
    // Force expiry.
    await db
      .update(users)
      .set({ passwordResetExpires: new Date(Date.now() - 1000) })
      .where(eq(users.email, email));

    const res = await resetRoute(
      req(`/api/auth/reset-password/${raw}`, {
        method: "POST",
        body: { password: "Whatever1!", confirmPassword: "Whatever1!" },
      }),
      ctx({ token: raw }),
    );
    expect(res.status).toBe(400);
  });
});
