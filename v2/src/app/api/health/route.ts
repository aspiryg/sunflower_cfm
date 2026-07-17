import { NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Liveness + DB readiness. Decoupled: the app answers even when the DB check
 * fails (returns degraded), mirroring the v1 boot lesson (server != DB).
 */
export async function GET() {
  let database: "up" | "down" = "down";
  try {
    if (process.env.DATABASE_URL) {
      await pool.query("SELECT 1");
      database = "up";
    }
  } catch {
    database = "down";
  }

  const healthy = database === "up" || !process.env.DATABASE_URL;

  return NextResponse.json(
    {
      success: healthy,
      status: healthy ? "ok" : "degraded",
      services: { server: "up", database },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
