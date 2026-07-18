"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";
import { DataTable, type Column } from "@/ui/DataTable";
import { StatusBadge } from "@/ui/StatusBadge";

interface CaseRow {
  id: number;
  caseNumber: string;
  title: string;
  statusId: number;
  priorityId: number;
  createdAt: string;
}
interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
  color?: string | null;
}

const PAGE_SIZE = 20;

function useReference(resource: string) {
  return useQuery({
    queryKey: ["ref", resource],
    queryFn: () => apiFetch<Ref[]>(`/api/reference/${resource}`),
    staleTime: 60 * 60 * 1000,
  });
}

export default function CasesPage() {
  const t = useTranslations("cases");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusId, setStatusId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [mine, setMine] = useState<"" | "assigned" | "created">("");

  // Debounce free-text search.
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const statuses = useReference("statuses");
  const priorities = useReference("priorities");
  const categories = useReference("categories");
  const label = (r: Ref) =>
    locale === "ar" && r.arabicName ? r.arabicName : r.name;
  const refName = (list: Ref[] | undefined, id: number) => {
    const r = list?.find((x) => x.id === id);
    return r ? label(r) : "";
  };

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (search) params.set("search", search);
  if (statusId) params.set("statusId", statusId);
  if (priorityId) params.set("priorityId", priorityId);
  if (categoryId) params.set("categoryId", categoryId);
  if (mine) params.set("mine", mine);
  const qs = params.toString();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", qs],
    queryFn: () => apiFetch<CaseRow[]>(`/api/cases?${qs}`),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const filterSelect = (
    id: string,
    value: string,
    setter: (v: string) => void,
    allLabel: string,
    options: Ref[] | undefined,
  ) => (
    <select
      id={id}
      value={value}
      onChange={(e) => {
        setter(e.target.value);
        setPage(1);
      }}
      style={{ minWidth: "14rem" }}
    >
      <option value="">{allLabel}</option>
      {options?.map((o) => (
        <option key={o.id} value={o.id}>
          {label(o)}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
        <Link href="/cases/new" className="btn btn-primary">
          {t("new")}
        </Link>
      </div>

      <div className="scope-tabs" role="tablist">
        {(["", "assigned", "created"] as const).map((s) => (
          <button
            key={s || "all"}
            type="button"
            role="tab"
            aria-selected={mine === s}
            className={`scope-tab ${mine === s ? "is-active" : ""}`}
            onClick={() => {
              setMine(s);
              setPage(1);
            }}
          >
            {s === "" ? t("scopeAll") : s === "assigned" ? t("scopeAssigned") : t("scopeCreated")}
          </button>
        ))}
      </div>

      <div className="filters-bar">
        <input
          id="case-search"
          type="search"
          placeholder={t("searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          dir="auto"
        />
        {filterSelect("filter-status", statusId, setStatusId, t("allStatuses"), statuses.data?.data)}
        {filterSelect("filter-priority", priorityId, setPriorityId, t("allPriorities"), priorities.data?.data)}
        {filterSelect("filter-category", categoryId, setCategoryId, t("allCategories"), categories.data?.data)}
      </div>

      {isError ? (
        <p className="center-note">{t("loadError")}</p>
      ) : isLoading ? (
        <p className="muted">…</p>
      ) : (
        <>
          <DataTable<CaseRow>
            empty={t("none")}
            rows={rows}
            columns={
              [
                {
                  key: "number",
                  header: t("number"),
                  dir: "ltr",
                  value: (c) => c.caseNumber,
                  render: (c) => (
                    <Link href={`/cases/${c.id}`} style={{ color: "var(--color-brand-600)", fontWeight: 600 }}>
                      {c.caseNumber}
                    </Link>
                  ),
                },
                {
                  key: "title",
                  header: t("subject"),
                  value: (c) => c.title,
                  render: (c) => <Link href={`/cases/${c.id}`}>{c.title}</Link>,
                },
                {
                  key: "status",
                  header: t("status"),
                  value: (c) => refName(statuses.data?.data, c.statusId),
                  render: (c) => {
                    const r = statuses.data?.data.find((x) => x.id === c.statusId);
                    return r ? <StatusBadge name={label(r)} color={r.color} /> : "—";
                  },
                },
                {
                  key: "priority",
                  header: t("priorityLabel"),
                  value: (c) => c.priorityId,
                  render: (c) => {
                    const r = priorities.data?.data.find((x) => x.id === c.priorityId);
                    return r ? <StatusBadge name={label(r)} color={r.color} /> : "—";
                  },
                },
                {
                  key: "created",
                  header: t("created"),
                  value: (c) => c.createdAt,
                  render: (c) => (
                    <span className="muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  ),
                },
              ] satisfies Column<CaseRow>[]
            }
          />

          {pagination && pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              <span className="muted" style={{ alignSelf: "center" }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
