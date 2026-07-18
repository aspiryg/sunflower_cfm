"use client";

/**
 * Generic filter toolbar: a slot for filter controls (inputs/selects reuse the
 * .filters-bar styling), active-filter chips with per-chip remove, a
 * "Clear all" action, and an optional results count.
 */
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export interface FilterChipDef {
  key: string;
  label: ReactNode;
  onRemove: () => void;
}

export function FilterBar({
  children,
  chips = [],
  onClearAll,
  total,
}: {
  /** Filter controls (search input, selects, sort control, ...). */
  children?: ReactNode;
  /** Active filters rendered as removable chips. */
  chips?: FilterChipDef[];
  onClearAll?: () => void;
  /** Total results count; omit to hide. */
  total?: number;
}) {
  const t = useTranslations("table");

  return (
    <div className="filter-bar">
      <div className="filters-bar filter-bar__controls">{children}</div>
      {(chips.length > 0 || total !== undefined) && (
        <div className="filter-bar__meta">
          {chips.length > 0 && (
            <div className="filter-bar__chips">
              {chips.map((c) => (
                <span key={c.key} className="filter-chip">
                  {c.label}
                  <button
                    type="button"
                    className="filter-chip__x"
                    aria-label={t("removeFilter")}
                    onClick={c.onRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
              {onClearAll && (
                <button
                  type="button"
                  className="filter-bar__clear"
                  onClick={onClearAll}
                >
                  {t("clearAll")}
                </button>
              )}
            </div>
          )}
          {total !== undefined && (
            <span className="filter-bar__count">
              {t("results", { count: total })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
