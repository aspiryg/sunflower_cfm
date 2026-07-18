"use client";

/**
 * Well-structured form-field components (owner directive: no rudimentary raw
 * inputs). Each field owns its label, hint, and error wiring with consistent
 * ids/aria attributes; layout is RTL-safe via the shared .field styles.
 * Compose screens from these — do not hand-roll <label>+<input> pairs.
 */
import { useId, type ReactNode, type CSSProperties, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

interface FieldChromeProps {
  label: ReactNode;
  /** Grey suffix next to the label, e.g. "(optional)". */
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Explicit control id (e.g. for e2e selectors); keeps the label associated. */
  id?: string;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}

function FieldChrome({ label, labelSuffix, hint, error, id: explicitId, fieldStyle, children }: FieldChromeProps) {
  const autoId = useId();
  const id = explicitId ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field" style={fieldStyle}>
      <label htmlFor={id}>
        {label}
        {labelSuffix != null && <span>{labelSuffix}</span>}
      </label>
      {children({ id, describedBy })}
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

type BaseProps = {
  label: ReactNode;
  labelSuffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Inline style for the outer .field wrapper (layout tweaks only). */
  fieldStyle?: CSSProperties;
};

export function TextField({
  label,
  labelSuffix,
  hint,
  error,
  fieldStyle,
  ...input
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldChrome label={label} labelSuffix={labelSuffix} hint={hint} error={error} id={input.id} fieldStyle={fieldStyle}>
      {({ id, describedBy }) => (
        <input id={input.id ?? id} aria-invalid={!!error} aria-describedby={describedBy} {...input} />
      )}
    </FieldChrome>
  );
}

export function TextAreaField({
  label,
  labelSuffix,
  hint,
  error,
  fieldStyle,
  ...textarea
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldChrome label={label} labelSuffix={labelSuffix} hint={hint} error={error} id={textarea.id} fieldStyle={fieldStyle}>
      {({ id, describedBy }) => (
        <textarea id={textarea.id ?? id} aria-invalid={!!error} aria-describedby={describedBy} {...textarea} />
      )}
    </FieldChrome>
  );
}

export interface SelectOption {
  value: string | number;
  label: ReactNode;
}

export function SelectField({
  label,
  labelSuffix,
  hint,
  error,
  fieldStyle,
  options,
  placeholder,
  ...select
}: BaseProps & { options: SelectOption[]; placeholder?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldChrome label={label} labelSuffix={labelSuffix} hint={hint} error={error} id={select.id} fieldStyle={fieldStyle}>
      {({ id, describedBy }) => (
        <select id={select.id ?? id} aria-invalid={!!error} aria-describedby={describedBy} {...select}>
          {placeholder != null && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldChrome>
  );
}

export function CheckboxField({
  label,
  hint,
  ...input
}: { label: ReactNode; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <label className="checkbox-field" htmlFor={input.id ?? id}>
      <input type="checkbox" id={input.id ?? id} {...input} />
      <span>
        {label}
        {hint && (
          <span className="muted" style={{ display: "block", fontSize: "1.2rem" }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
