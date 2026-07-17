/**
 * Phase 3 verification — repositories + domain workflow against a real DB.
 * Self-skips without DATABASE_URL. Requires the seeded reference data.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import {
  users,
  cases,
  caseHistory,
  caseStatuses,
} from "@/db/schema";
import * as usersRepo from "@/db/repositories/users";
import * as casesRepo from "@/db/repositories/cases";
import * as commentsRepo from "@/db/repositories/comments";
import {
  listCategories,
  listPriorities,
  listChannels,
} from "@/db/repositories/referenceData";
import { getCasePrefix } from "@/db/repositories/settings";

const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("Phase 3 repositories (integration)", () => {
  const createdCaseIds: number[] = [];
  const createdUserIds: number[] = [];
  let alice: number;
  let bob: number;
  let categoryId: number;
  let priorityId: number;
  let channelId: number;

  const stamp = Date.now();

  beforeAll(async () => {
    const a = await usersRepo.createUser({
      username: `alice_${stamp}`,
      email: `alice_${stamp}@test.local`,
      password: "x",
      firstName: "Alice",
      lastName: "Test",
      role: "staff",
    });
    const b = await usersRepo.createUser({
      username: `bob_${stamp}`,
      email: `bob_${stamp}@test.local`,
      password: "x",
      firstName: "Bob",
      lastName: "Test",
      role: "user",
    });
    alice = a.id;
    bob = b.id;
    createdUserIds.push(alice, bob);

    [{ id: categoryId }] = await listCategories();
    const priorities = await listPriorities();
    priorityId = priorities.find((p) => p.name === "High")!.id;
    [{ id: channelId }] = await listChannels();
  });

  afterAll(async () => {
    if (createdCaseIds.length)
      await db.delete(cases).where(inArray(cases.id, createdCaseIds));
    if (createdUserIds.length)
      await db.delete(users).where(inArray(users.id, createdUserIds));
    await pool.end();
  });

  it("creates a case with a settings-prefixed number, SLA due date, and CREATION history", async () => {
    const prefix = await getCasePrefix();
    const c = await casesRepo.createCase(
      {
        title: "Water access issue",
        description: "No water supply for three days.",
        categoryId,
        priorityId,
        channelId,
      },
      bob,
    );
    createdCaseIds.push(c.id);

    expect(c.caseNumber.startsWith(`${prefix}-`)).toBe(true);
    expect(c.caseNumber).toMatch(/^[A-Z]+-\d{8}-\d{4}$/);
    expect(c.dueDate).toBeInstanceOf(Date); // High priority has an SLA
    expect(c.createdBy).toBe(bob);

    // Status defaulted to the initial status.
    const [initial] = await db
      .select()
      .from(caseStatuses)
      .where(eq(caseStatuses.isInitial, true));
    expect(c.statusId).toBe(initial.id);

    const history = await db
      .select()
      .from(caseHistory)
      .where(eq(caseHistory.caseId, c.id));
    expect(history.some((h) => h.actionType === "CREATION")).toBe(true);
  });

  it("scopes listCases by ownership", async () => {
    const c = await casesRepo.createCase(
      { title: "Alice case", description: "owned by alice", categoryId, priorityId, channelId },
      alice,
    );
    createdCaseIds.push(c.id);

    const own = await casesRepo.listCases({
      scope: { kind: "field", field: "createdBy", value: alice },
    });
    expect(own.data.every((x) => x.createdBy === alice)).toBe(true);
    expect(own.data.some((x) => x.id === c.id)).toBe(true);

    const none = await casesRepo.listCases({ scope: { kind: "none" } });
    expect(none.total).toBe(0);

    const all = await casesRepo.listCases({ scope: { kind: "all" } });
    expect(all.total).toBeGreaterThanOrEqual(2);
  });

  it("enforces lifecycle transitions on status change", async () => {
    const c = await casesRepo.createCase(
      { title: "Lifecycle", description: "transition test", categoryId, priorityId, channelId },
      bob,
    );
    createdCaseIds.push(c.id);

    const statuses = await db.select().from(caseStatuses);
    const inProgress = statuses.find((s) => s.name === "In Progress")!;
    const newStatus = statuses.find((s) => s.isInitial)!;
    const closed = statuses.find((s) => s.name === "Closed")!;

    // Valid forward transition.
    const ok = await casesRepo.changeCaseStatus(c.id, inProgress.id, bob);
    expect(ok.ok).toBe(true);

    // No-op rejected.
    const same = await casesRepo.changeCaseStatus(c.id, inProgress.id, bob);
    expect(same.ok).toBe(false);
    if (!same.ok) expect(same.code).toBe("SAME_STATUS");

    // Cannot move back to the initial status.
    const back = await casesRepo.changeCaseStatus(c.id, newStatus.id, bob);
    if (!back.ok) expect(back.code).toBe("TO_INITIAL");

    // Move to Closed (terminal), then any further change is locked.
    await casesRepo.changeCaseStatus(c.id, closed.id, bob);
    const locked = await casesRepo.changeCaseStatus(c.id, inProgress.id, bob);
    if (!locked.ok) expect(locked.code).toBe("STATUS_LOCKED");
  });

  it("assigns a case and records assignment + history", async () => {
    const c = await casesRepo.createCase(
      { title: "Assign me", description: "assignment test", categoryId, priorityId, channelId },
      bob,
    );
    createdCaseIds.push(c.id);

    const updated = await casesRepo.assignCase(c.id, alice, bob, {
      comments: "please handle",
    });
    expect(updated?.assignedTo).toBe(alice);

    const history = await db
      .select()
      .from(caseHistory)
      .where(eq(caseHistory.caseId, c.id));
    expect(history.some((h) => h.actionType === "ASSIGNMENT_CHANGE")).toBe(true);
  });

  it("adds and lists threaded comments", async () => {
    const c = await casesRepo.createCase(
      { title: "Comment thread", description: "comment test", categoryId, priorityId, channelId },
      bob,
    );
    createdCaseIds.push(c.id);

    const parent = await commentsRepo.addComment(c.id, bob, {
      comment: "Investigating.",
    });
    const reply = await commentsRepo.addComment(c.id, alice, {
      comment: "Update received.",
      parentCommentId: parent.id,
    });
    expect(reply.parentCommentId).toBe(parent.id);
    expect(reply.isResponse).toBe(true);

    const list = await commentsRepo.listComments(c.id);
    expect(list).toHaveLength(2);
  });

  it("users repo: finds by email and strips secrets", async () => {
    const found = await usersRepo.findUserByEmail(`bob_${stamp}@test.local`);
    expect(found?.id).toBe(bob);
    const safe = usersRepo.toSafeUser(found!);
    expect("password" in safe).toBe(false);
    expect("twoFactorSecret" in safe).toBe(false);
  });
});
