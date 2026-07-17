/**
 * Auth cookie management. httpOnly so tokens are never exposed to JS (v1
 * convention preserved). Read/written via NextResponse so route handlers stay
 * unit-testable (no dependency on the next/headers request context).
 */
import type { NextResponse } from "next/server";

export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";

const ACCESS_MAX_AGE = 60 * 60; // 1h
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7d
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 30; // 30d

function options(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
  remember = false,
) {
  const maxAge = remember ? REMEMBER_MAX_AGE : REFRESH_MAX_AGE;
  res.cookies.set(ACCESS_COOKIE, accessToken, options(remember ? maxAge : ACCESS_MAX_AGE));
  res.cookies.set(REFRESH_COOKIE, refreshToken, options(maxAge));
}

export function setAccessCookie(res: NextResponse, accessToken: string) {
  res.cookies.set(ACCESS_COOKIE, accessToken, options(ACCESS_MAX_AGE));
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", options(0));
  res.cookies.set(REFRESH_COOKIE, "", options(0));
}
