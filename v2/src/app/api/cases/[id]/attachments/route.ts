import { createHash, randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { authorize } from "@/lib/rbac";
import { paramInt } from "@/lib/http/params";
import { findCaseById } from "@/db/repositories/cases";
import {
  createAttachment,
  listAttachments,
} from "@/db/repositories/attachments";
import { putObject, isStorageConfigured } from "@/lib/storage/s3";
import { writeAudit } from "@/db/repositories/audit";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB (v1 parity)
const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
  ["application/msword", "doc"],
  [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "docx",
  ],
  ["text/plain", "txt"],
]);

export const GET = authed(
  async (_req, auth, ctx) => {
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    if (!authorize(auth.user, "cases", "read", found).allowed) {
      return fail(403, "You do not have access to this case.", "FORBIDDEN");
    }
    return ok(await listAttachments(id));
  },
  { resource: "cases", action: "read" },
);

export const POST = authed(
  async (req: NextRequest, auth, ctx) => {
    if (!isStorageConfigured()) {
      return fail(503, "File storage is not configured.", "STORAGE_UNAVAILABLE");
    }
    const id = await paramInt(ctx, "id");
    if (!id) return fail(400, "Invalid case id.", "INVALID_ID");
    const found = await findCaseById(id);
    if (!found) return fail(404, "Case not found.", "CASE_NOT_FOUND");
    // Attaching evidence modifies the case → require update on the instance.
    if (!authorize(auth.user, "cases", "update", found).allowed) {
      return fail(403, "You cannot modify this case.", "FORBIDDEN");
    }

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return fail(400, "Expected multipart form data.", "INVALID_FORM");
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return fail(400, "Missing file field.", "MISSING_FILE");
    }
    const ext = ALLOWED_TYPES.get(file.type);
    if (!ext) {
      return fail(400, "Unsupported file type.", "INVALID_FILE_TYPE");
    }
    if (file.size > MAX_SIZE) {
      return fail(413, "File exceeds the 10MB limit.", "FILE_TOO_LARGE");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const key = `cases/${id}/${randomUUID()}.${ext}`;

    await putObject(key, bytes, file.type);

    const attachment = await createAttachment(
      {
        caseId: id,
        fileName: key.split("/").pop()!,
        originalFileName: file.name,
        filePath: key,
        fileSize: file.size,
        fileType: file.type,
        fileExtension: ext,
        checksum,
      },
      auth.user.id,
    );

    await writeAudit({
      userId: auth.user.id,
      action: "ATTACH",
      entityType: "attachment",
      entityId: attachment.id,
      metadata: { caseId: id, size: file.size, type: file.type },
    });

    return ok({ attachment }, "File uploaded.", { status: 201 });
  },
  { resource: "cases", action: "update" },
);
