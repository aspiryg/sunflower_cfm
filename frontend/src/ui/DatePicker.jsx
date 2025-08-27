import { forwardRef, useState } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineCalendarDays, HiOutlineXMark } from "react-icons/hi2";

const DatePickerContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const DatePickerInput = styled.input`
  width: 100%;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-0);
  font-family: inherit;
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Size variations */
  ${(props) => {
    switch (props.$size) {
      case "small":
        return css`
          height: var(--input-height-sm);
          padding: 0 var(--spacing-8) 0 var(--spacing-3);
          font-size: var(--font-size-sm);
        `;
      case "large":
        return css`
          height: var(--input-height-lg);
          padding: 0 var(--spacing-12) 0 var(--spacing-5);
          font-size: var(--font-size-lg);
        `;
      default:
        return css`
          height: var(--input-height-md);
          padding: 0 var(--spacing-10) 0 var(--spacing-4);
          font-size: var(--font-size-base);
        `;
    }
  }}

  /* States */
  &:hover:not(:disabled) {
    border-color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    border-color: var(--color-grey-200);
    color: var(--color-grey-400);
    cursor: not-allowed;
  }

  /* Error state */
  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);
      background-color: var(--color-error-25);

      &:focus {
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  /* Success state */
  ${(props) =>
    props.$hasValue &&
    !props.$hasError &&
    css`
      border-color: var(--color-success-400);
    `}

  /* Custom date input styling */
  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: var(--spacing-3);
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }

  &::-webkit-datetime-edit {
    padding: 0;
  }

  /* Remove default browser styling */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox date input */
  &[type="date"] {
    -moz-appearance: textfield;
  }

  /* Placeholder color when no date selected */
  &:invalid {
    color: var(--color-grey-500);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  pointer-events: none;
  color: var(--color-grey-500);

  ${(props) =>
    props.$size === "small" &&
    css`
      right: var(--spacing-2);
    `}
  ${(props) =>
    props.$size === "large" &&
    css`
      right: var(--spacing-4);
    `}
`;

const CalendarIcon = styled(HiOutlineCalendarDays)`
  width: 1.8rem;
  height: 1.8rem;
  flex-shrink: 0;

  ${(props) =>
    props.$size === "small" &&
    css`
      width: 1.6rem;
      height: 1.6rem;
    `}

  ${(props) =>
    props.$size === "large" &&
    css`
      width: 2rem;
      height: 2rem;
    `}
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-500);
  cursor: pointer;
  pointer-events: auto;
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const HelperText = styled.div`
  margin-top: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);
  line-height: 1.4;

  ${(props) =>
    props.$error &&
    css`
      color: var(--color-error-600);
    `}
`;

/**
 * Enhanced DatePicker Component
 *
 * Features:
 * - Clean, modern design matching the app's UI system
 * - Multiple sizes (small, medium, large)
 * - Error and success states
 * - Clear button when date is selected
 * - Proper accessibility
 * - Custom calendar icon
 * - Helper text support
 * - Min/max date validation
 */
const DatePicker = forwardRef(function DatePicker(
  {
    value,
    onChange,
    onClear,
    placeholder = "Select date...",
    size = "medium",
    disabled = false,
    readOnly = false,
    hasError = false,
    showClearButton = true,
    helperText,
    min,
    max,
    className = "",
    ...props
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = value && value.trim() !== "";

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(event);
    }
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (onClear) {
      onClear();
    } else if (onChange) {
      // Create synthetic event for consistency
      const syntheticEvent = {
        target: { value: "" },
        type: "change",
      };
      onChange(syntheticEvent);
    }
  };

  const handleFocus = (event) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(event);
    }
  };

  return (
    <DatePickerContainer className={className}>
      <DatePickerInput
        {...props}
        ref={ref}
        type="date"
        value={value || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        $size={size}
        $hasError={hasError}
        $hasValue={hasValue}
        $isFocused={isFocused}
        placeholder={placeholder}
      />

      <IconContainer $size={size}>
        {hasValue && showClearButton && !disabled && !readOnly && (
          <ClearButton
            type="button"
            onClick={handleClear}
            aria-label="Clear date"
            tabIndex={-1}
          >
            <HiOutlineXMark />
          </ClearButton>
        )}
        <CalendarIcon $size={size} />
      </IconContainer>

      {helperText && <HelperText $error={hasError}>{helperText}</HelperText>}
    </DatePickerContainer>
  );
});

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  hasError: PropTypes.bool,
  showClearButton: PropTypes.bool,
  helperText: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  className: PropTypes.string,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

export default DatePicker;
