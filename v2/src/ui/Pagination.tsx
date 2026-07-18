"use client";

/**
 * Standalone pagination control: prev/next arrows plus windowed page numbers
 * with ellipsis. Used by DataTable's footer and reusable for any list. Arrows
 * flip in RTL via CSS (see table.css .pagination__arrow).
 */
import { useTranslations } from "next-intl";

type PageItem = number | "ellipsis";

/** First + last always visible, a window around the current page, ellipsis gaps. */
export function pageWindow(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const items: PageItem[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev === 2) items.push(prev + 1);
    else if (p - prev > 2) items.push("ellipsis");
    items.push(p);
    prev = p;
  }
  return items;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className = "",
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const t = useTranslations("table");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className={`pagination ${className}`} aria-label={t("pagination")}>
      <button
        type="button"
        className="pagination__btn pagination__arrow"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label={t("prev")}
      >
        <span aria-hidden>‹</span>
      </button>
      {pageWindow(page, totalPages).map((item, i) =>
        item === "ellipsis" ? (
          <span key={`e${i}`} className="pagination__ellipsis" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination__btn ${item === page ? "is-active" : ""}`}
            aria-current={item === page ? "page" : undefined}
            aria-label={t("goToPage", { page: item })}
            onClick={() => item !== page && onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="pagination__btn pagination__arrow"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label={t("next")}
      >
        <span aria-hidden>›</span>
      </button>
    </nav>
  );
}
