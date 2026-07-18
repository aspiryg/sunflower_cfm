"use client";

/**
 * Reusable data table: typed columns, sortable headers (client-side over the
 * current server page), per-cell render/dir, row actions slot, empty state.
 */
import { useMemo, useState, type ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Sort/compare value; enables the sort toggle when present. */
  value?: (row: T) => string | number | null | undefined;
  render: (row: T) => ReactNode;
  /** Force cell direction (e.g. "ltr" for codes/emails). */
  dir?: "ltr" | "rtl";
  width?: string;
}

export function DataTable<T extends { id: number | string }>({
  columns,
  rows,
  empty,
  rowActions,
}: {
  columns: Column<T>[];
  rows: T[];
  empty: ReactNode;
  /** Optional trailing actions cell per row. */
  rowActions?: (row: T) => ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
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
  }, [rows, columns, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  if (rows.length === 0) return <p className="center-note">{empty}</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={c.width ? { width: c.width } : undefined}>
              {c.value ? (
                <button
                  type="button"
                  className="table__sort"
                  onClick={() => toggleSort(c.key)}
                  aria-label={`Sort by ${c.key}`}
                >
                  {c.header}
                  <span className="table__sort-icon" aria-hidden>
                    {sortKey === c.key ? (sortDir === 1 ? "▲" : "▼") : "↕"}
                  </span>
                </button>
              ) : (
                c.header
              )}
            </th>
          ))}
          {rowActions && <th />}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.id}>
            {columns.map((c) => (
              <td key={c.key} dir={c.dir}>
                {c.render(row)}
              </td>
            ))}
            {rowActions && <td className="table__actions">{rowActions(row)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
