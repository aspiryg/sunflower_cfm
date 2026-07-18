import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { authed } from "@/lib/http/guard";
import { ok, fail } from "@/lib/http/respond";
import { findUserById, updateUser, toSafeUser } from "@/db/repositories/users";
import { putObject, presignDownload, isStorageConfigured } from "@/lib/storage/s3";
import { writeAudit } from "@/db/repositories/audit";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB (v1 parity)
const TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

/** Upload/replace the authenticated user's profile picture. */
export const POST = authed(async (req: NextRequest, auth) => {
  if (!isStorageConfigured()) {
    return fail(503, "File storage is not configured.", "STORAGE_UNAVAILABLE");
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Expected multipart form data.", "INVALID_FORM");
  }
  const file = form.get("file");
  if (!(file instanceof File)) return fail(400, "Missing file field.", "MISSING_FILE");
  const ext = TYPES.get(file.type);
  if (!ext) return fail(400, "Only JPEG, PNG, or WebP images.", "INVALID_FILE_TYPE");
  if (file.size > MAX_SIZE) return fail(413, "Image exceeds the 5MB limit.", "FILE_TOO_LARGE");

  const key = `avatars/${auth.user.id}/${randomUUID()}.${ext}`;
  await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type);
  const updated = await updateUser(auth.user.id, { profilePicture: key });
  await writeAudit({
    userId: auth.user.id,
    action: "UPDATE",
    entityType: "user",
    entityId: auth.user.id,
    metadata: { profilePicture: true },
  });
  return ok({ user: updated ? toSafeUser(updated) : null }, "Picture updated.");
});

/** Serve the picture via a short-lived presigned redirect. */
export const GET = authed(async (_req, auth) => {
  if (!isStorageConfigured()) {
    return fail(503, "File storage is not configured.", "STORAGE_UNAVAILABLE");
  }
  const user = await findUserById(auth.user.id);
  if (!user?.profilePicture) {
    return fail(404, "No profile picture.", "NO_PICTURE");
  }
  return NextResponse.redirect(
    await presignDownload(user.profilePicture, "avatar"),
    302,
  );
});

export const DELETE = authed(async (_req, auth) => {
  const updated = await updateUser(auth.user.id, { profilePicture: null });
  return ok({ user: updated ? toSafeUser(updated) : null }, "Picture removed.");
});
