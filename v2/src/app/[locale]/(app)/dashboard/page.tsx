"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/features/auth/AuthContext";

interface CaseRow {
  id: number;
  caseNumber: string;
  title: string;
  createdAt: string;
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("cases");
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["cases", { page: 1, limit: 5 }],
    queryFn: () => apiFetch<CaseRow[]>("/api/cases?limit=5"),
  });
  const statsQ = useQuery({
    queryKey: ["cases", "stats"],
    queryFn: () =>
      apiFetch<{ total: number; open: number; resolved: number }>("/api/cases/stats"),
  });

  const stats = statsQ.data?.data;
  const recent = data?.data ?? [];

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>
      <p className="muted" style={{ marginBottom: "2.4rem" }}>
        {t("welcome", { name: user?.firstName ?? "" })}
      </p>

      <div className="stat-grid">
        <div className="stat">
          <div className="stat__value">{stats?.total ?? "—"}</div>
          <div className="stat__label">{t("totalCases")}</div>
        </div>
        <div className="stat">
          <div className="stat__value">{stats?.open ?? "—"}</div>
          <div className="stat__label">{t("open")}</div>
        </div>
        <div className="stat">
          <div className="stat__value">{stats?.resolved ?? "—"}</div>
          <div className="stat__label">{t("resolved")}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: "1.6rem", fontSize: "1.8rem" }}>
        {t("recent")}
      </h2>
      {isLoading ? (
        <p className="muted">…</p>
      ) : recent.length === 0 ? (
        <p className="center-note">{tc("none")}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{tc("number")}</th>
              <th>{tc("subject")}</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id}>
                <td dir="ltr">{c.caseNumber}</td>
                <td>{c.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
