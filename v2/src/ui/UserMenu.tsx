"use client";

/** Account menu: avatar trigger → identity header + profile/settings/sign-out. */
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useLogout } from "@/features/auth/AuthContext";
import { hasRole } from "@/lib/rbac";
import { Avatar } from "./Avatar";
import { Menu, MenuItem, MenuSeparator } from "./Menu";

export function UserMenu() {
  const t = useTranslations("userMenu");
  const tShell = useTranslations("shell");
  const { user } = useAuth();
  const router = useRouter();
  const logout = useLogout();

  if (!user) return null;

  async function signOut() {
    try {
      await logout.mutateAsync();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <Menu
      ariaLabel={t("label")}
      trigger={<Avatar firstName={user.firstName} lastName={user.lastName} />}
    >
      {(close) => (
        <>
          <div className="menu__header">
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span className="menu__sub" dir="ltr">
              {user.email}
            </span>
            <span className="menu__sub">{t(`roles.${user.role}`)}</span>
          </div>
          <MenuSeparator />
          <MenuItem
            onClick={() => {
              close();
              router.push("/profile");
            }}
          >
            {t("profile")}
          </MenuItem>
          {hasRole(user, "manager") && (
            <MenuItem
              onClick={() => {
                close();
                router.push("/settings");
              }}
            >
              {tShell("settings")}
            </MenuItem>
          )}
          <MenuSeparator />
          <MenuItem danger onClick={signOut}>
            {tShell("signOut")}
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
