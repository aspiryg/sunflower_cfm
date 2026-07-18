"use client";

/**
 * Reusable dropdown-menu primitive (RTL-safe, outside-click + Escape close).
 * Used by the account menu, table row actions, and any future context menus.
 */
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export function Menu({
  trigger,
  ariaLabel,
  children,
  className = "",
}: {
  /** Render the trigger button's content. */
  trigger: ReactNode;
  ariaLabel: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`menu ${className}`} ref={wrapRef}>
      <button
        type="button"
        className="menu__trigger"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div className="menu__panel" role="menu" aria-label={ariaLabel}>
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  onClick,
  children,
  danger = false,
}: {
  onClick?: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`menu__item ${danger ? "is-danger" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="menu__separator" role="separator" />;
}
