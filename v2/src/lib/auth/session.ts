/**
 * Request authentication. Verifies the access token; if it's absent or expired
 * but a valid refresh token is present, transparently mints a new access token
 * (surfaced as `refreshedAccessToken` for the guard to set as a cookie).
 *
 * Always re-loads the user from the DB so role changes and deactivations take
 * effect immediately and a token for a deleted/inactive user is rejected.
 */
import type { NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  type JwtClaims,
} from "./jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "./cookies";
import { findUserById } from "@/db/repositories/users";
import type { AuthUser } from "@/lib/rbac";

export interface SessionUser extends AuthUser {
  email: string;
  username: string;
  organization: string | null;
  isEmailVerified: boolean;
}

export interface AuthContext {
  user: SessionUser;
  /** Set when the access token was refreshed and must be re-issued as a cookie. */
  refreshedAccessToken?: string;
}

function claimsFor(user: SessionUser): JwtClaims {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    organization: user.organization,
    isEmailVerified: user.isEmailVerified,
  };
}

async function loadSessionUser(id: number): Promise<SessionUser | null> {
  const u = await findUserById(id); // repo filters inactive/deleted
  if (!u) return null;
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    username: u.username,
    organization: u.organization,
    isEmailVerified: u.isEmailVerified,
  };
}

export async function authenticate(
  req: NextRequest,
): Promise<AuthContext | null> {
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  if (access) {
    const r = await verifyAccessToken(access);
    if (r.ok) {
      const user = await loadSessionUser(r.claims.id);
      return user ? { user } : null;
    }
    // expired/invalid → fall through to refresh
  }

  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    const r = await verifyRefreshToken(refresh);
    if (r.ok) {
      const user = await loadSessionUser(r.claims.id);
      if (!user) return null;
      const refreshedAccessToken = await signAccessToken(claimsFor(user));
      return { user, refreshedAccessToken };
    }
  }

  return null;
}
