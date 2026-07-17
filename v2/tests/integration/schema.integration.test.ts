/**
 * Phase 2 verification — runs against a real Postgres+pgvector database.
 * Skipped automatically when DATABASE_URL is unset (e.g. CI unit lane), so it
 * never fails for lack of a DB. Run locally with:
 *   DATABASE_URL=postgresql://cfm:cfm@localhost:55432/cfm npm test
 */
import { describe, it, expect, afterAll } from "vitest";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  cases,
  caseComments,
  caseCategories,
  casePriorities,
  caseStatuses,
  caseChannels,
} from "@/db/schema";

const hasDb = !!process.env.DATABASE_URL;
const EXPECTED_TABLES = [
  "users",
  "case_categories",
  "case_statuses",
  "case_priorities",
  "case_channels",
  "provider_types",
  "regions",
  "governorates",
  "communities",
  "programs",
  "projects",
  "activities",
  "cases",
  "case_history",
  "case_comments",
  "case_assignments",
  "case_attachments",
  "notifications",
  "system_settings",
  "user_sessions",
  "audit_logs",
];

describe.skipIf(!hasDb)("Phase 2 schema (integration)", () => {
  let caseId: number | undefined;

  afterAll(async () => {
    if (caseId) await db.delete(cases).where(eq(cases.id, caseId));
    await pool.end();
  });

  it("has all 21 domain tables (spec parity)", async () => {
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'",
    );
    const names = res.rows.map((r) => r.table_name);
    for (const t of EXPECTED_TABLES) expect(names).toContain(t);
  });

  it("has the pgvector extension and a vector(1024) embedding column", async () => {
    const ext = await pool.query(
      "SELECT 1 FROM pg_extension WHERE extname='vector'",
    );
    expect(ext.rowCount).toBe(1);
    const col = await pool.query(
      "SELECT format_type(atttypid, atttypmod) AS t FROM pg_attribute WHERE attrelid='cases'::regclass AND attname='embedding'",
    );
    expect(col.rows[0].t).toBe("vector(1024)");
  });

  it("inserts a case with all required FKs and applies defaults", async () => {
    const [cat] = await db
      .select()
      .from(caseCategories)
      .where(eq(caseCategories.name, "Service Quality"));
    const [pri] = await db
      .select()
      .from(casePriorities)
      .where(eq(casePriorities.name, "High"));
    const [st] = await db
      .select()
      .from(caseStatuses)
      .where(eq(caseStatuses.isInitial, true));
    const [ch] = await db
      .select()
      .from(caseChannels)
      .where(eq(caseChannels.name, "Website"));
    expect(cat && pri && st && ch).toBeTruthy();

    const [row] = await db
      .insert(cases)
      .values({
        caseNumber: `TEST-${Date.now()}`,
        title: "Integration test case",
        description: "created by schema.integration.test",
        categoryId: cat.id,
        priorityId: pri.id,
        statusId: st.id,
        channelId: ch.id,
      })
      .returning();
    caseId = row.id;

    expect(row.confidentialityLevel).toBe("internal"); // enum default
    expect(row.isDeleted).toBe(false); // soft-delete default
    expect(row.escalationLevel).toBe(0);
    expect(row.createdAt).toBeInstanceOf(Date);
  });

  it("supports self-referential threaded comments", async () => {
    const [parent] = await db
      .insert(caseComments)
      .values({ caseId: caseId!, comment: "parent comment" })
      .returning();
    const [child] = await db
      .insert(caseComments)
      .values({
        caseId: caseId!,
        comment: "reply",
        parentCommentId: parent.id,
      })
      .returning();
    expect(child.parentCommentId).toBe(parent.id);
    expect(parent.commentType).toBe("internal"); // enum default
  });

  it("excludes soft-deleted cases from active queries", async () => {
    await db
      .update(cases)
      .set({ isDeleted: true, deletedAt: new Date() })
      .where(eq(cases.id, caseId!));
    const active = await db
      .select()
      .from(cases)
      .where(and(eq(cases.id, caseId!), eq(cases.isDeleted, false)));
    expect(active).toHaveLength(0);
  });

  it("cascade-deletes child comments when the case is removed", async () => {
    await db.delete(cases).where(eq(cases.id, caseId!));
    const orphans = await db
      .select()
      .from(caseComments)
      .where(eq(caseComments.caseId, caseId!));
    expect(orphans).toHaveLength(0);
    caseId = undefined; // already deleted; skip afterAll delete
  });
});
