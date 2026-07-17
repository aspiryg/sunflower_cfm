"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";

interface CaseRow {
  id: number;
  caseNumber: string;
  title: string;
  createdAt: string;
}
interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
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

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (search) params.set("search", search);
  if (statusId) params.set("statusId", statusId);
  if (priorityId) params.set("priorityId", priorityId);
  if (categoryId) params.set("categoryId", categoryId);
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
      ) : rows.length === 0 ? (
        <p className="center-note">{t("none")}</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>{t("number")}</th>
                <th>{t("subject")}</th>
                <th>{t("created")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td dir="ltr">
                    <Link href={`/cases/${c.id}`} style={{ color: "var(--color-brand-600)" }}>
                      {c.caseNumber}
                    </Link>
                  </td>
                  <td>
                    <Link href={`/cases/${c.id}`}>{c.title}</Link>
                  </td>
                  <td className="muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
