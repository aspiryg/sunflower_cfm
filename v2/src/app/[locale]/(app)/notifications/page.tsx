"use client";

/** Full notifications page (v1 parity — beyond the header bell). */
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useRouter } from "@/i18n/navigation";

interface NotificationRow {
  id: number;
  type: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
  metadata: { caseNumber?: string } | null;
}

const KNOWN = new Set([
  "case_assigned", "case_updated", "case_status_changed", "comment_added",
  "escalation", "due_date_reminder", "case_resolved", "assignment_transferred",
  "quality_review_required",
]);
const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const t = useTranslations("notifs");
  const qc = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page", page],
    queryFn: () =>
      apiFetch<NotificationRow[]>(`/api/notifications?page=${page}&limit=${PAGE_SIZE}`),
    placeholderData: keepPreviousData,
  });
  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const unread =
    (data as unknown as { summary?: { unread: number } })?.summary?.unread ?? 0;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["notifications"] });
  const readM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: invalidate,
  });
  const readAllM = useMutation({
    mutationFn: () => apiFetch("/api/notifications/read-all", { method: "PATCH" }),
    onSuccess: invalidate,
  });
  const deleteM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/notifications/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  const label = (n: NotificationRow) =>
    KNOWN.has(n.type)
      ? t(`types.${n.type}`, { caseNumber: n.metadata?.caseNumber ?? "" })
      : n.type;

  return (
    <>
      <div className="page-head">
        <h1>{t("pageTitle")}</h1>
        {unread > 0 && (
          <button
            type="button"
            className="btn btn-outline"
            disabled={readAllM.isPending}
            onClick={() => readAllM.mutate()}
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="muted">…</p>
      ) : rows.length === 0 ? (
        <p className="center-note">{t("empty")}</p>
      ) : (
        <table className="table">
          <tbody>
            {rows.map((n) => (
              <tr key={n.id} style={n.isRead ? undefined : { background: "var(--color-brand-50)" }}>
                <td>
                  <button
                    type="button"
                    className="table__sort"
                    style={{ fontWeight: n.isRead ? 400 : 600 }}
                    onClick={() => {
                      if (!n.isRead) readM.mutate(n.id);
                      if (n.actionUrl) router.push(n.actionUrl);
                    }}
                  >
                    {label(n)}
                  </button>
                </td>
                <td className="muted">{new Date(n.createdAt).toLocaleString()}</td>
                <td className="table__actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                    disabled={deleteM.isPending}
                    onClick={() => deleteM.mutate(n.id)}
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
          <button type="button" className="btn btn-outline" disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ‹
          </button>
          <span className="muted" style={{ alignSelf: "center" }}>
            {pagination.page} / {pagination.totalPages}
          </span>
          <button type="button" className="btn btn-outline" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </div>
      )}
    </>
  );
}
