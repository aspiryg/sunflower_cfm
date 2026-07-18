"use client";

/** Admin "add user" flow: role limited to assignable roles; shows the
 * generated temporary password exactly once. */
import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, type ApiError } from "@/lib/api/client";
import { Modal } from "@/ui/Modal";
import { useToast } from "@/ui/Toast";
import { useAuth } from "@/features/auth/AuthContext";
import { assignableRoles } from "@/lib/rbac";
import { TextField, SelectField } from "@/ui/form";

export function CreateUserModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("users");
  const tMenu = useTranslations("userMenu");
  const qc = useQueryClient();
  const toast = useToast();
  const tToast = useTranslations("toasts");
  const { user: me } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const roles = me ? assignableRoles(me) : [];

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ user: { id: number }; temporaryPassword?: string }>(
        "/api/users",
        { method: "POST", body },
      ),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success(tToast("userUpdated"));
      setTempPassword(res.data.temporaryPassword ?? null);
      if (!res.data.temporaryPassword) handleClose();
    },
    onError: (e) =>
      setError((e as unknown as ApiError)?.message ?? tToast("error")),
  });

  function handleClose() {
    setError(null);
    setTempPassword(null);
    onClose();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    createM.mutate({
      firstName: String(f.get("firstName")),
      lastName: String(f.get("lastName")),
      email: String(f.get("email")),
      role: String(f.get("role")),
    });
  }

  return (
    <Modal open={open} title={t("addUser")} onClose={handleClose}>
      {tempPassword ? (
        <>
          <p style={{ marginBottom: "1.2rem" }}>{t("tempPasswordNote")}</p>
          <p
            className="success__ref"
            dir="ltr"
            data-testid="temp-password"
            style={{ userSelect: "all" }}
          >
            {tempPassword}
          </p>
          <div className="modal__actions">
            <button type="button" className="btn btn-primary" onClick={handleClose}>
              {t("done")}
            </button>
          </div>
        </>
      ) : (
        <>
          {error && (
            <div className="auth-card__error" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="field-row">
              <TextField id="nu-firstName" name="firstName" label={t("firstName")} required />
              <TextField id="nu-lastName" name="lastName" label={t("lastName")} required />
            </div>
            <TextField id="nu-email" name="email" type="email" label={t("email")} required dir="ltr" />
            <SelectField
              id="nu-role"
              name="role"
              label={t("role")}
              defaultValue="user"
              required
              options={roles.map((r) => ({ value: r, label: tMenu(`roles.${r}`) }))}
            />
            <div className="modal__actions">
              <button type="button" className="btn btn-outline" onClick={handleClose}>
                {t("cancel")}
              </button>
              <button type="submit" className="btn btn-primary" disabled={createM.isPending}>
                {t("create")}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
