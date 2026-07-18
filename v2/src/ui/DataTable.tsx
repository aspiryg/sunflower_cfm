"use client";

/**
 * Reusable data table: typed columns, sortable headers (client-side by default,
 * server-driven via the `sort` prop), pagination footer with page-size
 * selector, column visibility toggle, loading skeleton, row click, and a
 * row-actions menu built on the Menu primitive. All additions are optional —
 * the original { columns, rows, empty, rowActions } API is unchanged.
 */
import { useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "./Menu";
import { Pagination } from "./Pagination";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Plain-text label for the columns dropdown (defaults to header when it's a string). */
  label?: string;
  /** Sort/compare value; enables the client-side sort toggle when present. */
  value?: (row: T) => string | number | null | undefined;
  render: (row: T) => ReactNode;
  /** Force cell direction (e.g. "ltr" for codes/emails). */
  dir?: "ltr" | "rtl";
  width?: string;
  /** Show this column in the visibility dropdown. */
  hideable?: boolean;
  /** Server-side sort field; enables header sorting when `sort` is passed. */
  sortKey?: string;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** Defaults to [10, 25, 50]. */
  pageSizeOptions?: number[];
}

export interface TableSort {
  sortBy: string;
  sortDir: "asc" | "desc";
  onChange: (sortBy: string, sortDir: "asc" | "desc") => void;
}

const DEFAULT_PAGE_SIZES = [10, 25, 50];

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  empty,
  rowActions,
  pagination,
  sort,
  loading = false,
  onRowClick,
  rowMenu,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: ReactNode;
  /** Optional trailing actions cell per row. */
  rowActions?: (row: T) => ReactNode;
  /** Server-side pagination footer. */
  pagination?: TablePagination;
  /** Server-driven sorting; disables client-side sorting when present. */
  sort?: TableSort;
  /** Render shimmer skeleton rows instead of blanking the table. */
  loading?: boolean;
  onRowClick?: (row: T) => void;
  /** Row actions dropdown (Menu items); rendered in a trailing "⋯" menu. */
  rowMenu?: (row: T, close: () => void) => ReactNode;
}) {
  const t = useTranslations("table");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const hideableCols = columns.filter((c) => c.hideable);
  const visibleCols = columns.filter((c) => !hidden.has(c.key));
  const hasActionsCol = Boolean(rowActions || rowMenu);

  const sorted = useMemo(() => {
    if (sort || !sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.value) return rows;
    return [...rows].sort((a, b) => {
      const av = col.value!(a);
      const bv = col.value!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sortDir;
      }
      return String(av).localeCompare(String(bv)) * sortDir;
    });
  }, [rows, columns, sortKey, sortDir, sort]);

  function toggleClientSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  function toggleServerSort(key: string) {
    if (!sort) return;
    if (sort.sortBy === key) {
      sort.onChange(key, sort.sortDir === "asc" ? "desc" : "asc");
    } else {
      sort.onChange(key, "desc");
    }
  }

  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleRowClick(row: T, e: MouseEvent<HTMLTableRowElement>) {
    if (!onRowClick) return;
    // Ignore clicks on interactive elements inside the row.
    const el = e.target as HTMLElement;
    if (el.closest("a, button, select, input, label, [role='menu']")) return;
    onRowClick(row);
  }

  function sortState(c: Column<T>): { active: boolean; dir: "asc" | "desc" } {
    if (sort && c.sortKey) {
      return { active: sort.sortBy === c.sortKey, dir: sort.sortDir };
    }
    return { active: sortKey === c.key, dir: sortDir === 1 ? "asc" : "desc" };
  }

  if (!loading && rows.length === 0) {
    return <p className="center-note">{empty}</p>;
  }

  const skeletonRows = Math.min(pagination?.pageSize ?? 5, 8);
  const from =
    pagination && pagination.total > 0
      ? (pagination.page - 1) * pagination.pageSize + 1
      : 0;
  const to = pagination
    ? Math.min(pagination.page * pagination.pageSize, pagination.total)
    : 0;

  const table = (
    <table className="table">
      <thead>
        <tr>
          {visibleCols.map((c) => {
            const sortable = sort ? Boolean(c.sortKey) : Boolean(c.value);
            const s = sortState(c);
            return (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {sortable ? (
                  <button
                    type="button"
                    className={`table__sort ${s.active ? "is-active" : ""}`}
                    onClick={() =>
                      sort ? toggleServerSort(c.sortKey!) : toggleClientSort(c.key)
                    }
                    aria-label={`${t("sortBy")}: ${c.label ?? c.key}`}
                  >
                    {c.header}
                    <span className="table__sort-icon" aria-hidden>
                      {s.active ? (s.dir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                ) : (
                  c.header
                )}
              </th>
            );
          })}
          {hasActionsCol && <th />}
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: skeletonRows }, (_, i) => (
              <tr key={`sk${i}`} className="table__skeleton-row" aria-hidden>
                {visibleCols.map((c) => (
                  <td key={c.key}>
                    <span className="skeleton" />
                  </td>
                ))}
                {hasActionsCol && (
                  <td>
                    <span className="skeleton" />
                  </td>
                )}
              </tr>
            ))
          : sorted.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? "is-clickable" : undefined}
                onClick={(e) => handleRowClick(row, e)}
              >
                {visibleCols.map((c) => (
                  <td key={c.key} dir={c.dir}>
                    {c.render(row)}
                  </td>
                ))}
                {hasActionsCol && (
                  <td className="table__actions">
                    {rowActions?.(row)}
                    {rowMenu && (
                      <Menu
                        trigger={
                          <span className="table__menu-trigger" aria-hidden>
                            ⋯
                          </span>
                        }
                        ariaLabel={t("actions")}
                      >
                        {(close) => rowMenu(row, close)}
                      </Menu>
                    )}
                  </td>
                )}
              </tr>
            ))}
      </tbody>
    </table>
  );

  // Bare table when no chrome is requested — identical DOM to the original.
  if (!pagination && hideableCols.length === 0) return table;

  return (
    <div className="table-wrap">
      {hideableCols.length > 0 && (
        <div className="table-toolbar">
          <Menu
            trigger={<span className="table-cols__trigger">{t("columns")} ▾</span>}
            ariaLabel={t("columns")}
            className="table-cols"
          >
            {hideableCols.map((c) => (
              <label key={c.key} className="table-cols__item">
                <input
                  type="checkbox"
                  checked={!hidden.has(c.key)}
                  onChange={() => toggleHidden(c.key)}
                />
                {c.label ?? (typeof c.header === "string" ? c.header : c.key)}
              </label>
            ))}
          </Menu>
        </div>
      )}

      {table}

      {pagination && (
        <div className="table-footer">
          <span className="table-footer__summary">
            {t("showing", { from, to, total: pagination.total })}
          </span>
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
          />
          <select
            className="table-footer__size"
            aria-label={t("perPage", { count: pagination.pageSize })}
            value={pagination.pageSize}
            onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
          >
            {(pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZES).map((n) => (
              <option key={n} value={n}>
                {t("perPage", { count: n })}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
