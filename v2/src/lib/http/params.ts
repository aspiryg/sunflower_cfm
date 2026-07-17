import type { RouteCtx } from "./guard";

/** Parse a positive-integer route param; returns null if missing/invalid. */
export async function paramInt(
  ctx: RouteCtx,
  key: string,
): Promise<number | null> {
  const params = await ctx.params;
  const n = Number(params[key]);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Parse a string route param. */
export async function paramStr(
  ctx: RouteCtx,
  key: string,
): Promise<string | undefined> {
  const params = await ctx.params;
  return params[key];
}
