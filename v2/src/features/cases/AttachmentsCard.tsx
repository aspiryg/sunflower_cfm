"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/ui/Toast";
import { TextField } from "@/ui/form";

interface AttachmentRow {
  id: number;
  originalFileName: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsCard({ caseId }: { caseId: number }) {
  const t = useTranslations("attachments");
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  const { data } = useQuery({
    queryKey: ["case-attachments", caseId],
    queryFn: () => apiFetch<AttachmentRow[]>(`/api/cases/${caseId}/attachments`),
  });
  const rows = data?.data ?? [];

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["case-attachments", caseId] });

  async function onFileChosen(file: File, input: HTMLInputElement) {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      // Multipart — bypass the JSON apiFetch helper.
      const res = await fetch(`/api/cases/${caseId}/attachments`, {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        setError(body.message ?? t("error"));
        return;
      }
      invalidate();
      toast.success(tToast("attachmentUploaded"));
    } catch {
      setError(t("error"));
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  const deleteM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/cases/${caseId}/attachments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidate();
      toast.success(tToast("attachmentDeleted"));
    },
  });

  return (
    <div className="form-card" style={{ maxWidth: "72rem", marginBottom: "2.4rem" }}>
      <h3 style={{ marginBottom: "1.6rem" }}>{t("title")}</h3>
      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}

      <TextField
        id="attachment-file"
        type="file"
        label={t("upload")}
        hint={uploading ? t("uploading") : t("hint")}
        accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,text/plain"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFileChosen(f, e.target);
        }}
      />

      {rows.length === 0 ? (
        <p className="muted">{t("empty")}</p>
      ) : (
        <table className="table">
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td dir="auto">{a.originalFileName ?? a.fileName}</td>
                <td className="muted">{formatSize(a.fileSize)}</td>
                <td>
                  <a
                    href={`/api/cases/${caseId}/attachments/${a.id}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--color-brand-600)", fontWeight: 600 }}
                  >
                    {t("download")}
                  </a>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                    disabled={deleteM.isPending}
                    onClick={() => deleteM.mutate(a.id)}
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
