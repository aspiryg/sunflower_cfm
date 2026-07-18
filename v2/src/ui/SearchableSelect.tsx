"use client";

/**
 * SearchableSelect — a combobox: a text input that filters the provided
 * options list, with a dropdown of matches, keyboard support and a
 * clear-selection affordance. RTL-safe (logical properties in CSS).
 */
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useId,
} from "react";
import { useTranslations } from "next-intl";

export interface SearchableSelectOption {
  value: number;
  label: string;
}

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  id?: string;
  options: SearchableSelectOption[];
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Reset the highlighted row whenever the match list changes or reopens.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  // Outside-click + Escape close (same pattern as Menu.tsx).
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (opt: SearchableSelectOption) => {
    onChange(opt.value);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && filtered[activeIndex]) {
        e.preventDefault();
        pick(filtered[activeIndex]);
      }
    }
  };

  return (
    <div className="searchable-select" ref={wrapRef}>
      <input
        id={id}
        ref={inputRef}
        type="text"
        className="searchable-select__input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        dir="auto"
        disabled={disabled}
        placeholder={placeholder}
        value={open ? query : (selected?.label ?? "")}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {selected && !disabled && (
        <button
          type="button"
          className="searchable-select__clear"
          aria-label={t("clear")}
          onClick={() => {
            onChange(null);
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          ×
        </button>
      )}
      {open && !disabled && (
        <div className="searchable-select__panel" id={listboxId} role="listbox">
          {filtered.length === 0 ? (
            <div className="searchable-select__empty">{t("noResults")}</div>
          ) : (
            filtered.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`searchable-select__option ${
                  i === activeIndex ? "is-active" : ""
                } ${opt.value === value ? "is-selected" : ""}`}
                onMouseEnter={() => setActiveIndex(i)}
                // mousedown fires before the outside-click handler; prevent
                // the input from losing focus, then pick on click.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(opt)}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
