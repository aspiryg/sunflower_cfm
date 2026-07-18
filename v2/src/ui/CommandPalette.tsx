"use client";

/**
 * Global ⌘K / Ctrl+K command palette — a v2 feature with no v1 counterpart.
 * Grouped results (Actions / Navigation / Cases), fuzzy-ish filtering, live
 * case search, and recently-viewed cases (localStorage) when the query is
 * empty. Self-contained: registers its own shortcut and owns open state; the
 * shell renders it once and supplies role-filtered nav targets and actions.
 * Keyboard-driven (↑/↓/Enter/Esc), RTL-safe, theme-aware.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/lib/api/client";

export interface CommandNavItem {
  href: string;
  label: string;
}

export interface CommandAction {
  id: string;
  label: string;
  /** Right-aligned hint (e.g. a keyboard shortcut or category). */
  hint?: string;
  /** Extra search terms beyond the label. */
  keywords?: string;
  icon?: string;
  run: () => void;
}

/** Open/close the palette from any UI trigger (e.g. the header search button). */
export function toggleCommandPalette() {
  window.dispatchEvent(new CustomEvent("cmdk:toggle"));
}

interface CaseHit {
  id: number;
  caseNumber: string;
  title: string;
}

const RECENT_KEY = "cmdk:recent-cases";
const RECENT_MAX = 6;

function loadRecent(): CaseHit[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as CaseHit[]) : [];
  } catch {
    return [];
  }
}
function pushRecent(hit: CaseHit) {
  try {
    const next = [hit, ...loadRecent().filter((h) => h.id !== hit.id)].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota/availability errors */
  }
}

/** Case-insensitive subsequence match — "cs" matches "Cases". */
function fuzzy(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i === n.length) return true;
  }
  return false;
}

interface Row {
  id: string;
  label: string;
  hint?: string;
  icon: string;
  onChoose: () => void;
}
interface Group {
  heading: string;
  rows: Row[];
}

export function CommandPalette({
  navItems,
  actions = [],
  newCaseHref,
  onNavigate,
}: {
  navItems: CommandNavItem[];
  actions?: CommandAction[];
  /** When set, a "Create a case" action is offered. */
  newCaseHref?: string;
  onNavigate: (href: string) => void;
}) {
  const t = useTranslations("command");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [hits, setHits] = useState<CaseHit[]>([]);
  const [recent, setRecent] = useState<CaseHit[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Global open shortcut (⌘K / Ctrl+K) and a custom event for UI triggers.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onToggle() {
      setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("cmdk:toggle", onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cmdk:toggle", onToggle);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Reset transient state whenever the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setHits([]);
      setActive(0);
      setRecent(loadRecent());
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Debounced case search.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await apiFetch<CaseHit[]>(
          `/api/cases?search=${encodeURIComponent(q)}&limit=8`,
        );
        setHits(res.data ?? []);
      } catch {
        setHits([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const chooseCase = useCallback(
    (hit: CaseHit) => {
      pushRecent(hit);
      close();
      onNavigate(`/cases/${hit.id}`);
    },
    [close, onNavigate],
  );

  // Build grouped rows from the current query.
  const groups = useMemo<Group[]>(() => {
    const q = query.trim();
    const out: Group[] = [];

    // Actions (incl. "create a case") — fuzzy on label + keywords.
    const actionRows: Row[] = [];
    if (newCaseHref) {
      actionRows.push({
        id: "act:new-case",
        label: t("newCase"),
        hint: t("action"),
        icon: "＋",
        onChoose: () => {
          close();
          onNavigate(newCaseHref);
        },
      });
    }
    for (const a of actions) {
      actionRows.push({
        id: `act:${a.id}`,
        label: a.label,
        hint: a.hint,
        icon: a.icon ?? "⚡",
        onChoose: () => {
          close();
          a.run();
        },
      });
    }
    const filteredActions = actionRows.filter(
      (r) => fuzzy(r.label, q) || (r.hint && fuzzy(r.hint, q)),
    );
    if (filteredActions.length) out.push({ heading: t("groupActions"), rows: filteredActions });

    // Navigation.
    const navRows: Row[] = navItems
      .filter((n) => fuzzy(n.label, q))
      .map((n) => ({
        id: `nav:${n.href}`,
        label: n.label,
        icon: "→",
        onChoose: () => {
          close();
          onNavigate(n.href);
        },
      }));
    if (navRows.length) out.push({ heading: t("groupNavigation"), rows: navRows });

    // Cases: live search results, or recents when the query is empty.
    if (q.length >= 2) {
      const caseRows: Row[] = hits.map((c) => ({
        id: `case:${c.id}`,
        label: c.title,
        hint: c.caseNumber,
        icon: "◎",
        onChoose: () => chooseCase(c),
      }));
      if (caseRows.length) out.push({ heading: t("groupCases"), rows: caseRows });
    } else if (recent.length) {
      const recentRows: Row[] = recent.map((c) => ({
        id: `recent:${c.id}`,
        label: c.title,
        hint: c.caseNumber,
        icon: "🕘",
        onChoose: () => chooseCase(c),
      }));
      out.push({ heading: t("groupRecent"), rows: recentRows });
    }

    return out;
  }, [query, actions, navItems, newCaseHref, hits, recent, t, close, onNavigate, chooseCase]);

  // Flatten for keyboard navigation.
  const flat = useMemo(() => groups.flatMap((g) => g.rows), [groups]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, flat.length - 1)));
  }, [flat.length]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      flat[active]?.onChoose();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  // Keep the active row scrolled into view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!mounted || !open) return null;

  let idx = -1; // running flat index for aria/active mapping
  return createPortal(
    <div className="cmdk__backdrop" onMouseDown={close} role="presentation">
      <div
        className="cmdk"
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cmdk__search">
          <span className="cmdk__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            ref={inputRef}
            className="cmdk__input"
            type="text"
            placeholder={t("placeholder")}
            value={query}
            dir="auto"
            role="combobox"
            aria-expanded="true"
            aria-controls="cmdk-list"
            aria-activedescendant={flat[active]?.id}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
          />
          <kbd className="cmdk__esc">Esc</kbd>
        </div>

        <div className="cmdk__list" id="cmdk-list" role="listbox" ref={listRef}>
          {flat.length === 0 ? (
            <p className="cmdk__empty">
              {searching
                ? t("searching")
                : query.trim().length >= 2
                  ? t("noResults")
                  : t("hint")}
            </p>
          ) : (
            groups.map((g) => (
              <div key={g.heading} className="cmdk__group">
                <div className="cmdk__group-head">{g.heading}</div>
                {g.rows.map((r) => {
                  idx++;
                  const i = idx;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      id={r.id}
                      data-index={i}
                      role="option"
                      aria-selected={i === active}
                      className={`cmdk__item ${i === active ? "is-active" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={r.onChoose}
                    >
                      <span className="cmdk__item-icon" aria-hidden>
                        {r.icon}
                      </span>
                      <span className="cmdk__item-label" dir="auto">
                        {r.label}
                      </span>
                      {r.hint && (
                        <span className="cmdk__item-hint" dir="ltr">
                          {r.hint}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="cmdk__foot">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t("navigate")}
          </span>
          <span>
            <kbd>↵</kbd> {t("open")}
          </span>
          <span>
            <kbd>esc</kbd> {t("close")}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
