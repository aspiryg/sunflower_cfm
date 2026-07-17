/**
 * Route-handler wrappers. `handler` adds uniform error handling + optional rate
 * limiting; `authed` additionally authenticates, enforces a collection-level
 * RBAC grant, and re-issues a refreshed access-token cookie when the session
 * layer rotated it. Instance-level ownership is checked inside handlers via
 * `authorize(user, resource, action, targetRow)`.
 */
import type { NextRequest, NextResponse } from "next/server";
import { authenticate, type AuthContext } from "@/lib/auth/session";
import { setAccessCookie } from "@/lib/auth/cookies";
import { can, type Resource, type Action } from "@/lib/rbac";
import { fail } from "./respond";
import { allow, clientKey, type RateLimit } from "./rateLimit";

// Next 15 passes params as a promise.
export type RouteCtx = { params: Promise<Record<string, string>> };

interface BaseOpts {
  rate?: RateLimit;
  rateScope?: string;
}
interface AuthOpts extends BaseOpts {
  resource?: Resource;
  action?: Action;
}

export function handler(
  fn: (req: NextRequest, ctx: RouteCtx) => Promise<NextResponse>,
  opts: BaseOpts = {},
) {
  return async (req: NextRequest, ctx: RouteCtx): Promise<NextResponse> => {
    try {
      if (opts.rate && !allow(clientKey(req, opts.rateScope ?? "general"), opts.rate)) {
        return fail(429, "Too many requests. Please try again later.", "RATE_LIMITED");
      }
      return await fn(req, ctx);
    } catch (err) {
      console.error("[api] unhandled error:", err);
      return fail(500, "Internal server error", "INTERNAL");
    }
  };
}

export function authed(
  fn: (
    req: NextRequest,
    auth: AuthContext,
    ctx: RouteCtx,
  ) => Promise<NextResponse>,
  opts: AuthOpts = {},
) {
  return handler(async (req, ctx) => {
    const auth = await authenticate(req);
    if (!auth) {
      return fail(401, "Authentication required.", "UNAUTHENTICATED");
    }
    if (opts.resource && opts.action && !can(auth.user, opts.resource, opts.action)) {
      return fail(403, "You do not have permission to perform this action.", "FORBIDDEN");
    }
    const res = await fn(req, auth, ctx);
    if (auth.refreshedAccessToken) setAccessCookie(res, auth.refreshedAccessToken);
    return res;
  }, opts);
}
