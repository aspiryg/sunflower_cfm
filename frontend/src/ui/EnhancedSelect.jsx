import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiChevronDown } from "react-icons/hi2";

const sizes = {
  small: css`
    height: var(--input-height-sm);
    padding: 0 var(--spacing-8) 0 var(--spacing-3);
    font-size: var(--font-size-sm);
  `,
  medium: css`
    height: var(--input-height-md);
    padding: 0 var(--spacing-10) 0 var(--spacing-4);
    font-size: var(--font-size-base);
  `,
  large: css`
    height: var(--input-height-lg);
    padding: 0 var(--spacing-12) 0 var(--spacing-5);
    font-size: var(--font-size-lg);
  `,
};

const variants = {
  default: css`
    border: 1px solid var(--color-grey-300);
    background-color: var(--color-grey-0);

    &:hover:not(:disabled) {
      border-color: var(--color-grey-400);
    }

    &:focus {
      outline: none;
      border-color: var(--color-brand-500);
      box-shadow: 0 0 0 3px var(--color-brand-100);
    }
  `,
  error: css`
    border: 1px solid var(--color-error-500);
    background-color: var(--color-error-50);

    &:hover:not(:disabled) {
      border-color: var(--color-error-600);
    }

    &:focus {
      outline: none;
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px var(--color-error-100);
    }
  `,
  success: css`
    border: 1px solid var(--color-success-500);
    background-color: var(--color-success-50);

    &:hover:not(:disabled) {
      border-color: var(--color-success-600);
    }

    &:focus {
      outline: none;
      border-color: var(--color-success-500);
      box-shadow: 0 0 0 3px var(--color-success-100);
    }
  `,
  warning: css`
    border: 1px solid var(--color-warning-500);
    background-color: var(--color-warning-50);

    &:hover:not(:disabled) {
      border-color: var(--color-warning-600);
    }

    &:focus {
      outline: none;
      border-color: var(--color-warning-500);
      box-shadow: 0 0 0 3px var(--color-warning-100);
    }
  `,
};

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const StyledSelect = styled.select`
  width: 100%;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  transition: all var(--duration-normal) var(--ease-in-out);
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Full width */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  /* Disabled state */
  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
    border-color: var(--color-grey-200);
  }

  /* Remove default arrow in IE */
  &::-ms-expand {
    display: none;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${(props) =>
      props.$responsive &&
      css`
        height: var(--input-height-sm);
        padding: 0 var(--spacing-8) 0 var(--spacing-3);
        font-size: var(--font-size-sm);
      `}
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-400);
    `}
`;

/**
 * Enhanced Select component that accepts options array instead of children
 * This prevents the "unknown prop" warning from styled-components
 */
function EnhancedSelect({
  // Enhanced props for options array
  options = [],
  value,
  onChange,
  placeholder,

  // Original Select props
  size = "medium",
  variant = "default",
  fullWidth = true,
  responsive = false,
  disabled = false,
  className = "",

  // Standard HTML select props
  ...htmlProps
}) {
  // Handle change event and extract value
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <SelectContainer className={className}>
      <StyledSelect
        $size={size}
        $variant={variant}
        $fullWidth={fullWidth}
        $responsive={responsive}
        disabled={disabled}
        value={value}
        onChange={handleChange}
        {...htmlProps}
      >
        {/* Render placeholder as disabled option if provided */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {/* Render options from array */}
        {options.map((option) => {
          // Handle both string options and object options
          const optionValue =
            typeof option === "string" ? option : option.value;
          const optionLabel =
            typeof option === "string" ? option : option.label;

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </StyledSelect>

      <SelectIcon $disabled={disabled}>
        <HiChevronDown />
      </SelectIcon>
    </SelectContainer>
  );
}

EnhancedSelect.propTypes = {
  // Enhanced props
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,

  // Original props
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  fullWidth: PropTypes.bool,
  responsive: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default EnhancedSelect;
