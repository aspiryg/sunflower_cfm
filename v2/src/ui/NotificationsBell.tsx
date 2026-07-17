"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const KNOWN_TYPES = new Set([
  "case_assigned",
  "case_updated",
  "case_status_changed",
  "comment_added",
  "escalation",
  "due_date_reminder",
  "case_resolved",
  "assignment_transferred",
  "quality_review_required",
]);

export function NotificationsBell() {
  const t = useTranslations("notifs");
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      apiFetch<NotificationRow[]>("/api/notifications?limit=10"),
    refetchInterval: 30_000,
  });
  const unread =
    (data as unknown as { summary?: { unread: number } })?.summary?.unread ?? 0;
  const rows = data?.data ?? [];

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

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const label = (n: NotificationRow) =>
    KNOWN_TYPES.has(n.type)
      ? t(`types.${n.type}`, { caseNumber: n.metadata?.caseNumber ?? "" })
      : n.type;

  function onItemClick(n: NotificationRow) {
    if (!n.isRead) readM.mutate(n.id);
    setOpen(false);
    if (n.actionUrl) router.push(n.actionUrl);
  }

  return (
    <div className="bell" ref={wrapRef}>
      <button
        type="button"
        className="icon-btn"
        aria-label={t("label")}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden>🔔</span>
        {unread > 0 && (
          <span className="bell__badge">{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="bell__menu" role="menu" aria-label={t("label")}>
          <div className="bell__head">
            <strong>{t("label")}</strong>
            {unread > 0 && (
              <button
                type="button"
                className="bell__mark-all"
                onClick={() => readAllM.mutate()}
              >
                {t("markAllRead")}
              </button>
            )}
          </div>
          {rows.length === 0 ? (
            <p className="bell__empty">{t("empty")}</p>
          ) : (
            rows.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                className={`bell__item ${n.isRead ? "" : "is-unread"}`}
                onClick={() => onItemClick(n)}
              >
                <span>{label(n)}</span>
                <span className="bell__time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
