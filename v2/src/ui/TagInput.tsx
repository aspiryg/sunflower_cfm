"use client";

/**
 * TagInput — chip/tag editor (new in v2; v1 stored tags as a comma string).
 * Type + Enter or comma adds a chip, Backspace on an empty input removes the
 * last one, × removes a specific chip. Pasted comma-separated text is split
 * into chips; duplicates are rejected case-insensitively. RTL-safe.
 */
import {
  useState,
  useRef,
  useId,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";

export interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  /** Explicit input id (e.g. for e2e selectors). */
  id?: string;
  label?: ReactNode;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({
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
}: TagInputProps) {
  const t = useTranslations("pickers");
  const autoId = useId();
  const inputId = explicitId ?? autoId;
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /** Add tags from raw text (splits on commas), deduped case-insensitively. */
  const commit = (raw: string) => {
    const candidates = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (candidates.length === 0) return;
    const next = [...value];
    for (const tag of candidates) {
      if (!next.some((v) => v.toLowerCase() === tag.toLowerCase())) next.push(tag);
    }
    if (next.length !== value.length) onChange(next);
    setText("");
  };

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (text.trim()) commit(text);
      else setText("");
    } else if (e.key === "Backspace" && text === "" && value.length > 0) {
      e.preventDefault();
      removeAt(value.length - 1);
    }
  };

  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = (
    // Click anywhere in the box focuses the inner text input.
    <div
      className={`tag-input ${disabled ? "is-disabled" : ""} ${error ? "is-invalid" : ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <span key={tag} className="tag-input__chip" dir="auto">
          {tag}
          {!disabled && (
            <button
              type="button"
              className="tag-input__chip-x"
              aria-label={t("removeTag", { tag })}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
            >
              ×
            </button>
          )}
        </span>
      ))}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        className="tag-input__input"
        dir="auto"
        autoComplete="off"
        disabled={disabled}
        placeholder={value.length === 0 ? (placeholder ?? t("addTag")) : undefined}
        value={text}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(e) => {
          // A pasted "a, b, c" is committed straight to chips.
          if (e.target.value.includes(",")) commit(e.target.value);
          else setText(e.target.value);
        }}
        onBlur={() => text.trim() && commit(text)}
        onKeyDown={onKeyDown}
      />
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
