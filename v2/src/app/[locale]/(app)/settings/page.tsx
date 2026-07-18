"use client";

/**
 * Reference-data management (v1 Resources + HierarchicalResources parity):
 * flat lookups plus both hierarchies via config-driven parent chains
 * (region→governorate→community, program→project→activity).
 */
import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { useToast } from "@/ui/Toast";
import { TextField } from "@/ui/form";

interface LookupRow {
  id: number;
  name: string;
  arabicName: string | null;
  code?: string | null;
  isActive: boolean;
}

const RESOURCES = [
  "categories",
  "channels",
  "provider-types",
  "regions",
  "governorates",
  "communities",
  "programs",
  "projects",
  "activities",
] as const;
type ResourceKey = (typeof RESOURCES)[number];

/** Parent chain (outermost first) + code requirement per resource. */
const CONFIG: Record<
  ResourceKey,
  { parents: ResourceKey[]; code: "required" | "optional" | "none" }
> = {
  categories: { parents: [], code: "none" },
  channels: { parents: [], code: "none" },
  "provider-types": { parents: [], code: "none" },
  regions: { parents: [], code: "required" },
  governorates: { parents: ["regions"], code: "required" },
  communities: { parents: ["regions", "governorates"], code: "optional" },
  programs: { parents: [], code: "required" },
  projects: { parents: ["programs"], code: "required" },
  activities: { parents: ["programs", "projects"], code: "required" },
};

/** Which public list endpoint provides options for chain level i. */
function chainQuery(resource: ResourceKey, level: number, parentAbove?: number) {
  const kind = CONFIG[resource].parents[level];
  if (level === 0) return { kind, params: "" };
  const parentParam =
    kind === "governorates" ? `regionId=${parentAbove}` : `programId=${parentAbove}`;
  return { kind, params: parentParam };
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const qc = useQueryClient();
  const toast = useToast();
  const tToast = useTranslations("toasts");
  const [resource, setResource] = useState<ResourceKey>("categories");
  const [chain, setChain] = useState<(number | undefined)[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cfg = CONFIG[resource];
  const parentId = cfg.parents.length ? chain[cfg.parents.length - 1] : undefined;
  const parentsChosen = cfg.parents.every((_, i) => chain[i] != null);

  // Parent option lists (public endpoints, localized).
  const level0 = chainQuery(resource, 0);
  const parent0Q = useQuery({
    queryKey: ["ref", level0.kind ?? "none"],
    queryFn: () => apiFetch<LookupRow[]>(`/api/reference/${level0.kind}`),
    enabled: cfg.parents.length > 0,
    staleTime: 60 * 60 * 1000,
  });
  const level1 = chainQuery(resource, 1, chain[0]);
  const parent1Q = useQuery({
    queryKey: ["ref", level1.kind ?? "none", chain[0] ?? 0],
    queryFn: () =>
      apiFetch<LookupRow[]>(`/api/reference/${level1.kind}?${level1.params}`),
    enabled: cfg.parents.length > 1 && chain[0] != null,
    staleTime: 60 * 60 * 1000,
  });

  const listQ = useQuery({
    queryKey: ["ref-admin", resource, parentId ?? 0],
    queryFn: () =>
      apiFetch<LookupRow[]>(
        `/api/reference/${resource}?all=true${parentId ? `&parentId=${parentId}` : ""}`,
      ),
    enabled: parentsChosen,
  });
  const rows = listQ.data?.data ?? [];

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ref-admin"] });
    qc.invalidateQueries({ queryKey: ["ref"] });
  };

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/api/reference/${resource}`, { method: "POST", body }),
    onSuccess: () => {
      invalidate();
      toast.success(tToast("settingsSaved"));
    },
    onError: (e) => setError((e as unknown as ApiError)?.message ?? t("error")),
  });
  const updateM = useMutation({
    mutationFn: (v: { id: number; body: Record<string, unknown> }) =>
      apiFetch(`/api/reference/${resource}/${v.id}`, { method: "PATCH", body: v.body }),
    onSuccess: () => {
      setEditingId(null);
      invalidate();
      toast.success(tToast("settingsSaved"));
    },
    onError: (e) => setError((e as unknown as ApiError)?.message ?? t("error")),
  });

  const label = (r: LookupRow) =>
    locale === "ar" && r.arabicName ? r.arabicName : r.name;

  function onAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const f = new FormData(formEl);
    const body: Record<string, unknown> = {
      name: String(f.get("name")),
      arabicName: String(f.get("arabicName") ?? "") || undefined,
    };
    if (cfg.code !== "none") {
      const code = String(f.get("code") ?? "").trim();
      if (code) body.code = code;
    }
    if (parentId) body.parentId = parentId;
    createM.mutate(body, { onSuccess: () => formEl.reset() });
  }

  function onSaveEdit(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    updateM.mutate({
      id,
      body: {
        name: String(f.get("name")),
        arabicName: String(f.get("arabicName") ?? "") || null,
      },
    });
  }

  const parentSelect = (
    level: number,
    options: LookupRow[] | undefined,
  ) => (
    <select
      key={level}
      id={`parent-${level}`}
      value={chain[level] ?? ""}
      onChange={(e) => {
        const v = e.target.value ? Number(e.target.value) : undefined;
        setChain((c) => {
          const next = [...c];
          next[level] = v;
          // Reset deeper levels.
          for (let i = level + 1; i < cfg.parents.length; i++) next[i] = undefined;
          return next;
        });
        setEditingId(null);
      }}
    >
      <option value="">{t(`pickParent.${cfg.parents[level]}`)}</option>
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
      </div>
      <p className="muted" style={{ marginBottom: "1.6rem" }}>
        {t("intro")}
      </p>

      <div className="filters-bar">
        <select
          id="resource-type"
          value={resource}
          onChange={(e) => {
            setResource(e.target.value as ResourceKey);
            setChain([]);
            setEditingId(null);
            setError(null);
          }}
        >
          {RESOURCES.map((r) => (
            <option key={r} value={r}>
              {t(`types.${r}`)}
            </option>
          ))}
        </select>
        {cfg.parents.length > 0 && parentSelect(0, parent0Q.data?.data)}
        {cfg.parents.length > 1 && chain[0] != null && parentSelect(1, parent1Q.data?.data)}
      </div>

      {error && (
        <div className="auth-card__error" role="alert">
          {error}
        </div>
      )}

      {!parentsChosen ? (
        <p className="center-note">{t("chooseParent")}</p>
      ) : (
        <>
          <div className="form-card" style={{ marginBottom: "2.4rem" }}>
            <h3 style={{ marginBottom: "1.2rem" }}>{t("addTitle")}</h3>
            <form onSubmit={onAdd} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
              <TextField
                id="name"
                name="name"
                label={t("name")}
                required
                fieldStyle={{ marginBottom: 0, flex: 1, minWidth: "16rem" }}
              />
              <TextField
                id="arabicName"
                name="arabicName"
                label={t("arabicName")}
                dir="rtl"
                fieldStyle={{ marginBottom: 0, flex: 1, minWidth: "16rem" }}
              />
              {cfg.code !== "none" && (
                <TextField
                  id="code"
                  name="code"
                  label={t("code")}
                  required={cfg.code === "required"}
                  maxLength={10}
                  dir="ltr"
                  fieldStyle={{ marginBottom: 0, width: "10rem" }}
                />
              )}
              <button type="submit" className="btn btn-primary" disabled={createM.isPending}>
                {t("add")}
              </button>
            </form>
          </div>

          {listQ.isLoading ? (
            <p className="muted">…</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("arabicName")}</th>
                  <th>{t("status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) =>
                  editingId === r.id ? (
                    <tr key={r.id}>
                      <td colSpan={4}>
                        <form
                          onSubmit={(e) => onSaveEdit(e, r.id)}
                          style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}
                        >
                          <TextField
                            name="name"
                            label={t("name")}
                            defaultValue={r.name}
                            required
                            fieldStyle={{ marginBottom: 0, flex: 1, minWidth: "14rem" }}
                          />
                          <TextField
                            name="arabicName"
                            label={t("arabicName")}
                            defaultValue={r.arabicName ?? ""}
                            dir="rtl"
                            fieldStyle={{ marginBottom: 0, flex: 1, minWidth: "14rem" }}
                          />
                          <button type="submit" className="btn btn-primary" disabled={updateM.isPending} style={{ padding: "0.6rem 1.4rem" }}>
                            {t("save")}
                          </button>
                          <button type="button" className="btn btn-outline" onClick={() => setEditingId(null)} style={{ padding: "0.6rem 1.4rem" }}>
                            {t("cancel")}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={r.id}>
                      <td>
                        {r.name}
                        {r.code ? <span className="muted"> ({r.code})</span> : null}
                      </td>
                      <td dir="rtl">{r.arabicName}</td>
                      <td>
                        <span className={r.isActive ? "badge" : "muted"}>
                          {r.isActive ? t("active") : t("inactive")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                            onClick={() => setEditingId(r.id)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                            disabled={updateM.isPending}
                            onClick={() =>
                              updateM.mutate({ id: r.id, body: { isActive: !r.isActive } })
                            }
                          >
                            {r.isActive ? t("deactivate") : t("activate")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
        </>
      )}

      <p className="muted" style={{ marginTop: "1.6rem", fontSize: "1.3rem" }}>
        {t("lockedNote")}
      </p>
    </>
  );
}
