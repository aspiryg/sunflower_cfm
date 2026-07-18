"use client";

/**
 * Cases list: FilterBar (search, status/priority/category selects, sort
 * control, active-filter chips) + DataTable (server-side sort/pagination,
 * column visibility, row click). Filter state lives in the URL search params
 * so it survives refresh and back/forward navigation.
 */
import { Suspense, useCallback, useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { DataTable, type Column } from "@/ui/DataTable";
import { FilterBar, type FilterChipDef } from "@/ui/FilterBar";
import { StatusBadge } from "@/ui/StatusBadge";

interface CaseRow {
  id: number;
  caseNumber: string;
  title: string;
  statusId: number;
  priorityId: number;
  categoryId: number;
  createdAt: string;
}
interface Ref {
  id: number;
  name: string;
  arabicName: string | null;
  color?: string | null;
}

const PAGE_SIZES = [10, 25, 50];
const SORT_KEYS = [
  "createdAt",
  "updatedAt",
  "caseNumber",
  "title",
  "priorityId",
  "statusId",
  "dueDate",
] as const;
type SortKey = (typeof SORT_KEYS)[number];

function useReference(resource: string) {
  return useQuery({
    queryKey: ["ref", resource],
    queryFn: () => apiFetch<Ref[]>(`/api/reference/${resource}`),
    staleTime: 60 * 60 * 1000,
  });
}

// useSearchParams needs a Suspense boundary for prerendering.
export default function CasesPage() {
  return (
    <Suspense fallback={null}>
      <CasesPageInner />
    </Suspense>
  );
}

function CasesPageInner() {
  const t = useTranslations("cases");
  const tt = useTranslations("table");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // --- URL-backed filter state ---
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const limitRaw = Number(sp.get("limit"));
  const limit = PAGE_SIZES.includes(limitRaw) ? limitRaw : 25;
  const search = sp.get("search") ?? "";
  const statusId = sp.get("statusId") ?? "";
  const priorityId = sp.get("priorityId") ?? "";
  const categoryId = sp.get("categoryId") ?? "";
  const mineRaw = sp.get("mine");
  const mine = mineRaw === "assigned" || mineRaw === "created" ? mineRaw : "";
  const sortByRaw = sp.get("sortBy") as SortKey | null;
  const sortBy: SortKey =
    sortByRaw && SORT_KEYS.includes(sortByRaw) ? sortByRaw : "createdAt";
  const sortDir = sp.get("sortDir") === "asc" ? "asc" : "desc";

  const setParams = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(sp.toString());
      if (resetPage) next.delete("page");
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  // Debounced free-text search (input state is local; URL is the source of truth).
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setParams({ search: searchInput.trim() });
      }
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, search, setParams]);

  // --- Reference data ---
  const statuses = useReference("statuses");
  const priorities = useReference("priorities");
  const categories = useReference("categories");
  const label = (r: Ref) =>
    locale === "ar" && r.arabicName ? r.arabicName : r.name;
  const refName = (list: Ref[] | undefined, id: number | string) => {
    const r = list?.find((x) => String(x.id) === String(id));
    return r ? label(r) : "";
  };

  // --- Data query ---
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set("search", search);
  if (statusId) params.set("statusId", statusId);
  if (priorityId) params.set("priorityId", priorityId);
  if (categoryId) params.set("categoryId", categoryId);
  if (mine) params.set("mine", mine);
  params.set("sortBy", sortBy);
  params.set("sortDir", sortDir);
  const qs = params.toString();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", qs],
    queryFn: () => apiFetch<CaseRow[]>(`/api/cases?${qs}`),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  // --- Filters UI ---
  const filterSelect = (
    id: string,
    value: string,
    param: string,
    allLabel: string,
    options: Ref[] | undefined,
  ) => (
    <select
      id={id}
      value={value}
      onChange={(e) => setParams({ [param]: e.target.value })}
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

  const chips: FilterChipDef[] = [];
  if (search) {
    chips.push({
      key: "search",
      label: `"${search}"`,
      onRemove: () => {
        setSearchInput("");
        setParams({ search: null });
      },
    });
  }
  if (statusId) {
    chips.push({
      key: "status",
      label: `${t("status")}: ${refName(statuses.data?.data, statusId)}`,
      onRemove: () => setParams({ statusId: null }),
    });
  }
  if (priorityId) {
    chips.push({
      key: "priority",
      label: `${t("priorityLabel")}: ${refName(priorities.data?.data, priorityId)}`,
      onRemove: () => setParams({ priorityId: null }),
    });
  }
  if (categoryId) {
    chips.push({
      key: "category",
      label: `${t("category")}: ${refName(categories.data?.data, categoryId)}`,
      onRemove: () => setParams({ categoryId: null }),
    });
  }
  if (mine) {
    chips.push({
      key: "mine",
      label: mine === "assigned" ? t("scopeAssigned") : t("scopeCreated"),
      onRemove: () => setParams({ mine: null }),
    });
  }

  const clearAll = () => {
    setSearchInput("");
    setParams({
      search: null,
      statusId: null,
      priorityId: null,
      categoryId: null,
      mine: null,
    });
  };

  const columns: Column<CaseRow>[] = [
    {
      key: "number",
      header: t("number"),
      label: t("number"),
      dir: "ltr",
      sortKey: "caseNumber",
      render: (c) => (
        <Link
          href={`/cases/${c.id}`}
          style={{ color: "var(--color-brand-600)", fontWeight: 600 }}
        >
          {c.caseNumber}
        </Link>
      ),
    },
    {
      key: "title",
      header: t("subject"),
      label: t("subject"),
      sortKey: "title",
      render: (c) => <Link href={`/cases/${c.id}`}>{c.title}</Link>,
    },
    {
      key: "status",
      header: t("status"),
      label: t("status"),
      sortKey: "statusId",
      hideable: true,
      render: (c) => {
        const r = statuses.data?.data.find((x) => x.id === c.statusId);
        return r ? <StatusBadge name={label(r)} color={r.color} /> : "—";
      },
    },
    {
      key: "priority",
      header: t("priorityLabel"),
      label: t("priorityLabel"),
      sortKey: "priorityId",
      hideable: true,
      render: (c) => {
        const r = priorities.data?.data.find((x) => x.id === c.priorityId);
        return r ? <StatusBadge name={label(r)} color={r.color} /> : "—";
      },
    },
    {
      key: "category",
      header: t("category"),
      label: t("category"),
      hideable: true,
      render: (c) => refName(categories.data?.data, c.categoryId) || "—",
    },
    {
      key: "created",
      header: t("created"),
      label: t("created"),
      sortKey: "createdAt",
      hideable: true,
      render: (c) => (
        <span className="muted">{new Date(c.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

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
            onClick={() => setParams({ mine: s || null })}
          >
            {s === ""
              ? t("scopeAll")
              : s === "assigned"
                ? t("scopeAssigned")
                : t("scopeCreated")}
          </button>
        ))}
      </div>

      <FilterBar
        chips={chips}
        onClearAll={clearAll}
        total={pagination?.total}
      >
        <input
          id="case-search"
          type="search"
          placeholder={t("searchPlaceholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          dir="auto"
        />
        {filterSelect("filter-status", statusId, "statusId", t("allStatuses"), statuses.data?.data)}
        {filterSelect("filter-priority", priorityId, "priorityId", t("allPriorities"), priorities.data?.data)}
        {filterSelect("filter-category", categoryId, "categoryId", t("allCategories"), categories.data?.data)}
        <span className="filter-bar__sort">
          <label htmlFor="case-sort" className="muted">
            {tt("sortBy")}
          </label>
          <select
            id="case-sort"
            value={sortBy}
            onChange={(e) => setParams({ sortBy: e.target.value }, false)}
          >
            <option value="createdAt">{tt("sortCreatedAt")}</option>
            <option value="updatedAt">{tt("sortUpdatedAt")}</option>
            <option value="caseNumber">{tt("sortCaseNumber")}</option>
            <option value="title">{tt("sortTitle")}</option>
            <option value="priorityId">{tt("sortPriority")}</option>
            <option value="statusId">{tt("sortStatus")}</option>
            <option value="dueDate">{tt("sortDueDate")}</option>
          </select>
          <button
            type="button"
            className="btn btn-outline filter-bar__dir"
            aria-label={sortDir === "asc" ? tt("sortAsc") : tt("sortDesc")}
            onClick={() =>
              setParams({ sortDir: sortDir === "asc" ? "desc" : "asc" }, false)
            }
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </span>
      </FilterBar>

      {isError ? (
        <p className="center-note">{t("loadError")}</p>
      ) : (
        <DataTable<CaseRow>
          empty={t("none")}
          rows={rows}
          columns={columns}
          loading={isLoading}
          onRowClick={(c) => router.push(`/cases/${c.id}`)}
          sort={{
            sortBy,
            sortDir,
            onChange: (key, dir) =>
              setParams({ sortBy: key, sortDir: dir }, false),
          }}
          pagination={{
            page,
            pageSize: limit,
            total: pagination?.total ?? 0,
            onPageChange: (p) =>
              setParams({ page: p === 1 ? null : String(p) }, false),
            onPageSizeChange: (s) =>
              setParams({ limit: s === 25 ? null : String(s) }),
          }}
        />
      )}
    </>
  );
}
