/**
 * Case comment data access (threaded, soft-deletable). Adding a comment also
 * logs a COMMENT_ADDED history row on the parent case.
 */
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../index";
import {
  cases,
  caseComments,
  caseHistory,
  type CaseComment,
} from "../schema";
import type { QueryScope } from "@/lib/rbac";

const live = () => eq(caseComments.isDeleted, false);

export interface AddCommentInput {
  comment: string;
  commentType?: (typeof caseComments.commentType.enumValues)[number];
  isInternal?: boolean;
  isPublic?: boolean;
  parentCommentId?: number;
  requiresFollowUp?: boolean;
  followUpDate?: Date;
}

export async function addComment(
  caseId: number,
  actorId: number,
  input: AddCommentInput,
): Promise<CaseComment> {
  const [row] = await db
    .insert(caseComments)
    .values({
      caseId,
      comment: input.comment,
      commentType: input.commentType ?? "internal",
      isInternal: input.isInternal ?? true,
      isPublic: input.isPublic ?? false,
      parentCommentId: input.parentCommentId,
      isResponse: input.parentCommentId != null,
      requiresFollowUp: input.requiresFollowUp ?? false,
      followUpDate: input.followUpDate,
      createdBy: actorId,
    })
    .returning();

  await db.insert(caseHistory).values({
    caseId,
    createdBy: actorId,
    actionType: "COMMENT_ADDED",
    changeDescription: "Comment added.",
  });

  return row;
}

export function listComments(
  caseId: number,
  opts: { includeInternal?: boolean } = {},
): Promise<CaseComment[]> {
  const { includeInternal = true } = opts;
  const conds = [eq(caseComments.caseId, caseId), live()];
  // Non-staff callers must never see internal (staff-only) comments.
  if (!includeInternal) conds.push(eq(caseComments.isInternal, false));
  return db
    .select()
    .from(caseComments)
    .where(and(...conds))
    .orderBy(asc(caseComments.createdAt));
}

/** Load a single live comment (undefined if missing or soft-deleted). */
export async function findCommentById(
  id: number,
): Promise<CaseComment | undefined> {
  const [row] = await db
    .select()
    .from(caseComments)
    .where(and(eq(caseComments.id, id), live()))
    .limit(1);
  return row;
}

export async function updateComment(
  id: number,
  actorId: number,
  newText: string,
  editReason?: string,
): Promise<CaseComment | undefined> {
  const [current] = await db
    .select()
    .from(caseComments)
    .where(and(eq(caseComments.id, id), live()))
    .limit(1);
  if (!current) return undefined;

  const [row] = await db
    .update(caseComments)
    .set({
      comment: newText,
      isEdited: true,
      editedAt: new Date(),
      editedBy: actorId,
      editReason,
      originalComment: current.originalComment ?? current.comment,
      updatedBy: actorId,
    })
    .where(eq(caseComments.id, id))
    .returning();
  return row;
}

export async function softDeleteComment(
  id: number,
  actorId: number,
): Promise<void> {
  await db
    .update(caseComments)
    .set({ isDeleted: true, deletedAt: new Date(), deletedBy: actorId })
    .where(eq(caseComments.id, id));
}

/** Mark a comment's pending follow-up as completed. */
export async function markFollowUpComplete(
  id: number,
  actorId: number,
): Promise<CaseComment | undefined> {
  const [row] = await db
    .update(caseComments)
    .set({
      followUpCompleted: true,
      followUpCompletedAt: new Date(),
      updatedBy: actorId,
    })
    .where(eq(caseComments.id, id))
    .returning();
  return row;
}

/** A follow-up-queue row: the comment plus its parent case identity. */
export interface FollowUpComment {
  id: number;
  caseId: number;
  caseNumber: string;
  comment: string;
  commentType: CaseComment["commentType"];
  isInternal: boolean;
  requiresFollowUp: boolean;
  followUpDate: Date | null;
  followUpCompleted: boolean;
  isEdited: boolean;
  createdBy: number | null;
  createdAt: Date;
}

/**
 * Cross-case list of comments still awaiting follow-up, narrowed to the caller's
 * visible cases via a `queryScope("cases","read")` descriptor. Ordered by due
 * date (soonest first, nulls last), then newest.
 */
export async function listCommentsRequiringFollowUp(
  scope: QueryScope,
): Promise<FollowUpComment[]> {
  if (scope.kind === "none") return [];

  const conds = [
    eq(caseComments.requiresFollowUp, true),
    eq(caseComments.followUpCompleted, false),
    live(),
  ];
  if (scope.kind === "field") {
    if (scope.field === "createdBy") conds.push(eq(cases.createdBy, scope.value));
    else if (scope.field === "assignedTo")
      conds.push(eq(cases.assignedTo, scope.value));
  }

  return db
    .select({
      id: caseComments.id,
      caseId: caseComments.caseId,
      caseNumber: cases.caseNumber,
      comment: caseComments.comment,
      commentType: caseComments.commentType,
      isInternal: caseComments.isInternal,
      requiresFollowUp: caseComments.requiresFollowUp,
      followUpDate: caseComments.followUpDate,
      followUpCompleted: caseComments.followUpCompleted,
      isEdited: caseComments.isEdited,
      createdBy: caseComments.createdBy,
      createdAt: caseComments.createdAt,
    })
    .from(caseComments)
    .innerJoin(cases, eq(caseComments.caseId, cases.id))
    .where(and(...conds))
    .orderBy(asc(caseComments.followUpDate), desc(caseComments.createdAt));
}
