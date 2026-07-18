/**
 * Case data access + domain workflow (create with case-number/SLA, list with
 * permission scoping, status transitions, assignment, escalation, soft delete).
 * Every mutation writes a case_history row — the audit trail v1 maintained by
 * hand is centralized here.
 */
import { and, asc, count, desc, eq, gte, ilike, lt, or, sql, type SQL } from "drizzle-orm";
import { db } from "../index";
import {
  cases,
  caseHistory,
  caseAssignments,
  caseStatuses,
  casePriorities,
  type Case,
  type NewCase,
  type CaseHistoryEntry,
} from "../schema";
import type { QueryScope } from "@/lib/rbac";
import { formatCaseNumber, dayBounds } from "@/lib/cases/caseNumber";
import { computeDueDate } from "@/lib/cases/sla";
import { canTransition, type StatusFlags } from "@/lib/cases/lifecycle";
import { getCasePrefix } from "./settings";

const live = () => eq(cases.isDeleted, false);

export type CaseCreateInput = Omit<
  NewCase,
  | "id"
  | "caseNumber"
  | "statusId"
  | "dueDate"
  | "createdAt"
  | "updatedAt"
  | "createdBy"
  | "updatedBy"
  | "submittedBy"
  | "submittedAt"
  | "isDeleted"
  | "deletedAt"
  | "deletedBy"
  | "embedding"
> & {
  categoryId: number;
  priorityId: number;
  channelId: number;
  /** Defaults to the seeded initial status when omitted. */
  statusId?: number;
};

async function initialStatusId(): Promise<number> {
  const [s] = await db
    .select({ id: caseStatuses.id })
    .from(caseStatuses)
    .where(eq(caseStatuses.isInitial, true))
    .orderBy(asc(caseStatuses.sortOrder))
    .limit(1);
  if (!s) throw new Error("No initial case status is seeded.");
  return s.id;
}

async function nextSequence(when: Date): Promise<number> {
  const { start, end } = dayBounds(when);
  const [{ c }] = await db
    .select({ c: count() })
    .from(cases)
    .where(and(gte(cases.caseDate, start), lt(cases.caseDate, end)));
  return Number(c) + 1;
}

async function writeHistory(entry: {
  caseId: number;
  actorId: number;
  actionType: (typeof caseHistory.actionType.enumValues)[number];
  fieldName?: string;
  oldValue?: string | null;
  newValue?: string | null;
  changeDescription?: string;
  comments?: string;
  statusId?: number;
  statusReason?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await db.insert(caseHistory).values({
    caseId: entry.caseId,
    createdBy: entry.actorId,
    actionType: entry.actionType,
    fieldName: entry.fieldName,
    oldValue: entry.oldValue ?? null,
    newValue: entry.newValue ?? null,
    changeDescription: entry.changeDescription,
    comments: entry.comments,
    statusId: entry.statusId,
    statusReason: entry.statusReason,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
  });
}

export async function findCaseById(id: number): Promise<Case | undefined> {
  const [row] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.id, id), live()))
    .limit(1);
  return row;
}

export async function findCaseByNumber(
  caseNumber: string,
): Promise<Case | undefined> {
  const [row] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.caseNumber, caseNumber), live()))
    .limit(1);
  return row;
}

/**
 * Create a case: resolves the status (initial if unset), derives the
 * settings-prefixed case number and the SLA due date, inserts, and logs a
 * CREATION history row. Retries on the rare case-number race.
 */
export async function createCase(
  input: CaseCreateInput,
  actorId: number | null,
): Promise<Case> {
  const now = new Date();
  const statusId = input.statusId ?? (await initialStatusId());
  const prefix = await getCasePrefix();

  const [priority] = await db
    .select({ hours: casePriorities.resolutionTimeHours })
    .from(casePriorities)
    .where(eq(casePriorities.id, input.priorityId))
    .limit(1);
  const dueDate = computeDueDate(now, priority?.hours ?? null);

  for (let attempt = 0; attempt < 5; attempt++) {
    const sequence = (await nextSequence(now)) + attempt;
    const caseNumber = formatCaseNumber(prefix, now, sequence);
    try {
      const [row] = await db
        .insert(cases)
        .values({
          ...input,
          statusId,
          caseNumber,
          dueDate,
          caseDate: now,
          submittedAt: now,
          submittedBy: actorId, // nullable — null for anonymous public intake
          createdBy: actorId,
        })
        .returning();

      // case_history is a user-action log (createdBy is NOT NULL). Anonymous
      // creation is recorded in audit_logs (userId nullable) by the caller.
      if (actorId != null) {
        await writeHistory({
          caseId: row.id,
          actorId,
          actionType: "CREATION",
          changeDescription: `Case ${caseNumber} created.`,
          statusId,
        });
      }
      return row;
    } catch (err: unknown) {
      // 23505 = unique_violation (case_number collision) → retry with next seq.
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code?: string }).code === "23505" &&
        attempt < 4
      ) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique case number after retries.");
}

export interface CaseFilters {
  statusId?: number;
  priorityId?: number;
  categoryId?: number;
  assignedTo?: number;
  createdBy?: number;
  search?: string;
}

export async function listCases(params: {
  scope: QueryScope;
  filters?: CaseFilters;
  page?: number;
  limit?: number;
}): Promise<{ data: Case[]; total: number }> {
  const { scope, filters = {}, page = 1, limit = 20 } = params;
  if (scope.kind === "none") return { data: [], total: 0 };

  const conds: (SQL | undefined)[] = [live()];

  if (scope.kind === "field") {
    if (scope.field === "createdBy") conds.push(eq(cases.createdBy, scope.value));
    else if (scope.field === "assignedTo") conds.push(eq(cases.assignedTo, scope.value));
  }
  if (filters.statusId) conds.push(eq(cases.statusId, filters.statusId));
  if (filters.priorityId) conds.push(eq(cases.priorityId, filters.priorityId));
  if (filters.categoryId) conds.push(eq(cases.categoryId, filters.categoryId));
  if (filters.assignedTo) conds.push(eq(cases.assignedTo, filters.assignedTo));
  if (filters.createdBy) conds.push(eq(cases.createdBy, filters.createdBy));
  if (filters.search) {
    conds.push(
      or(
        ilike(cases.title, `%${filters.search}%`),
        ilike(cases.caseNumber, `%${filters.search}%`),
      ),
    );
  }

  const where = and(...conds);
  const offset = (Math.max(1, page) - 1) * limit;

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(cases)
      .where(where)
      .orderBy(desc(cases.caseDate))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(cases).where(where),
  ]);

  return { data, total: Number(total) };
}

async function statusFlags(id: number): Promise<StatusFlags | undefined> {
  const [s] = await db
    .select({
      id: caseStatuses.id,
      name: caseStatuses.name,
      isInitial: caseStatuses.isInitial,
      isFinal: caseStatuses.isFinal,
      allowReopen: caseStatuses.allowReopen,
    })
    .from(caseStatuses)
    .where(eq(caseStatuses.id, id))
    .limit(1);
  return s;
}

export type ChangeStatusResult =
  | { ok: true; case: Case }
  | { ok: false; code: string; reason?: string };

/** Validate the lifecycle transition, apply it, and log history. */
export async function changeCaseStatus(
  caseId: number,
  newStatusId: number,
  actorId: number,
  opts: { reason?: string; comments?: string } = {},
): Promise<ChangeStatusResult> {
  const existing = await findCaseById(caseId);
  if (!existing) return { ok: false, code: "CASE_NOT_FOUND" };

  const [from, to] = await Promise.all([
    statusFlags(existing.statusId),
    statusFlags(newStatusId),
  ]);
  if (!from || !to) return { ok: false, code: "STATUS_NOT_FOUND" };

  const t = canTransition(from, to);
  if (!t.ok) return { ok: false, code: t.code!, reason: t.reason };

  const [row] = await db
    .update(cases)
    .set({
      statusId: newStatusId,
      resolvedDate: to.isFinal ? (existing.resolvedDate ?? new Date()) : existing.resolvedDate,
      lastActivityDate: new Date(),
      updatedBy: actorId,
    })
    .where(eq(cases.id, caseId))
    .returning();

  await writeHistory({
    caseId,
    actorId,
    actionType: "STATUS_CHANGE",
    fieldName: "statusId",
    oldValue: from.name,
    newValue: to.name,
    statusId: newStatusId,
    statusReason: opts.reason,
    comments: opts.comments,
  });

  return { ok: true, case: row };
}

/** Assign the case, log history, and append an assignment-history row. */
export async function assignCase(
  caseId: number,
  assignedTo: number,
  actorId: number,
  opts: { comments?: string; expectedCompletionDate?: Date } = {},
): Promise<Case | undefined> {
  const now = new Date();
  const [row] = await db
    .update(cases)
    .set({
      assignedTo,
      assignedBy: actorId,
      assignedAt: now,
      assignmentComments: opts.comments,
      lastActivityDate: now,
      updatedBy: actorId,
    })
    .where(and(eq(cases.id, caseId), live()))
    .returning();
  if (!row) return undefined;

  await db.insert(caseAssignments).values({
    caseId,
    assignedTo,
    assignedBy: actorId,
    assignmentType: "primary",
    assignedAt: now,
    expectedCompletionDate: opts.expectedCompletionDate,
    comments: opts.comments,
    createdBy: actorId,
  });

  await writeHistory({
    caseId,
    actorId,
    actionType: "ASSIGNMENT_CHANGE",
    fieldName: "assignedTo",
    newValue: String(assignedTo),
    comments: opts.comments,
  });

  return row;
}

/** Increment escalation level and log an ESCALATION history row. */
export async function escalateCase(
  caseId: number,
  actorId: number,
  opts: { reason: string; escalatedTo?: number },
): Promise<Case | undefined> {
  const existing = await findCaseById(caseId);
  if (!existing) return undefined;
  const now = new Date();

  const [row] = await db
    .update(cases)
    .set({
      escalationLevel: (existing.escalationLevel ?? 0) + 1,
      escalatedAt: now,
      escalatedBy: actorId,
      escalationReason: opts.reason,
      lastActivityDate: now,
      updatedBy: actorId,
    })
    .where(eq(cases.id, caseId))
    .returning();

  await writeHistory({
    caseId,
    actorId,
    actionType: "ESCALATION",
    changeDescription: opts.reason,
    comments: opts.reason,
  });

  return row;
}

export async function updateCase(
  caseId: number,
  patch: Partial<NewCase>,
  actorId: number,
): Promise<Case | undefined> {
  const [row] = await db
    .update(cases)
    .set({ ...patch, updatedBy: actorId, lastActivityDate: new Date() })
    .where(and(eq(cases.id, caseId), live()))
    .returning();
  if (!row) return undefined;

  await writeHistory({
    caseId,
    actorId,
    actionType: "UPDATE",
    changeDescription: "Case fields updated.",
  });
  return row;
}

export async function softDeleteCase(
  caseId: number,
  actorId: number,
): Promise<void> {
  await db
    .update(cases)
    .set({ isDeleted: true, deletedAt: new Date(), deletedBy: actorId })
    .where(eq(cases.id, caseId));
}

export function listCaseHistory(caseId: number): Promise<CaseHistoryEntry[]> {
  return db
    .select()
    .from(caseHistory)
    .where(eq(caseHistory.caseId, caseId))
    .orderBy(desc(caseHistory.createdAt));
}

/** Aggregate case counts (total / open / resolved) honoring the permission scope. */
export async function caseStats(
  scope: QueryScope,
): Promise<{ total: number; open: number; resolved: number }> {
  if (scope.kind === "none") return { total: 0, open: 0, resolved: 0 };

  const conds: (SQL | undefined)[] = [live()];
  if (scope.kind === "field") {
    if (scope.field === "createdBy") conds.push(eq(cases.createdBy, scope.value));
    else if (scope.field === "assignedTo") conds.push(eq(cases.assignedTo, scope.value));
  }

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${caseStatuses.isFinal} = false)::int`,
      resolved: sql<number>`count(*) filter (where ${caseStatuses.isFinal} = true)::int`,
    })
    .from(cases)
    .innerJoin(caseStatuses, eq(caseStatuses.id, cases.statusId))
    .where(and(...conds));

  return {
    total: Number(row?.total ?? 0),
    open: Number(row?.open ?? 0),
    resolved: Number(row?.resolved ?? 0),
  };
}
