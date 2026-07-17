"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";

interface CaseRow {
  id: number;
  caseNumber: string;
  title: string;
  createdAt: string;
}

const PAGE_SIZE = 20;

export default function CasesPage() {
  const t = useTranslations("cases");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cases", { page, limit: PAGE_SIZE }],
    queryFn: () => apiFetch<CaseRow[]>(`/api/cases?page=${page}&limit=${PAGE_SIZE}`),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
        <Link href="/cases/new" className="btn btn-primary">
          {t("new")}
        </Link>
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
                  <td dir="ltr">{c.caseNumber}</td>
                  <td>{c.title}</td>
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
