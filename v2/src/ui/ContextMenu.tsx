"use client";

/**
 * ContextMenu — kebab-trigger action menu ported from v1 ui/ContextMenu.jsx.
 * Data-driven items (icons, danger variant, descriptions, groups rendered
 * with separators), smart fixed positioning that flips to stay inside the
 * viewport (portal to <body>, so it escapes overflow containers), ARIA menu
 * pattern with full keyboard navigation. Closes on outside click, Escape and
 * scroll. Standalone from Menu.tsx, which stays the simple absolute-positioned
 * primitive — this one needs measurement-based fixed positioning.
 */
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

export interface ContextMenuItem {
  /** Stable identity; falls back to the label. */
  key?: string;
  label: string;
  /** Optional secondary line under the label. */
  description?: string;
  icon?: ReactNode;
  /** Keyboard-shortcut hint rendered at the end of the row (display only). */
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  /** Items with different groups are separated by a divider. */
  group?: string;
  onClick?: () => void;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  /** Fired for every activation, in addition to the item's own onClick. */
  onItemClick?: (item: ContextMenuItem) => void;
  /** Small uppercase heading at the top of the menu. */
  header?: string;
  /** Custom trigger content; defaults to a kebab (⋮) icon button. */
  trigger?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

interface MenuPosition {
  top: number;
  left: number;
}

const VIEWPORT_PAD = 8;
const TRIGGER_GAP = 4;

export function ContextMenu({
  items,
  onItemClick,
  header,
  trigger,
  ariaLabel,
  disabled = false,
  className = "",
}: ContextMenuProps) {
  const t = useTranslations("pickers");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuLabel = ariaLabel ?? t("moreActions");

  // Measure the rendered (hidden) menu, then place it: below the trigger and
  // end-aligned by preference, flipping when the viewport runs out of room.
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;
    if (!triggerEl || !menuEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const menuW = menuEl.offsetWidth;
    const menuH = menuEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rtl = document.documentElement.dir === "rtl";

    const spaceBelow = vh - rect.bottom;
    const openUp = spaceBelow < menuH + TRIGGER_GAP && rect.top > spaceBelow;
    let top = openUp ? rect.top - menuH - TRIGGER_GAP : rect.bottom + TRIGGER_GAP;

    // End-aligned with the trigger in the current direction.
    let left = rtl ? rect.left : rect.right - menuW;
    if (left < VIEWPORT_PAD) left = rect.left;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - menuW - VIEWPORT_PAD));
    top = Math.max(VIEWPORT_PAD, Math.min(top, vh - menuH - VIEWPORT_PAD));

    setPosition({ top, left });
  }, [open]);

  // Focus the first enabled item once the menu is placed.
  useEffect(() => {
    if (!open || !position) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
  }, [open, position]);

  // Close on outside click, Escape and scroll (scrolling inside the menu is fine).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: Event) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onScroll = (e: Event) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  const activate = (item: ContextMenuItem) => {
    setOpen(false);
    triggerRef.current?.focus();
    onItemClick?.(item);
    item.onClick?.();
  };

  // Roving focus over enabled menu items.
  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)',
      ) ?? [],
    );
    if (nodes.length === 0) return;
    const current = nodes.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(current + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(current - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      nodes[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      nodes[nodes.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  // Group items in insertion order; separators go between groups.
  const groups: ContextMenuItem[][] = [];
  const groupIndex = new Map<string, number>();
  for (const item of items) {
    if (item.hidden) continue;
    const g = item.group ?? "default";
    let idx = groupIndex.get(g);
    if (idx == null) {
      idx = groups.length;
      groupIndex.set(g, idx);
      groups.push([]);
    }
    groups[idx].push(item);
  }

  return (
    <div className={`context-menu ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="context-menu__trigger"
        aria-label={menuLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onContextMenu={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      >
        {trigger ?? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        )}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={`context-menu__panel ${position ? "is-positioned" : ""}`}
            role="menu"
            aria-label={menuLabel}
            style={position ? { top: position.top, left: position.left } : undefined}
            onKeyDown={onMenuKeyDown}
          >
            {header && <div className="context-menu__header">{header}</div>}
            {groups.map((group, gi) => (
              <div key={gi} role="group">
                {gi > 0 && <div className="context-menu__separator" role="separator" />}
                {group.map((item) => (
                  <button
                    key={item.key ?? item.label}
                    type="button"
                    role="menuitem"
                    className={`context-menu__item ${item.danger ? "is-danger" : ""}`}
                    disabled={item.disabled}
                    onClick={() => activate(item)}
                  >
                    {item.icon && (
                      <span className="context-menu__icon" aria-hidden>
                        {item.icon}
                      </span>
                    )}
                    <span className="context-menu__body">
                      <span className="context-menu__label">{item.label}</span>
                      {item.description && (
                        <span className="context-menu__desc">{item.description}</span>
                      )}
                    </span>
                    {item.shortcut && (
                      <span className="context-menu__shortcut" aria-hidden>
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
