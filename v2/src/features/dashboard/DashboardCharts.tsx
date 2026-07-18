"use client";

/** Dashboard charts (v1 parity): 30-day trend, status distribution, categories. */
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { apiFetch } from "@/lib/api/client";

interface Slice {
  id: number;
  name: string;
  arabicName: string | null;
  color: string | null;
  count: number;
}
interface Analytics {
  trend: { day: string; count: number }[];
  byStatus: Slice[];
  byCategory: Slice[];
}

const FALLBACK = "#6366f1";

export function DashboardCharts() {
  const t = useTranslations("charts");
  const locale = useLocale();

  const { data } = useQuery({
    queryKey: ["cases", "analytics"],
    queryFn: () => apiFetch<Analytics>("/api/cases/analytics"),
  });
  const a = data?.data;
  if (!a) return null;

  const label = (s: Slice) =>
    locale === "ar" && s.arabicName ? s.arabicName : s.name;
  const statusData = a.byStatus.map((s) => ({ ...s, label: label(s) }));
  const categoryData = a.byCategory.map((s) => ({ ...s, label: label(s) }));
  const trendData = a.trend.map((p) => ({
    ...p,
    label: new Date(p.day).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>{t("trend")}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData}>
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--color-grey-400)" />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} stroke="var(--color-grey-400)" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-brand-500)"
              fill="var(--color-brand-500)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>{t("byStatus")}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="label"
              innerRadius={45}
              outerRadius={80}
              paddingAngle={2}
            >
              {statusData.map((s) => (
                <Cell key={s.id} fill={s.color ?? FALLBACK} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>{t("byCategory")}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData} layout="vertical">
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--color-grey-400)" />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fontSize: 11 }}
              stroke="var(--color-grey-400)"
            />
            <Tooltip />
            <Bar dataKey="count" radius={4}>
              {categoryData.map((s) => (
                <Cell key={s.id} fill={s.color ?? FALLBACK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
