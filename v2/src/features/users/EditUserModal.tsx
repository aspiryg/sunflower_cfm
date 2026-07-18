"use client";

/** Admin "edit user" flow: identity, organization, role, and activation state.
 * Role is limited to assignable roles; changing it prompts for an audit reason.
 * Sends only changed fields via PATCH /api/users/[id]. */
import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Modal } from "@/ui/Modal";
import { useToast } from "@/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { assignableRoles, type Role } from "@/lib/rbac";
import { TextField, SelectField, TextAreaField } from "@/ui/form";

export interface EditableUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organization?: string | null;
  role: Role;
  isActive: boolean;
}

export function EditUserModal({
  user,
  onClose,
}: {
  user: EditableUser | null;
  onClose: () => void;
}) {
  const t = useTranslations("users");
  const tMenu = useTranslations("userMenu");
  const qc = useQueryClient();
  const toast = useToast();
  const tToast = useTranslations("toasts");
  const { user: me } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role | "">("");

  useEffect(() => {
    setRole(user?.role ?? "");
    setError(null);
  }, [user]);

  const roles = me ? assignableRoles(me) : [];
  const roleChanged = !!user && role !== "" && role !== user.role;

  const saveM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/api/users/${user!.id}`, { method: "PATCH", body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(tToast("userUpdated"));
      onClose();
    },
    onError: (e) =>
      setError((e as unknown as ApiError)?.message ?? tToast("error")),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    const f = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      firstName: String(f.get("firstName")),
      lastName: String(f.get("lastName")),
      email: String(f.get("email")),
      organization: String(f.get("organization")) || null,
    };
    if (roleChanged) {
      body.role = role;
      const reason = String(f.get("reason")).trim();
      body.reason = reason || t("roleChangeDefaultReason");
    }
    saveM.mutate(body);
  }

  return (
    <Modal open={!!user} title={t("editUser")} onClose={onClose}>
      {user && (
        <>
          {error && (
            <div className="auth-card__error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field-row">
              <TextField
                id="eu-firstName"
                name="firstName"
                label={t("firstName")}
                defaultValue={user.firstName}
                required
              />
              <TextField
                id="eu-lastName"
                name="lastName"
                label={t("lastName")}
                defaultValue={user.lastName}
                required
              />
            </div>
            <TextField
              id="eu-email"
              name="email"
              type="email"
              label={t("email")}
              defaultValue={user.email}
              required
              dir="ltr"
            />
            <TextField
              id="eu-organization"
              name="organization"
              label={t("organization")}
              defaultValue={user.organization ?? ""}
            />
            <SelectField
              id="eu-role"
              name="role"
              label={t("role")}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={roles.length === 0}
              options={roles.map((r) => ({ value: r, label: tMenu(`roles.${r}`) }))}
            />
            {roleChanged && (
              <TextAreaField
                id="eu-reason"
                name="reason"
                label={t("roleChangeReason")}
                hint={t("roleChangeReasonHint")}
                rows={2}
              />
            )}
            <div className="modal__actions">
              <button type="button" className="btn btn-outline" onClick={onClose}>
                {t("cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={saveM.isPending}>
                {t("save")}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
