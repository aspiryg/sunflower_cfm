/**
 * Attachments — upload/list/download/delete via the real route handlers against
 * a real DB and S3-compatible storage (MinIO locally, service container in CI).
 * Self-skips unless BOTH DATABASE_URL and S3_ENDPOINT are configured.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { users, cases, auditLogs, type User } from "@/db/schema";

process.env.JWT_SECRET ||= "test_access_secret_0123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_0123456789";

import { signAccessToken } from "@/lib/auth/jwt";
import * as usersRepo from "@/db/repositories/users";
import * as casesRepo from "@/db/repositories/cases";
import {
  listCategories,
  listPriorities,
  listChannels,
} from "@/db/repositories/referenceData";
import {
  GET as listRoute,
  POST as uploadRoute,
} from "@/app/api/cases/[id]/attachments/route";
import {
  GET as downloadRoute,
  DELETE as deleteRoute,
} from "@/app/api/cases/[id]/attachments/[attachmentId]/route";

const hasDb = !!process.env.DATABASE_URL;
const hasS3 = !!process.env.S3_ENDPOINT && !!process.env.S3_BUCKET;

type Ctx = { params: Promise<Record<string, string>> };
const ctx = (params: Record<string, string>): Ctx => ({
  params: Promise.resolve(params),
});

async function cookieFor(u: User): Promise<string> {
  const token = await signAccessToken({
    id: u.id,
    email: u.email,
    username: u.username,
    role: u.role,
    organization: u.organization,
    isEmailVerified: u.isEmailVerified,
  });
  return `accessToken=${token}`;
}

function uploadReq(caseId: number, cookie: string, file: File): NextRequest {
  const form = new FormData();
  form.append("file", file);
  return new NextRequest(
    new URL(`/api/cases/${caseId}/attachments`, "http://localhost"),
    { method: "POST", headers: new Headers({ cookie }), body: form },
  );
}

function jsonReq(
  path: string,
  cookie: string,
  method = "GET",
): NextRequest {
  return new NextRequest(new URL(path, "http://localhost"), {
    method,
    headers: new Headers({ cookie }),
  });
}

describe.skipIf(!hasDb || !hasS3)("Attachments (integration)", () => {
  const stamp = Date.now();
  let owner: User;
  let cookie: string;
  let caseId: number;
  let attachmentId: number;

  beforeAll(async () => {
    owner = await usersRepo.createUser({
      username: `att_${stamp}`,
      email: `att_${stamp}@test.local`,
      password: "x",
      firstName: "Att",
      lastName: "Tester",
      role: "user",
    });
    cookie = await cookieFor(owner);

    const [cat] = await listCategories();
    const [pri] = await listPriorities();
    const [ch] = await listChannels();
    const c = await casesRepo.createCase(
      {
        title: "Attachment test case",
        description: "attachment upload test",
        categoryId: cat.id,
        priorityId: pri.id,
        channelId: ch.id,
      },
      owner.id,
    );
    caseId = c.id;
  });

  afterAll(async () => {
    await db.delete(cases).where(inArray(cases.id, [caseId]));
    await db.delete(auditLogs).where(inArray(auditLogs.userId, [owner.id]));
    await db.delete(users).where(inArray(users.id, [owner.id]));
    await pool.end();
  });

  it("uploads a file, storing metadata + checksum", async () => {
    const file = new File(["hello sunflower attachment"], "evidence.txt", {
      type: "text/plain",
    });
    const res = await uploadRoute(uploadReq(caseId, cookie, file), ctx({ id: String(caseId) }));
    expect(res.status).toBe(201);
    const body = await res.json();
    const a = body.data.attachment;
    attachmentId = a.id;
    expect(a.originalFileName).toBe("evidence.txt");
    expect(a.fileType).toBe("text/plain");
    expect(a.fileExtension).toBe("txt");
    expect(a.fileSize).toBe(26);
    expect(a.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(a.filePath).toMatch(new RegExp(`^cases/${caseId}/`));
    expect(a.storageProvider).toBe("b2");
  });

  it("rejects an unsupported file type", async () => {
    const file = new File(["#!/bin/sh"], "evil.sh", { type: "application/x-sh" });
    const res = await uploadRoute(uploadReq(caseId, cookie, file), ctx({ id: String(caseId) }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("INVALID_FILE_TYPE");
  });

  it("rejects an oversized file", async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([big], "big.pdf", { type: "application/pdf" });
    const res = await uploadRoute(uploadReq(caseId, cookie, file), ctx({ id: String(caseId) }));
    expect(res.status).toBe(413);
  });

  it("lists the case's attachments", async () => {
    const res = await listRoute(
      jsonReq(`/api/cases/${caseId}/attachments`, cookie),
      ctx({ id: String(caseId) }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("download redirects to a signed URL and counts the download", async () => {
    const res = await downloadRoute(
      jsonReq(`/api/cases/${caseId}/attachments/${attachmentId}`, cookie),
      ctx({ id: String(caseId), attachmentId: String(attachmentId) }),
    );
    expect(res.status).toBe(302);
    const location = res.headers.get("location")!;
    expect(location).toContain("X-Amz-Signature");

    // The signed URL actually serves the bytes.
    const fetched = await fetch(location);
    expect(fetched.status).toBe(200);
    expect(await fetched.text()).toBe("hello sunflower attachment");

    const { findAttachment } = await import("@/db/repositories/attachments");
    const row = await findAttachment(caseId, attachmentId);
    expect(row?.downloadCount).toBe(1);
  });

  it("another user cannot access the attachment (case ownership)", async () => {
    const outsider = await usersRepo.createUser({
      username: `att2_${stamp}`,
      email: `att2_${stamp}@test.local`,
      password: "x",
      firstName: "Out",
      lastName: "Sider",
      role: "user",
    });
    try {
      const res = await downloadRoute(
        jsonReq(
          `/api/cases/${caseId}/attachments/${attachmentId}`,
          await cookieFor(outsider),
        ),
        ctx({ id: String(caseId), attachmentId: String(attachmentId) }),
      );
      expect(res.status).toBe(403);
    } finally {
      await db.delete(users).where(inArray(users.id, [outsider.id]));
    }
  });

  it("soft-deletes an attachment", async () => {
    const res = await deleteRoute(
      jsonReq(`/api/cases/${caseId}/attachments/${attachmentId}`, cookie, "DELETE"),
      ctx({ id: String(caseId), attachmentId: String(attachmentId) }),
    );
    expect(res.status).toBe(200);

    const list = await listRoute(
      jsonReq(`/api/cases/${caseId}/attachments`, cookie),
      ctx({ id: String(caseId) }),
    );
    expect((await list.json()).data).toHaveLength(0);
  });
});
