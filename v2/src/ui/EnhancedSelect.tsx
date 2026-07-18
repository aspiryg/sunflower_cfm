"use client";

/**
 * EnhancedSelect — advanced dropdown ported from v1 ui/EnhancedSelect.jsx and
 * upgraded to the full combobox pattern: searchable option list, clearable,
 * option descriptions, disabled options, multi-select with chips + checkmarks,
 * keyboard navigation (arrows / Home / End / Enter / Escape / typeahead) and
 * ARIA wiring. Positioning is absolute within the wrapper (no portal), like
 * SearchableSelect. RTL-safe via logical properties.
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

export interface EnhancedSelectOption {
  value: string | number;
  label: string;
  /** Optional secondary line rendered under the label. */
  description?: string;
  disabled?: boolean;
}

interface CommonProps {
  options: EnhancedSelectOption[];
  placeholder?: string;
  /** Show a filter input inside the dropdown. */
  searchable?: boolean;
  /** Show an × affordance that resets the selection. */
  clearable?: boolean;
  disabled?: boolean;
  /** Explicit trigger id (e.g. for e2e selectors); keeps the label associated. */
  id?: string;
  label?: ReactNode;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
}

export type EnhancedSelectProps =
  | (CommonProps & {
      multiple?: false;
      value: string | number | null;
      onChange: (value: string | number | null) => void;
    })
  | (CommonProps & {
      multiple: true;
      value: (string | number)[];
      onChange: (value: (string | number)[]) => void;
    });

export function EnhancedSelect(props: EnhancedSelectProps) {
  const {
    options,
    placeholder,
    searchable = false,
    clearable = false,
    disabled = false,
    id: explicitId,
    label,
    labelSuffix,
    hint,
    error,
    fieldStyle,
  } = props;
  const t = useTranslations("pickers");
  const autoId = useId();
  const triggerId = explicitId ?? autoId;
  const listboxId = `${autoId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ buffer: "", timer: 0 });

  const selectedValues: (string | number)[] = props.multiple
    ? props.value
    : props.value == null
      ? []
      : [props.value];
  const isSelected = (v: string | number) => selectedValues.includes(v);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q),
    );
  }, [options, query, searchable]);

  const optId = (i: number) => `${listboxId}-opt-${i}`;

  const firstEnabled = (from: number, dir: 1 | -1): number => {
    for (let i = from; i >= 0 && i < filtered.length; i += dir) {
      if (!filtered[i].disabled) return i;
    }
    return -1;
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    // Highlight the first selected option, else the first enabled one.
    const sel = filtered.findIndex((o) => !o.disabled && isSelected(o.value));
    setActiveIndex(sel >= 0 ? sel : firstEnabled(0, 1));
  };

  const closeList = (refocus = true) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    if (refocus) triggerRef.current?.focus();
  };

  const toggleOption = (opt: EnhancedSelectOption) => {
    if (opt.disabled) return;
    if (props.multiple) {
      props.onChange(
        isSelected(opt.value)
          ? props.value.filter((v) => v !== opt.value)
          : [...props.value, opt.value],
      );
      // Multi-select stays open for further picks.
    } else {
      props.onChange(opt.value);
      closeList();
    }
  };

  const clearAll = () => {
    if (props.multiple) props.onChange([]);
    else props.onChange(null);
  };

  // Focus the filter input when a searchable list opens.
  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    document.getElementById(optId(activeIndex))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  // Clamp the highlight when the filtered list shrinks.
  useEffect(() => {
    if (open) {
      setActiveIndex((i) =>
        filtered.length ? Math.max(0, Math.min(i, filtered.length - 1)) : -1,
      );
    }
  }, [open, filtered.length]);

  // Outside-click close (same pattern as Menu.tsx / SearchableSelect).
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) closeList(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Single-character typeahead: jump to the next option starting with the buffer.
  const runTypeahead = (ch: string) => {
    const ta = typeahead.current;
    window.clearTimeout(ta.timer);
    ta.buffer += ch.toLowerCase();
    ta.timer = window.setTimeout(() => (ta.buffer = ""), 500);
    const start = activeIndex + (ta.buffer.length === 1 ? 1 : 0);
    const n = filtered.length;
    for (let step = 0; step < n; step++) {
      const i = (start + step + n) % n;
      if (!filtered[i].disabled && filtered[i].label.toLowerCase().startsWith(ta.buffer)) {
        if (!open) openList();
        setActiveIndex(i);
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>, fromSearch: boolean) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openList();
        else setActiveIndex((i) => {
          const next = firstEnabled(i + 1, 1);
          return next >= 0 ? next : i;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => {
          const prev = firstEnabled(i - 1, -1);
          return prev >= 0 ? prev : i;
        });
        break;
      case "Home":
        if (fromSearch) return; // let the caret move inside the input
        e.preventDefault();
        setActiveIndex(firstEnabled(0, 1));
        break;
      case "End":
        if (fromSearch) return;
        e.preventDefault();
        setActiveIndex(firstEnabled(filtered.length - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (open && filtered[activeIndex]) toggleOption(filtered[activeIndex]);
        else if (!open) openList();
        break;
      case " ":
        if (fromSearch) return; // typing a space in the filter
        e.preventDefault();
        if (open && filtered[activeIndex]) toggleOption(filtered[activeIndex]);
        else if (!open) openList();
        break;
      case "Escape":
        if (open) {
          e.stopPropagation();
          closeList();
        }
        break;
      case "Tab":
        closeList(false);
        break;
      default:
        if (!fromSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          runTypeahead(e.key);
        }
    }
  };

  const selectedOptions = options.filter((o) => isSelected(o.value));
  const hasSelection = selectedOptions.length > 0;
  const singleLabel = !props.multiple && hasSelection ? selectedOptions[0].label : null;

  const hintId = hint ? `${triggerId}-hint` : undefined;
  const errorId = error ? `${triggerId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = (
    <div className="enh-select" ref={wrapRef}>
      <div
        id={triggerId}
        ref={triggerRef}
        className={[
          "enh-select__trigger",
          open ? "is-open" : "",
          disabled ? "is-disabled" : "",
          error ? "is-invalid" : "",
        ].join(" ")}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeIndex >= 0 ? optId(activeIndex) : undefined}
        aria-disabled={disabled || undefined}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        tabIndex={disabled ? -1 : 0}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={(e) => onKeyDown(e, false)}
      >
        <div className="enh-select__value">
          {props.multiple && hasSelection ? (
            selectedOptions.map((o) => (
              <span key={o.value} className="enh-select__chip">
                {o.label}
                {!disabled && (
                  <button
                    type="button"
                    className="enh-select__chip-x"
                    aria-label={t("removeItem", { label: o.label })}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(o);
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          ) : singleLabel != null ? (
            <span className="enh-select__single">{singleLabel}</span>
          ) : (
            <span className="enh-select__placeholder">{placeholder ?? t("select")}</span>
          )}
        </div>
        {clearable && hasSelection && !disabled && (
          <button
            type="button"
            className="enh-select__clear"
            aria-label={t("clearSelection")}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              clearAll();
            }}
          >
            ×
          </button>
        )}
        <svg
          className={`enh-select__chevron ${open ? "is-open" : ""}`}
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
      </div>

      {open && !disabled && (
        <div className="enh-select__panel">
          {searchable && (
            <div className="enh-select__search">
              <input
                ref={searchRef}
                type="text"
                dir="auto"
                placeholder={t("search")}
                value={query}
                aria-controls={listboxId}
                aria-activedescendant={activeIndex >= 0 ? optId(activeIndex) : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                onKeyDown={(e) => onKeyDown(e, true)}
              />
            </div>
          )}
          <div
            className="enh-select__list"
            id={listboxId}
            role="listbox"
            aria-multiselectable={props.multiple || undefined}
          >
            {filtered.length === 0 ? (
              <div className="enh-select__empty">{t("noResults")}</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt.value}
                  id={optId(i)}
                  type="button"
                  role="option"
                  aria-selected={isSelected(opt.value)}
                  disabled={opt.disabled}
                  className={[
                    "enh-select__option",
                    i === activeIndex ? "is-active" : "",
                    isSelected(opt.value) ? "is-selected" : "",
                  ].join(" ")}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                  // mousedown fires before the outside-click handler; keep focus.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleOption(opt)}
                >
                  <span className="enh-select__opt-body">
                    <span className="enh-select__opt-label">{opt.label}</span>
                    {opt.description && (
                      <span className="enh-select__opt-desc">{opt.description}</span>
                    )}
                  </span>
                  {isSelected(opt.value) && (
                    <svg
                      className="enh-select__check"
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
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (label == null && hint == null && error == null) return control;
  return (
    <div className="field" style={fieldStyle}>
      {label != null && (
        <label htmlFor={triggerId}>
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
