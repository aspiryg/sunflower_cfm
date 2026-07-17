/**
 * Case comment data access (threaded, soft-deletable). Adding a comment also
 * logs a COMMENT_ADDED history row on the parent case.
 */
import { and, asc, eq } from "drizzle-orm";
import { db } from "../index";
import {
  caseComments,
  caseHistory,
  type CaseComment,
} from "../schema";

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

export function listComments(caseId: number): Promise<CaseComment[]> {
  return db
    .select()
    .from(caseComments)
    .where(and(eq(caseComments.caseId, caseId), live()))
    .orderBy(asc(caseComments.createdAt));
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
