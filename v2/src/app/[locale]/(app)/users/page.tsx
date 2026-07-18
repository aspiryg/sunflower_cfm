"use client";

/**
 * User management: FilterBar (search + role filter with chips) and DataTable
 * with server-side pagination, inline role change, and deactivation.
 */
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { ROLES, type Role } from "@/lib/rbac";
import { useAuth } from "@/features/auth/AuthContext";
import { DataTable, type Column } from "@/ui/DataTable";
import { FilterBar, type FilterChipDef } from "@/ui/FilterBar";
import { Avatar } from "@/ui/Avatar";
import { ConfirmationModal } from "@/ui/Modal";
import { CreateUserModal } from "@/features/users/CreateUserModal";
import { EditUserModal } from "@/features/users/EditUserModal";
import { useToast } from "@/ui/Toast";

interface UserRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organization?: string | null;
  role: Role;
  isActive: boolean;
}

export default function UsersPage() {
  const t = useTranslations("users");
  const tt = useTranslations("table");
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [pendingDeactivate, setPendingDeactivate] = useState<UserRow | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const toast = useToast();
  const tToast = useTranslations("toasts");

  // Filters + pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | Role>("");

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
    // Surface deactivated users so they can be reactivated (admins only).
    includeInactive: "true",
  });
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  const qs = params.toString();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", qs],
    queryFn: () => apiFetch<UserRow[]>(`/api/users?${qs}`),
    placeholderData: keepPreviousData,
  });

  const roleM = useMutation({
    mutationFn: (v: { id: number; role: Role }) =>
      apiFetch(`/api/users/${v.id}/role`, {
        method: "PATCH",
        // Always attach an audit reason so the change isn't silently unexplained.
        body: { role: v.role, reason: t("roleChangeDefaultReason") },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(tToast("userUpdated"));
    },
  });
  const deactivateM = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setPendingDeactivate(null);
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(tToast("userUpdated"));
    },
  });
  const reactivateM = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/users/${id}`, { method: "PATCH", body: { isActive: true } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(tToast("userUpdated"));
    },
  });

  const chips: FilterChipDef[] = [];
  if (search) {
    chips.push({
      key: "search",
      label: `"${search}"`,
      onRemove: () => {
        setSearchInput("");
        setSearch("");
        setPage(1);
      },
    });
  }
  if (role) {
    chips.push({
      key: "role",
      label: `${t("role")}: ${role}`,
      onRemove: () => {
        setRole("");
        setPage(1);
      },
    });
  }

  const columns: Column<UserRow>[] = [
    {
      key: "name",
      header: t("name"),
      label: t("name"),
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
      label: t("email"),
      dir: "ltr",
      hideable: true,
      value: (u) => u.email,
      render: (u) => u.email,
    },
    {
      key: "role",
      header: t("role"),
      label: t("role"),
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
      label: t("status"),
      hideable: true,
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
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          {t("addUser")}
        </button>
      </div>

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserModal user={editing} onClose={() => setEditing(null)} />

      <FilterBar
        chips={chips}
        onClearAll={() => {
          setSearchInput("");
          setSearch("");
          setRole("");
          setPage(1);
        }}
        total={data?.pagination?.total}
      >
        <input
          id="user-search"
          type="search"
          placeholder={tt("search")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          dir="auto"
        />
        <select
          id="filter-role"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as "" | Role);
            setPage(1);
          }}
          style={{ minWidth: "14rem" }}
        >
          <option value="">{tt("all")}</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </FilterBar>

      {isError ? (
        <p className="center-note">{t("loadError")}</p>
      ) : (
        <DataTable<UserRow>
          empty={t("loadError")}
          rows={data?.data ?? []}
          columns={columns}
          loading={isLoading}
          pagination={{
            page,
            pageSize,
            total: data?.pagination?.total ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (s) => {
              setPageSize(s);
              setPage(1);
            },
          }}
          rowActions={(u) =>
            me?.id !== u.id ? (
              <span style={{ display: "inline-flex", gap: "0.6rem" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                  onClick={() => setEditing(u)}
                >
                  {t("edit")}
                </button>
                {u.isActive ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                    onClick={() => setPendingDeactivate(u)}
                  >
                    {t("deactivate")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "0.4rem 1rem", fontSize: "1.3rem" }}
                    disabled={reactivateM.isPending}
                    onClick={() => reactivateM.mutate(u.id)}
                  >
                    {t("reactivate")}
                  </button>
                )}
              </span>
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
