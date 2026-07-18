/**
 * Case data access + domain workflow (create with case-number/SLA, list with
 * permission scoping, status transitions, assignment, escalation, soft delete).
 * Every mutation writes a case_history row — the audit trail v1 maintained by
 * hand is centralized here.
 */
import { and, asc, count, desc, eq, gte, ilike, like, or, sql, type SQL } from "drizzle-orm";
import { db } from "../index";
import {
  cases,
  caseHistory,
  caseAssignments,
  caseStatuses,
  casePriorities,
  caseCategories,
  type Case,
  type NewCase,
  type CaseHistoryEntry,
} from "../schema";
import type { QueryScope } from "@/lib/rbac";
import { formatCaseNumber, caseNumberDayPrefix } from "@/lib/cases/caseNumber";
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

// (daily sequence is computed inside the createCase transaction, under an
// advisory lock, so concurrent creations can never collide on caseNumber)

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

  // Allocate the daily sequence and insert atomically. The transaction-scoped
  // advisory lock serializes concurrent creations; the next number derives
  // from the MAX existing number for the day (zero-padded, so lexicographic
  // max == numeric max) — count-based numbering breaks when cases are deleted,
  // and plain count+insert also races under concurrency.
  const row = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('cfm_case_number'))`);
    const dayPrefix = caseNumberDayPrefix(prefix, now);
    const [{ m }] = await tx
      .select({ m: sql<string | null>`max(${cases.caseNumber})` })
      .from(cases)
      .where(like(cases.caseNumber, `${dayPrefix}%`));
    const next = m ? parseInt(m.slice(dayPrefix.length), 10) + 1 : 1;
    const caseNumber = formatCaseNumber(prefix, now, next);
    const [inserted] = await tx
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
    return inserted;
  });

  // case_history is a user-action log (createdBy is NOT NULL). Anonymous
  // creation is recorded in audit_logs (userId nullable) by the caller.
  if (actorId != null) {
    await writeHistory({
      caseId: row.id,
      actorId,
      actionType: "CREATION",
      changeDescription: `Case ${row.caseNumber} created.`,
      statusId,
    });
  }
  return row;
}

export interface CaseFilters {
  statusId?: number;
  priorityId?: number;
  categoryId?: number;
  assignedTo?: number;
  createdBy?: number;
  search?: string;
}

/** Whitelisted sortable fields — keys map to column refs, never raw SQL. */
export const CASE_SORT_KEYS = [
  "createdAt",
  "updatedAt",
  "caseNumber",
  "title",
  "priorityId",
  "statusId",
  "dueDate",
] as const;
export type CaseSortKey = (typeof CASE_SORT_KEYS)[number];
export type CaseSortDir = "asc" | "desc";

const CASE_SORT_COLUMNS = {
  createdAt: cases.createdAt,
  updatedAt: cases.updatedAt,
  caseNumber: cases.caseNumber,
  title: cases.title,
  priorityId: cases.priorityId,
  statusId: cases.statusId,
  dueDate: cases.dueDate,
} as const satisfies Record<CaseSortKey, unknown>;

export async function listCases(params: {
  scope: QueryScope;
  filters?: CaseFilters;
  page?: number;
  limit?: number;
  sortBy?: CaseSortKey;
  sortDir?: CaseSortDir;
}): Promise<{ data: Case[]; total: number }> {
  const {
    scope,
    filters = {},
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortDir = "desc",
  } = params;
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
  const sortCol = CASE_SORT_COLUMNS[sortBy] ?? cases.createdAt;
  const order = sortDir === "asc" ? asc(sortCol) : desc(sortCol);

  const [data, [{ total }]] = await Promise.all([
    db
      .select()
      .from(cases)
      .where(where)
      // Stable id tiebreaker keeps pagination deterministic on equal keys.
      .orderBy(order, desc(cases.id))
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

export interface CaseAnalytics {
  trend: { day: string; count: number }[];
  byStatus: { id: number; name: string; arabicName: string | null; color: string | null; count: number }[];
  byCategory: { id: number; name: string; arabicName: string | null; color: string | null; count: number }[];
}

/** Dashboard chart aggregates (SQL group-bys, permission-scoped). */
export async function caseAnalytics(scope: QueryScope): Promise<CaseAnalytics> {
  if (scope.kind === "none") return { trend: [], byStatus: [], byCategory: [] };

  const conds = scopeConds(scope);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [trend, byStatus, byCategory] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(${cases.caseDate}::date, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(cases)
      .where(and(...conds, gte(cases.caseDate, since)))
      .groupBy(sql`${cases.caseDate}::date`)
      .orderBy(sql`${cases.caseDate}::date`),
    db
      .select({
        id: caseStatuses.id,
        name: caseStatuses.name,
        arabicName: caseStatuses.arabicName,
        color: caseStatuses.color,
        count: sql<number>`count(*)::int`,
      })
      .from(cases)
      .innerJoin(caseStatuses, eq(caseStatuses.id, cases.statusId))
      .where(and(...conds))
      .groupBy(caseStatuses.id, caseStatuses.name, caseStatuses.arabicName, caseStatuses.color)
      .orderBy(caseStatuses.id),
    db
      .select({
        id: caseCategories.id,
        name: caseCategories.name,
        arabicName: caseCategories.arabicName,
        color: caseCategories.color,
        count: sql<number>`count(*)::int`,
      })
      .from(cases)
      .innerJoin(caseCategories, eq(caseCategories.id, cases.categoryId))
      .where(and(...conds))
      .groupBy(caseCategories.id, caseCategories.name, caseCategories.arabicName, caseCategories.color)
      .orderBy(caseCategories.id),
  ]);

  return {
    trend: trend.map((r) => ({ day: r.day, count: Number(r.count) })),
    byStatus: byStatus.map((r) => ({ ...r, count: Number(r.count) })),
    byCategory: byCategory.map((r) => ({ ...r, count: Number(r.count) })),
  };
}

export function listCaseHistory(caseId: number): Promise<CaseHistoryEntry[]> {
  return db
    .select()
    .from(caseHistory)
    .where(eq(caseHistory.caseId, caseId))
    .orderBy(desc(caseHistory.createdAt));
}

/** WHERE conditions applying a permission scope to the cases table. */
function scopeConds(scope: QueryScope): (SQL | undefined)[] {
  const conds: (SQL | undefined)[] = [live()];
  if (scope.kind === "field") {
    if (scope.field === "createdBy") conds.push(eq(cases.createdBy, scope.value));
    else if (scope.field === "assignedTo") conds.push(eq(cases.assignedTo, scope.value));
  }
  return conds;
}

/** Aggregate case counts (total / open / resolved) honoring the permission scope. */
export async function caseStats(
  scope: QueryScope,
): Promise<{ total: number; open: number; resolved: number }> {
  if (scope.kind === "none") return { total: 0, open: 0, resolved: 0 };

  const conds = scopeConds(scope);

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
