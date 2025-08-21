import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiCheck } from "react-icons/hi2";

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  user-select: none;

  ${(props) =>
    props.$disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
    `}
`;

const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
`;

const CheckboxIndicator = styled.div`
  position: relative;
  width: 1.8rem;
  height: 1.8rem;
  border: 2px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  background-color: var(--color-grey-0);
  transition: all var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  /* Hover state */
  ${CheckboxContainer}:hover & {
    border-color: var(--color-brand-400);
    background-color: var(--color-brand-25);
  }

  /* Focus state */
  ${CheckboxInput}:focus + & {
    outline: 2px solid var(--color-brand-100);
    outline-offset: 2px;
    border-color: var(--color-brand-500);
  }

  /* Checked state */
  ${CheckboxInput}:checked + & {
    background-color: var(--color-brand-500);
    border-color: var(--color-brand-500);
    color: var(--color-grey-0);
  }

  /* Checked hover state */
  ${CheckboxInput}:checked + ${CheckboxContainer}:hover & {
    background-color: var(--color-brand-600);
    border-color: var(--color-brand-600);
  }

  /* Error state */
  ${(props) =>
    props.$error &&
    css`
      border-color: var(--color-error-500);
      background-color: var(--color-error-50);
    `}

  /* Disabled state */
  ${(props) =>
    props.$disabled &&
    css`
      background-color: var(--color-grey-100);
      border-color: var(--color-grey-200);
      cursor: not-allowed;

      ${CheckboxContainer}:hover & {
        background-color: var(--color-grey-100);
        border-color: var(--color-grey-200);
      }
    `}

  /* Size variants */
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

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CheckIcon = styled(HiCheck)`
  width: 1.2rem;
  height: 1.2rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-fast) var(--ease-in-out);

  ${CheckboxInput}:checked ~ ${CheckboxIndicator} & {
    opacity: 1;
    transform: scale(1);
  }

  ${(props) =>
    props.$size === "small" &&
    css`
      width: 1rem;
      height: 1rem;
    `}

  ${(props) =>
    props.$size === "large" &&
    css`
      width: 1.4rem;
      height: 1.4rem;
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CheckboxLabelText = styled.span`
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: var(--color-grey-700);

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-400);
    `}

  ${(props) =>
    props.$size === "small" &&
    css`
      font-size: var(--font-size-xs);
    `}

  ${(props) =>
    props.$size === "large" &&
    css`
      font-size: var(--font-size-base);
    `}
`;

/**
 * Enhanced Checkbox Component
 * A styled checkbox with consistent theme support and accessibility
 */
function EnhancedCheckbox({
  id,
  checked = false,
  onChange,
  disabled = false,
  error = false,
  label,
  size = "medium",
  className = "",
  ...htmlProps
}) {
  const handleChange = (event) => {
    if (!disabled && onChange) {
      onChange(event.target.checked, event);
    }
  };

  return (
    <CheckboxContainer htmlFor={id} $disabled={disabled} className={className}>
      <CheckboxInput
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={error}
        {...htmlProps}
      />
      <CheckboxIndicator $error={error} $disabled={disabled} $size={size}>
        <CheckIcon $size={size} />
      </CheckboxIndicator>
      {label && (
        <CheckboxLabelText $disabled={disabled} $size={size}>
          {label}
        </CheckboxLabelText>
      )}
    </CheckboxContainer>
  );
}

EnhancedCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  label: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default EnhancedCheckbox;
