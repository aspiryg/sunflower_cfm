/**
 * Standard API envelope: { success, message?, error?, data?, ...extra }.
 * Matches v1's shape so client expectations carry over.
 */
import { NextResponse } from "next/server";

export function ok<T>(
  data?: T,
  message?: string,
  init?: { status?: number; extra?: Record<string, unknown> },
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      ...(data !== undefined ? { data } : {}),
      ...(init?.extra ?? {}),
    },
    { status: init?.status ?? 200 },
  );
}

export function fail(
  status: number,
  message: string,
  code?: string,
  extra?: Record<string, unknown>,
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(code ? { error: code } : {}),
      ...(extra ?? {}),
    },
    { status },
  );
}
