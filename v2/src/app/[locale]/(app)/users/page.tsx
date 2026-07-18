"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { ROLES, type Role } from "@/lib/rbac";
import { useAuth } from "@/features/auth/AuthContext";
import { DataTable, type Column } from "@/ui/DataTable";
import { Avatar } from "@/ui/Avatar";
import { ConfirmationModal } from "@/ui/Modal";

interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export default function UsersPage() {
  const t = useTranslations("users");
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [pendingDeactivate, setPendingDeactivate] = useState<UserRow | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", { page: 1, limit: 50 }],
    queryFn: () => apiFetch<UserRow[]>(`/api/users?limit=50`),
  });

  const roleM = useMutation({
    mutationFn: (v: { id: number; role: Role }) =>
      apiFetch(`/api/users/${v.id}/role`, { method: "PATCH", body: { role: v.role } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
  const deactivateM = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setPendingDeactivate(null);
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: t("name"),
      value: (u) => `${u.firstName} ${u.lastName}`,
      render: (u) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "1rem" }}>
          <Avatar firstName={u.firstName} lastName={u.lastName} size={2.8} />
          {u.firstName} {u.lastName}
        </span>
      ),
    },
    {
      key: "email",
      header: t("email"),
      dir: "ltr",
      value: (u) => u.email,
      render: (u) => u.email,
    },
    {
      key: "role",
      header: t("role"),
      value: (u) => u.role,
      render: (u) => (
        <select
          defaultValue={u.role}
          disabled={me?.id === u.id || roleM.isPending}
          onChange={(e) => roleM.mutate({ id: u.id, role: e.target.value as Role })}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "status",
      header: t("status"),
      value: (u) => (u.isActive ? 1 : 0),
      render: (u) => (
        <span className={u.isActive ? "badge" : "muted"}>
          {u.isActive ? t("active") : t("inactive")}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <h1>{t("title")}</h1>
      </div>

      {isError ? (
        <p className="center-note">{t("loadError")}</p>
      ) : isLoading ? (
        <p className="muted">…</p>
      ) : (
        <DataTable<UserRow>
          empty={t("loadError")}
          rows={data?.data ?? []}
          columns={columns}
          rowActions={(u) =>
            me?.id !== u.id && u.isActive ? (
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                onClick={() => setPendingDeactivate(u)}
              >
                {t("deactivate")}
              </button>
            ) : null
          }
        />
      )}

      <ConfirmationModal
        open={!!pendingDeactivate}
        title={t("confirmDeactivateTitle")}
        body={t("confirmDeactivateBody", {
          name: pendingDeactivate
            ? `${pendingDeactivate.firstName} ${pendingDeactivate.lastName}`
            : "",
        })}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        danger
        busy={deactivateM.isPending}
        onConfirm={() => pendingDeactivate && deactivateM.mutate(pendingDeactivate.id)}
        onCancel={() => setPendingDeactivate(null)}
      />
    </>
  );
}
