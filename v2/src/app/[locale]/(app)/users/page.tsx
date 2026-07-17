"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { ROLES, type Role } from "@/lib/rbac";
import { useAuth } from "@/features/auth/AuthContext";

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

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
        <table className="table">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("role")}</th>
              <th>{t("status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data?.data.map((u) => {
              const isSelf = me?.id === u.id;
              return (
                <tr key={u.id}>
                  <td>
                    {u.firstName} {u.lastName}
                  </td>
                  <td dir="ltr">{u.email}</td>
                  <td>
                    <select
                      defaultValue={u.role}
                      disabled={isSelf || roleM.isPending}
                      onChange={(e) => roleM.mutate({ id: u.id, role: e.target.value as Role })}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={u.isActive ? "badge" : "muted"}>
                      {u.isActive ? t("active") : t("inactive")}
                    </span>
                  </td>
                  <td>
                    {!isSelf && u.isActive && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                        disabled={deactivateM.isPending}
                        onClick={() => deactivateM.mutate(u.id)}
                      >
                        {t("deactivate")}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
