"use client";

/**
 * UserSelect — user picker ported from v1 ui/UserSelect.jsx: rich option rows
 * (avatar + name + email/role subtitle), search filtering, clear affordance,
 * keyboard navigation. The trigger IS the search input (combobox pattern, like
 * SearchableSelect) so the `id` prop lands on an always-present input — e2e
 * flows can target it directly. The caller supplies the users list.
 */
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/ui/Avatar";

export interface UserSelectUser {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role?: string;
  /** Optional image URL for the avatar. */
  profilePicture?: string | null;
}

export interface UserSelectProps {
  users: UserSelectUser[];
  value: number | null;
  onChange: (value: number | null) => void;
  /** Applied to the search input (needed for e2e selectors). */
  id?: string;
  label?: ReactNode;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
}

function displayName(u: UserSelectUser, fallback: string): string {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email || fallback;
}

export function UserSelect({
  users,
  value,
  onChange,
  id: explicitId,
  label,
  labelSuffix,
  hint,
  error,
  fieldStyle,
  placeholder,
  disabled = false,
  clearable = true,
}: UserSelectProps) {
  const t = useTranslations("pickers");
  const autoId = useId();
  const inputId = explicitId ?? autoId;
  const listboxId = `${autoId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = users.find((u) => u.id === value) ?? null;

  // Filter across name, email and role, like v1.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        displayName(u, "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role ?? "").toLowerCase().includes(q),
    );
  }, [users, query]);

  const optId = (i: number) => `${listboxId}-opt-${i}`;

  // Reset the highlighted row whenever the match list changes or reopens.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Keep the highlighted row scrolled into view.
  useEffect(() => {
    if (!open) return;
    document.getElementById(optId(activeIndex))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Outside-click + Escape close (same pattern as SearchableSelect).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (u: UserSelectUser) => {
    onChange(u.id);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home" && open && !query) {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End" && open && !query) {
      e.preventDefault();
      setActiveIndex(Math.max(filtered.length - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[activeIndex]) {
        e.preventDefault();
        pick(filtered[activeIndex]);
      }
    }
  };

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const showAvatar = selected != null && !open;

  const control = (
    <div className="user-select" ref={wrapRef}>
      {showAvatar && (
        <span className="user-select__avatar" aria-hidden>
          <Avatar
            firstName={selected.firstName ?? ""}
            lastName={selected.lastName ?? ""}
            src={selected.profilePicture}
            size={2.6}
          />
        </span>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        className={[
          "user-select__input",
          showAvatar ? "has-avatar" : "",
          error ? "is-invalid" : "",
        ].join(" ")}
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && filtered[activeIndex] ? optId(activeIndex) : undefined}
        aria-autocomplete="list"
        aria-invalid={!!error}
        aria-describedby={describedBy}
        autoComplete="off"
        dir="auto"
        disabled={disabled}
        placeholder={placeholder ?? t("selectUser")}
        value={open ? query : selected ? displayName(selected, t("unnamedUser")) : ""}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {clearable && selected && !disabled && (
        <button
          type="button"
          className="user-select__clear"
          aria-label={t("clearSelection")}
          onClick={() => {
            onChange(null);
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          ×
        </button>
      )}
      <svg
        className={`user-select__chevron ${open ? "is-open" : ""}`}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 9l6 6 6-6" />
      </svg>

      {open && !disabled && (
        <div className="user-select__panel" id={listboxId} role="listbox">
          {filtered.length === 0 ? (
            <div className="user-select__empty">{t("noUsers")}</div>
          ) : (
            filtered.map((u, i) => {
              const isSel = u.id === value;
              return (
                <button
                  key={u.id}
                  id={optId(i)}
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  className={[
                    "user-select__option",
                    i === activeIndex ? "is-active" : "",
                    isSel ? "is-selected" : "",
                  ].join(" ")}
                  onMouseEnter={() => setActiveIndex(i)}
                  // mousedown fires before the outside-click handler; keep focus.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(u)}
                >
                  <Avatar
                    firstName={u.firstName ?? ""}
                    lastName={u.lastName ?? ""}
                    src={u.profilePicture}
                    size={3.2}
                  />
                  <span className="user-select__info">
                    <span className="user-select__name">
                      {displayName(u, t("unnamedUser"))}
                    </span>
                    <span className="user-select__email" dir="ltr">
                      {u.email}
                    </span>
                  </span>
                  {u.role && <span className="user-select__role">{u.role}</span>}
                  {isSel && (
                    <svg
                      className="user-select__check"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );

  if (label == null && hint == null && error == null) return control;
  return (
    <div className="field" style={fieldStyle}>
      {label != null && (
        <label htmlFor={inputId}>
          {label}
          {labelSuffix != null && <span>{labelSuffix}</span>}
        </label>
      )}
      {control}
      {hint && (
        <span id={hintId} className="muted" style={{ fontSize: "1.2rem" }}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
