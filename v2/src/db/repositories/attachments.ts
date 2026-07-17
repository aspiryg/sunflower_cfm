/**
 * Case-attachment metadata. The bytes live in S3-compatible storage (B2 in
 * production); rows here carry path, type, checksum, and download bookkeeping.
 * Soft delete keeps the object in storage — hard purge is an ops concern.
 */
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { caseAttachments, type CaseAttachment } from "../schema";

const live = () => eq(caseAttachments.isDeleted, false);

export interface CreateAttachmentInput {
  caseId: number;
  fileName: string;
  originalFileName: string;
  filePath: string; // storage key
  fileSize: number;
  fileType: string; // MIME
  fileExtension: string;
  checksum: string; // sha256 hex
  attachmentType?: (typeof caseAttachments.attachmentType.enumValues)[number];
}

export async function createAttachment(
  input: CreateAttachmentInput,
  actorId: number,
): Promise<CaseAttachment> {
  const [row] = await db
    .insert(caseAttachments)
    .values({
      ...input,
      attachmentType:
        input.attachmentType ??
        (input.fileType.startsWith("image/") ? "image" : "document"),
      storageProvider: "b2",
      createdBy: actorId,
    })
    .returning();
  return row;
}

export function listAttachments(caseId: number): Promise<CaseAttachment[]> {
  return db
    .select()
    .from(caseAttachments)
    .where(and(eq(caseAttachments.caseId, caseId), live()))
    .orderBy(asc(caseAttachments.createdAt));
}

export async function findAttachment(
  caseId: number,
  id: number,
): Promise<CaseAttachment | undefined> {
  const [row] = await db
    .select()
    .from(caseAttachments)
    .where(
      and(
        eq(caseAttachments.id, id),
        eq(caseAttachments.caseId, caseId),
        live(),
      ),
    )
    .limit(1);
  return row;
}

export async function recordDownload(id: number, userId: number): Promise<void> {
  await db
    .update(caseAttachments)
    .set({
      downloadCount: sql`${caseAttachments.downloadCount} + 1`,
      lastDownloadedAt: new Date(),
      lastDownloadedBy: userId,
    })
    .where(eq(caseAttachments.id, id));
}

export async function softDeleteAttachment(
  id: number,
  actorId: number,
): Promise<void> {
  await db
    .update(caseAttachments)
    .set({ isDeleted: true, deletedAt: new Date(), deletedBy: actorId })
    .where(eq(caseAttachments.id, id));
}
