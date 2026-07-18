"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRole, can } from "@/lib/rbac";
import { AttachmentsCard } from "@/features/cases/AttachmentsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";

interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
}
interface CaseFull {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  statusId: number;
  priorityId: number;
  categoryId: number;
  assignedTo: number | null;
  createdBy: number | null;
  escalationLevel: number;
  createdAt: string;
}
interface Comment {
  id: number;
  comment: string;
  createdAt: string;
  createdBy: number | null;
}
interface HistoryEntry {
  id: number;
  actionType: string;
  changeDescription: string | null;
  createdAt: string;
}
interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
}

function useRef(resource: string) {
  return useQuery({
    queryKey: ["ref", resource],
    queryFn: () => apiFetch<Ref[]>(`/api/reference/${resource}`),
    staleTime: 60 * 60 * 1000,
  });
}

export default function CaseDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const t = useTranslations("caseDetail");
  const locale = useLocale();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canAssign = user ? hasRole(user, "manager") : false;
  const canSeeUsers = user ? hasRole(user, "staff") : false;

  const [actionError, setActionError] = useState<string | null>(null);

  const caseQ = useQuery({
    queryKey: ["case", id],
    queryFn: () => apiFetch<{ case: CaseFull }>(`/api/cases/${id}`),
    retry: false,
  });
  const statuses = useRef("statuses");
  const priorities = useRef("priorities");
  const categories = useRef("categories");
  const comments = useQuery({
    queryKey: ["case-comments", id],
    queryFn: () => apiFetch<Comment[]>(`/api/cases/${id}/comments`),
  });
  const history = useQuery({
    queryKey: ["case-history", id],
    queryFn: () => apiFetch<HistoryEntry[]>(`/api/cases/${id}/history`),
  });
  const users = useQuery({
    queryKey: ["users", "all-for-assign"],
    queryFn: () => apiFetch<UserRow[]>(`/api/users?limit=100`),
    enabled: canSeeUsers,
  });

  const label = (list: Ref[] | undefined, refId: number) => {
    const r = list?.find((x) => x.id === refId);
    if (!r) return `#${refId}`;
    return locale === "ar" && r.arabicName ? r.arabicName : r.name;
  };
  const userName = (uid: number | null) => {
    if (uid == null) return t("unassigned");
    const u = users.data?.data.find((x) => x.id === uid);
    return u ? `${u.firstName} ${u.lastName}` : `#${uid}`;
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["case", id] });
    qc.invalidateQueries({ queryKey: ["case-history", id] });
    qc.invalidateQueries({ queryKey: ["cases"] });
  };

  const statusM = useMutation({
    mutationFn: (statusId: number) =>
      apiFetch(`/api/cases/${id}/status`, { method: "PATCH", body: { statusId } }),
    onSuccess: invalidate,
    onError: (e) =>
      setActionError((e as unknown as ApiError)?.message ?? t("transitionError")),
  });
  const assignM = useMutation({
    mutationFn: (assignedTo: number) =>
      apiFetch(`/api/cases/${id}/assign`, { method: "PATCH", body: { assignedTo } }),
    onSuccess: invalidate,
  });
  const commentM = useMutation({
    mutationFn: (comment: string) =>
      apiFetch(`/api/cases/${id}/comments`, { method: "POST", body: { comment } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-comments", id] });
      qc.invalidateQueries({ queryKey: ["case-history", id] });
    },
  });
  const escalateM = useMutation({
    mutationFn: (reason: string) =>
      apiFetch(`/api/cases/${id}/escalate`, { method: "PATCH", body: { reason } }),
    onSuccess: invalidate,
    onError: (e) =>
      setActionError((e as unknown as ApiError)?.message ?? t("transitionError")),
  });

  if (caseQ.isLoading) return <p className="muted">…</p>;
  if (caseQ.isError || !caseQ.data)
    return <p className="center-note">{t("notFound")}</p>;
  const c = caseQ.data.data.case;

  return (
    <>
      <div className="page-head">
        <h1 dir="ltr">{c.caseNumber}</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {user && can(user, "cases", "update", c) && (
            <Link href={`/cases/${c.id}/edit`} className="btn btn-primary">
              {t("edit")}
            </Link>
          )}
          <Link href="/cases" className="btn btn-outline">
            {t("back")}
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="comments" badge={comments.data?.data.length ?? 0}>
            {t("comments")}
          </TabsTrigger>
          <TabsTrigger value="attachments">{t("tabAttachments")}</TabsTrigger>
          <TabsTrigger value="history">{t("history")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
      <div className="form-card" style={{ maxWidth: "72rem", marginBottom: "2.4rem" }}>
        <h2 style={{ marginBottom: "1.2rem" }}>{c.title}</h2>
        <p style={{ marginBottom: "1.6rem" }} dir="auto">
          {c.description}
        </p>
        <p>
          <strong>{t("status")}:</strong>{" "}
          <span className="badge">{label(statuses.data?.data, c.statusId)}</span>
          {c.escalationLevel > 0 && (
            <span
              className="badge"
              style={{
                marginInlineStart: "0.8rem",
                background: "var(--color-red-100)",
                color: "var(--color-red-700)",
              }}
            >
              {t("escalate")} ×{c.escalationLevel}
            </span>
          )}
        </p>
        <p>
          <strong>{t("priority")}:</strong> {label(priorities.data?.data, c.priorityId)}
        </p>
        <p>
          <strong>{t("category")}:</strong> {label(categories.data?.data, c.categoryId)}
        </p>
        {canSeeUsers && (
          <p>
            <strong>{t("assignedTo")}:</strong> {userName(c.assignedTo)}
          </p>
        )}
        <p className="muted">
          {t("created")}: {new Date(c.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Actions */}
      <div className="form-card" style={{ maxWidth: "72rem", marginBottom: "2.4rem" }}>
        <h3 style={{ marginBottom: "1.6rem" }}>{t("actions")}</h3>
        {actionError && (
          <div className="auth-card__error" role="alert">
            {actionError}
          </div>
        )}
        <div className="field">
          <label htmlFor="statusSel">{t("changeStatus")}</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <select id="statusSel" defaultValue={c.statusId}>
              {statuses.data?.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {locale === "ar" && s.arabicName ? s.arabicName : s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              disabled={statusM.isPending}
              onClick={() => {
                setActionError(null);
                const sel = document.getElementById("statusSel") as HTMLSelectElement;
                statusM.mutate(Number(sel.value));
              }}
            >
              {t("apply")}
            </button>
          </div>
        </div>

        <div className="field">
          <label htmlFor="escalateReason">{t("escalateReason")}</label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
            <input id="escalateReason" placeholder={t("escalateReason")} dir="auto" />
            <button
              type="button"
              className="btn btn-outline"
              disabled={escalateM.isPending}
              onClick={() => {
                setActionError(null);
                const el = document.getElementById("escalateReason") as HTMLInputElement;
                const reason = el.value.trim();
                if (reason) {
                  escalateM.mutate(reason);
                  el.value = "";
                }
              }}
            >
              {t("escalate")}
            </button>
          </div>
        </div>

        {canAssign && users.data && (
          <div className="field">
            <label htmlFor="assignSel">{t("assign")}</label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <select id="assignSel" defaultValue={c.assignedTo ?? ""}>
                <option value="">—</option>
                {users.data.data.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-primary"
                disabled={assignM.isPending}
                onClick={() => {
                  const sel = document.getElementById("assignSel") as HTMLSelectElement;
                  if (sel.value) assignM.mutate(Number(sel.value));
                }}
              >
                {t("assign")}
              </button>
            </div>
          </div>
        )}
      </div>

        </TabsContent>

        <TabsContent value="attachments">
          <AttachmentsCard caseId={id} />
        </TabsContent>

        <TabsContent value="comments">
      <div className="form-card" style={{ maxWidth: "72rem", marginBottom: "2.4rem" }}>
        <h3 style={{ marginBottom: "1.6rem" }}>{t("comments")}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formEl = e.currentTarget;
            const text = String(new FormData(formEl).get("comment") ?? "").trim();
            if (text) commentM.mutate(text);
            formEl.reset();
          }}
        >
          <div className="field">
            <label htmlFor="comment">{t("addComment")}</label>
            <textarea id="comment" name="comment" dir="auto" placeholder={t("commentPlaceholder")} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={commentM.isPending}>
            {t("postComment")}
          </button>
        </form>

        <div style={{ marginTop: "2rem" }}>
          {comments.data?.data.length === 0 ? (
            <p className="muted">{t("noComments")}</p>
          ) : (
            comments.data?.data.map((cm) => (
              <div
                key={cm.id}
                style={{
                  padding: "1.2rem 0",
                  borderBottom: "1px solid var(--color-grey-100)",
                }}
              >
                <p dir="auto">{cm.comment}</p>
                <p className="muted" style={{ fontSize: "1.2rem" }}>
                  {new Date(cm.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

        </TabsContent>

        <TabsContent value="history">
      <div className="form-card" style={{ maxWidth: "72rem" }}>
        <h3 style={{ marginBottom: "1.6rem" }}>{t("history")}</h3>
        {history.data?.data.map((h) => (
          <div key={h.id} style={{ padding: "0.8rem 0", fontSize: "1.4rem" }}>
            <span className="badge">{h.actionType}</span>{" "}
            <span className="muted">
              {h.changeDescription} · {new Date(h.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
