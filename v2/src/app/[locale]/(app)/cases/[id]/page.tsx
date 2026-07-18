"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import { hasRole, can } from "@/lib/rbac";
import { AttachmentsCard } from "@/features/cases/AttachmentsCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/Tabs";
import { ConfirmationModal } from "@/ui/Modal";
import { useToast } from "@/ui/Toast";
import { Breadcrumb } from "@/ui/Breadcrumb";
import { UserSelect } from "@/ui/UserSelect";
import { StatusBadge } from "@/ui/StatusBadge";

interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
  color?: string | null;
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
  email: string;
  role?: string;
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
  const tCases = useTranslations("cases");
  const locale = useLocale();
  const qc = useQueryClient();
  const { user } = useAuth();
  const canAssign = user ? hasRole(user, "manager") : false;
  const canSeeUsers = user ? hasRole(user, "staff") : false;

  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [assignee, setAssignee] = useState<number | null>(null);
  const [statusSel, setStatusSel] = useState<number | "">("");
  const [escalateReason, setEscalateReason] = useState("");
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const toast = useToast();
  const tToast = useTranslations("toasts");
  const tAi = useTranslations("ai");

  const summarizeM = useMutation({
    mutationFn: () =>
      apiFetch<{ summary: string }>(`/api/cases/${id}/summarize?locale=${locale}`, {
        method: "POST",
      }),
    onSuccess: (res) => setAiSummary(res.data.summary),
    onError: (e) => {
      const err = e as unknown as ApiError;
      toast.error(err.error === "AI_UNAVAILABLE" ? tAi("unavailable") : tAi("error"));
    },
  });

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

  // Seed the status select once the case loads.
  useEffect(() => {
    const s = caseQ.data?.data.case.statusId;
    if (s != null) setStatusSel(s);
  }, [caseQ.data]);

  const refItem = (list: Ref[] | undefined, refId: number) =>
    list?.find((x) => x.id === refId);
  const label = (list: Ref[] | undefined, refId: number) => {
    const r = refItem(list, refId);
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
    onSuccess: () => {
      invalidate();
      toast.success(tToast("statusChanged"));
    },
    onError: (e) =>
      setActionError((e as unknown as ApiError)?.message ?? t("transitionError")),
  });
  const assignM = useMutation({
    mutationFn: (assignedTo: number) =>
      apiFetch(`/api/cases/${id}/assign`, { method: "PATCH", body: { assignedTo } }),
    onSuccess: () => {
      invalidate();
      toast.success(tToast("assigned"));
    },
  });
  const commentM = useMutation({
    mutationFn: (comment: string) =>
      apiFetch(`/api/cases/${id}/comments`, { method: "POST", body: { comment } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["case-comments", id] });
      qc.invalidateQueries({ queryKey: ["case-history", id] });
      toast.success(tToast("commentPosted"));
    },
  });
  const escalateM = useMutation({
    mutationFn: (reason: string) =>
      apiFetch(`/api/cases/${id}/escalate`, { method: "PATCH", body: { reason } }),
    onSuccess: () => {
      invalidate();
      toast.success(tToast("escalated"));
    },
    onError: (e) =>
      setActionError((e as unknown as ApiError)?.message ?? t("transitionError")),
  });
  const router = useRouter();
  const deleteM = useMutation({
    mutationFn: () => apiFetch(`/api/cases/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(tToast("caseDeleted"));
      qc.invalidateQueries({ queryKey: ["cases"] });
      router.replace("/cases");
    },
    onError: () => {
      setConfirmDelete(false);
      toast.error(tToast("error"));
    },
  });

  if (caseQ.isLoading) return <p className="muted">…</p>;
  if (caseQ.isError || !caseQ.data)
    return <p className="center-note">{t("notFound")}</p>;
  const c = caseQ.data.data.case;

  return (
    <>
      <Breadcrumb
        items={[
          { label: tCases("title"), href: "/cases" },
          { label: <span dir="ltr">{c.caseNumber}</span> },
        ]}
      />
      <div className="page-head">
        <h1 dir="ltr">{c.caseNumber}</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          {user && can(user, "cases", "update", c) && (
            <Link href={`/cases/${c.id}/edit`} className="btn btn-primary">
              {t("edit")}
            </Link>
          )}
          {user && can(user, "cases", "delete", c) && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmDelete(true)}
            >
              {t("delete")}
            </button>
          )}
          <Link href="/cases" className="btn btn-outline">
            {t("back")}
          </Link>
        </div>
      </div>

      <ConfirmationModal
        open={confirmDelete}
        title={t("confirmDeleteTitle")}
        body={t("confirmDeleteBody", { number: c.caseNumber })}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        danger
        busy={deleteM.isPending}
        onConfirm={() => deleteM.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />

      <div className="detail-grid">
        {/* ---- Main column: title/description + tabbed content ---- */}
        <div className="detail-main">
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
              <section className="panel">
                <h2 dir="auto">{c.title}</h2>
                <p className="panel__desc" dir="auto">
                  {c.description}
                </p>
                {/* AI summary (Phase 6) */}
                <div className="ai-summary" style={{ marginTop: "2rem" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    disabled={summarizeM.isPending}
                    onClick={() => summarizeM.mutate()}
                  >
                    ✨ {summarizeM.isPending ? tAi("summarizing") : tAi("summarize")}
                  </button>
                  {aiSummary && (
                    <blockquote className="ai-summary__text" dir="auto">
                      {aiSummary}
                    </blockquote>
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="comments">
              <section className="panel">
                <h3>{t("comments")}</h3>
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
                      <div key={cm.id} className="comment">
                        <p dir="auto">{cm.comment}</p>
                        <p className="comment__meta">{new Date(cm.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="attachments">
              <AttachmentsCard caseId={id} />
            </TabsContent>

            <TabsContent value="history">
              <section className="panel">
                <h3>{t("history")}</h3>
                {history.data?.data.map((h) => (
                  <div key={h.id} className="comment">
                    <span className="badge">{h.actionType}</span>{" "}
                    <span className="muted">
                      {h.changeDescription} · {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </section>
            </TabsContent>
          </Tabs>
        </div>

        {/* ---- Sidebar: details + actions ---- */}
        <aside className="detail-side">
          <section className="panel">
            <h3>{t("tabOverview")}</h3>
            <dl className="detail-list">
              <dt>{t("status")}</dt>
              <dd>
                <StatusBadge
                  name={label(statuses.data?.data, c.statusId)}
                  color={refItem(statuses.data?.data, c.statusId)?.color}
                />
                {c.escalationLevel > 0 && (
                  <span
                    className="badge"
                    style={{
                      marginInlineStart: "0.6rem",
                      background: "var(--color-red-100)",
                      color: "var(--color-red-700)",
                    }}
                  >
                    {t("escalate")} ×{c.escalationLevel}
                  </span>
                )}
              </dd>
              <dt>{t("priority")}</dt>
              <dd>
                <StatusBadge
                  name={label(priorities.data?.data, c.priorityId)}
                  color={refItem(priorities.data?.data, c.priorityId)?.color}
                />
              </dd>
              <dt>{t("category")}</dt>
              <dd>{label(categories.data?.data, c.categoryId)}</dd>
              {canSeeUsers && (
                <>
                  <dt>{t("assignedTo")}</dt>
                  <dd>{userName(c.assignedTo)}</dd>
                </>
              )}
              <dt>{t("created")}</dt>
              <dd>{new Date(c.createdAt).toLocaleString()}</dd>
            </dl>
          </section>

          <section className="panel">
            <h3>{t("actions")}</h3>
            {actionError && (
              <div className="auth-card__error" role="alert">
                {actionError}
              </div>
            )}
            <div className="action-row">
              <label htmlFor="statusSel">{t("changeStatus")}</label>
              <div className="action-row__controls">
                <select
                  id="statusSel"
                  value={statusSel}
                  onChange={(e) => setStatusSel(Number(e.target.value))}
                >
                  {statuses.data?.data.map((s) => (
                    <option key={s.id} value={s.id}>
                      {locale === "ar" && s.arabicName ? s.arabicName : s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={statusM.isPending || statusSel === ""}
                  onClick={() => {
                    setActionError(null);
                    if (statusSel !== "") statusM.mutate(Number(statusSel));
                  }}
                >
                  {t("apply")}
                </button>
              </div>
            </div>

            <div className="action-row">
              <label htmlFor="escalateReason">{t("escalateReason")}</label>
              <div className="action-row__controls">
                <input
                  id="escalateReason"
                  placeholder={t("escalateReason")}
                  dir="auto"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={escalateM.isPending}
                  onClick={() => {
                    setActionError(null);
                    const reason = escalateReason.trim();
                    if (reason) {
                      escalateM.mutate(reason);
                      setEscalateReason("");
                    }
                  }}
                >
                  {t("escalate")}
                </button>
              </div>
            </div>

            {canAssign && users.data && (
              <div className="action-row">
                <label htmlFor="assignSel">{t("assign")}</label>
                <div className="action-row__controls">
                  <UserSelect
                    id="assignSel"
                    users={users.data.data}
                    value={assignee}
                    onChange={setAssignee}
                    placeholder={t("unassigned")}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={assignM.isPending || assignee == null}
                    onClick={() => {
                      if (assignee != null) assignM.mutate(assignee);
                    }}
                  >
                    {t("assign")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
