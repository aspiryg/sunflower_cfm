"use client";

/**
 * DatePicker — text input + calendar popup, ported from v1 ui/DatePicker.jsx.
 * Locale-aware month/weekday names (next-intl locale + Intl.DateTimeFormat),
 * month/year quick-jump dropdown, min/max bounds, today shortcut, clear,
 * manual typed entry (yyyy-mm-dd), grid keyboard navigation, outside-click
 * and Escape close. RTL-safe via logical properties; value is ISO yyyy-mm-dd.
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
import { useLocale, useTranslations } from "next-intl";

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse an ISO yyyy-mm-dd string into a local Date (null if invalid). */
function parseISO(s: string | null | undefined): Date | null {
  if (!s || !ISO_RE.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // Reject overflow like 2026-02-31 (Date would roll it into March).
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function Chevron({ dir }: { dir: "start" | "end" | "down" }) {
  const d =
    dir === "down" ? "M6 9l6 6 6-6" : dir === "start" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg
      className={dir === "down" ? "" : "picker-flip"}
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
      <path d={d} />
    </svg>
  );
}

export interface DatePickerProps {
  /** Selected date as ISO yyyy-mm-dd, or null when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Inclusive bounds, ISO yyyy-mm-dd. */
  min?: string;
  max?: string;
  label?: ReactNode;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Explicit input id (e.g. for e2e selectors). */
  id?: string;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
  placeholder?: string;
  disabled?: boolean;
  /** Show the "Today" shortcut in the footer (default true). */
  showToday?: boolean;
  /** Show the "Clear" action in the footer (default true). */
  showClear?: boolean;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  label,
  labelSuffix,
  hint,
  error,
  id: explicitId,
  fieldStyle,
  placeholder,
  disabled = false,
  showToday = true,
  showClear = true,
}: DatePickerProps) {
  const locale = useLocale();
  const t = useTranslations("pickers");
  const autoId = useId();
  const inputId = explicitId ?? autoId;
  const isRTL = locale === "ar";

  const [open, setOpen] = useState(false);
  const [myOpen, setMyOpen] = useState(false); // month/year quick-jump dropdown
  const [text, setText] = useState(value ?? "");
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    startOfMonth(parseISO(value) ?? new Date()),
  );
  const [activeDate, setActiveDate] = useState<Date>(() => parseISO(value) ?? new Date());

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const gridFocusPending = useRef(false);

  const minDate = useMemo(() => parseISO(min), [min]);
  const maxDate = useMemo(() => parseISO(max), [max]);
  const selectedDate = useMemo(() => parseISO(value), [value]);

  // Locale-aware month / weekday names (2024-06-02 is a Sunday).
  const monthNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, m) => fmt.format(new Date(2024, m, 1)));
  }, [locale]);
  const weekdayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, d) => fmt.format(new Date(2024, 5, 2 + d)));
  }, [locale]);
  const num = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);

  // Mirror external value into the text input.
  useEffect(() => {
    setText(value ?? "");
  }, [value]);

  const isDisabledDate = (d: Date): boolean =>
    (minDate != null && d < minDate) || (maxDate != null && d > maxDate);

  // 42 cells (6 weeks), Sunday-first like v1.
  const days = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    const today = new Date();
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return {
        date,
        iso: toISO(date),
        isOtherMonth: date.getMonth() !== viewMonth.getMonth(),
        isToday: sameDay(date, today),
        isSelected: selectedDate != null && sameDay(date, selectedDate),
        isDisabled:
          (minDate != null && date < minDate) || (maxDate != null && date > maxDate),
      };
    });
  }, [viewMonth, selectedDate, minDate, maxDate]);

  // Outside click closes calendar and month/year dropdown.
  useEffect(() => {
    if (!open && !myOpen) return;
    const onDown = (e: Event) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setMyOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open, myOpen]);

  // Escape closes the innermost open layer.
  useEffect(() => {
    if (!open && !myOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (myOpen) {
        setMyOpen(false);
      } else {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, myOpen]);

  // After arrow-key navigation, move focus to the newly active day button.
  useEffect(() => {
    if (!gridFocusPending.current) return;
    gridFocusPending.current = false;
    document.getElementById(`${autoId}-day-${toISO(activeDate)}`)?.focus();
  }, [activeDate, autoId]);

  const openCalendar = () => {
    if (disabled) return;
    const base = selectedDate ?? new Date();
    setViewMonth(startOfMonth(base));
    setActiveDate(base);
    setOpen(true);
  };

  const pick = (d: Date) => {
    if (isDisabledDate(d)) return;
    onChange(toISO(d));
    setOpen(false);
    setMyOpen(false);
    inputRef.current?.focus();
  };

  const clear = () => {
    onChange(null);
    setText("");
    setOpen(false);
    setMyOpen(false);
    inputRef.current?.focus();
  };

  // Manual typing: commit as soon as the text is a full valid in-range date.
  const onTextChange = (raw: string) => {
    setText(raw);
    if (!raw.trim()) {
      onChange(null);
      return;
    }
    const d = parseISO(raw.trim());
    if (d && !isDisabledDate(d)) {
      onChange(toISO(d));
      setViewMonth(startOfMonth(d));
      setActiveDate(d);
    }
  };

  // On blur, snap the text back to the last valid value.
  const onBlur = () => {
    if (!text.trim()) {
      if (value != null) onChange(null);
      return;
    }
    const d = parseISO(text.trim());
    if (!d || isDisabledDate(d)) setText(value ?? "");
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openCalendar();
      } else {
        // Hand focus to the grid for arrow-key day navigation.
        document.getElementById(`${autoId}-day-${toISO(activeDate)}`)?.focus();
      }
    }
  };

  // Arrow-key navigation over the day grid (roving tabindex).
  const onGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = (deltaDays: number) => {
      e.preventDefault();
      const next = new Date(activeDate);
      next.setDate(next.getDate() + deltaDays);
      gridFocusPending.current = true;
      setActiveDate(next);
      if (next.getMonth() !== viewMonth.getMonth() || next.getFullYear() !== viewMonth.getFullYear()) {
        setViewMonth(startOfMonth(next));
      }
    };
    switch (e.key) {
      case "ArrowLeft":
        move(isRTL ? 1 : -1);
        break;
      case "ArrowRight":
        move(isRTL ? -1 : 1);
        break;
      case "ArrowUp":
        move(-7);
        break;
      case "ArrowDown":
        move(7);
        break;
      case "PageUp":
        move(-new Date(activeDate.getFullYear(), activeDate.getMonth(), 0).getDate());
        break;
      case "PageDown":
        move(new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate());
        break;
      case "Home":
        move(1 - activeDate.getDate());
        break;
      case "End":
        move(
          new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate() -
            activeDate.getDate(),
        );
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(activeDate);
        break;
    }
  };

  const shiftMonth = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  const shiftYear = (delta: number) =>
    setViewMonth(new Date(viewMonth.getFullYear() + delta, viewMonth.getMonth(), 1));

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = (
    <div className="datepicker" ref={wrapRef}>
      <div className="datepicker__control">
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          className={`datepicker__input ${error ? "is-invalid" : ""}`}
          value={text}
          placeholder={placeholder ?? t("dateFormat")}
          disabled={disabled}
          autoComplete="off"
          inputMode="numeric"
          dir="ltr"
          role="combobox"
          aria-invalid={!!error}
          aria-describedby={describedBy}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? `${autoId}-dialog` : undefined}
          onClick={openCalendar}
          onChange={(e) => onTextChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onInputKeyDown}
        />
        <button
          type="button"
          className="datepicker__icon"
          aria-label={t("openCalendar")}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openCalendar())}
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <div
          className="datepicker__pop"
          id={`${autoId}-dialog`}
          role="dialog"
          aria-modal="false"
          aria-label={t("openCalendar")}
        >
          {/* Header: month navigation + month/year quick-jump */}
          <div className="datepicker__head">
            <button
              type="button"
              className="datepicker__nav"
              aria-label={t("previousMonth")}
              onClick={() => shiftMonth(-1)}
            >
              <Chevron dir="start" />
            </button>

            <div className="datepicker__title">
              <button
                type="button"
                className="datepicker__my-btn"
                aria-label={t("chooseMonthYear")}
                aria-expanded={myOpen}
                onClick={() => setMyOpen((v) => !v)}
              >
                {monthNames[viewMonth.getMonth()]} {num.format(viewMonth.getFullYear())}
                <Chevron dir="down" />
              </button>

              {myOpen && (
                <div className="datepicker__my-pop">
                  <div className="datepicker__year-row">
                    <button
                      type="button"
                      className="datepicker__nav"
                      aria-label={t("previousYear")}
                      onClick={() => shiftYear(-1)}
                    >
                      <Chevron dir="start" />
                    </button>
                    <span className="datepicker__year">{num.format(viewMonth.getFullYear())}</span>
                    <button
                      type="button"
                      className="datepicker__nav"
                      aria-label={t("nextYear")}
                      onClick={() => shiftYear(1)}
                    >
                      <Chevron dir="end" />
                    </button>
                  </div>
                  <div className="datepicker__months">
                    {monthNames.map((name, i) => (
                      <button
                        key={name}
                        type="button"
                        className={`datepicker__month ${i === viewMonth.getMonth() ? "is-selected" : ""}`}
                        onClick={() => {
                          setViewMonth(new Date(viewMonth.getFullYear(), i, 1));
                          setMyOpen(false);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              className="datepicker__nav"
              aria-label={t("nextMonth")}
              onClick={() => shiftMonth(1)}
            >
              <Chevron dir="end" />
            </button>
          </div>

          {/* Weekday header + day grid */}
          <div className="datepicker__grid">
            <div className="datepicker__weekdays" aria-hidden>
              {weekdayNames.map((name) => (
                <span key={name} className="datepicker__weekday">
                  {name}
                </span>
              ))}
            </div>
            <div className="datepicker__days" role="grid" onKeyDown={onGridKeyDown}>
              {days.map((d) => (
                <button
                  key={d.iso}
                  id={`${autoId}-day-${d.iso}`}
                  type="button"
                  role="gridcell"
                  className={[
                    "datepicker__day",
                    d.isSelected ? "is-selected" : "",
                    d.isToday ? "is-today" : "",
                    d.isOtherMonth ? "is-other" : "",
                    sameDay(d.date, activeDate) ? "is-active" : "",
                  ].join(" ")}
                  disabled={d.isDisabled}
                  tabIndex={sameDay(d.date, activeDate) ? 0 : -1}
                  aria-selected={d.isSelected}
                  aria-label={d.date.toLocaleDateString(locale)}
                  onClick={() => pick(d.date)}
                >
                  {num.format(d.date.getDate())}
                </button>
              ))}
            </div>
          </div>

          {/* Footer: today shortcut + clear */}
          {(showToday || showClear) && (
            <div className="datepicker__foot">
              {showToday ? (
                <button type="button" className="datepicker__quick" onClick={() => pick(new Date())}>
                  {t("today")}
                </button>
              ) : (
                <span />
              )}
              {showClear && (value != null || text) && (
                <button type="button" className="datepicker__clear" onClick={clear}>
                  {t("clear")}
                </button>
              )}
            </div>
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
