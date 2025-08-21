import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiCheck, HiMinus } from "react-icons/hi2";

const sizes = {
  small: css`
    --checkbox-size: 1.6rem;
    --icon-size: 1.5rem;
  `,
  medium: css`
    --checkbox-size: 2rem;
    --icon-size: 1.4rem;
  `,
  large: css`
    --checkbox-size: 2.4rem;
    --icon-size: 1.6rem;
  `,
};

const CheckboxContainer = styled.label`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  position: relative;
  user-select: none;

  ${(props) => sizes[props.$size]}

  ${(props) =>
    props.$disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.6;
    `}
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  margin: 0;
  z-index: 1;
`;

const StyledCheckbox = styled.div`
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--border-radius-sm);
  border: 2px solid var(--color-grey-300);
  background-color: var(--color-grey-0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--duration-normal) var(--ease-in-out);
  flex-shrink: 0;

  /* Hover state */
  ${CheckboxContainer}:hover:not([data-disabled="true"]) & {
    border-color: var(--color-grey-400);
  }

  /* Checked state */
  ${HiddenCheckbox}:checked ~ & {
    border-color: var(--color-brand-600);
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  }

  ${CheckboxContainer}:hover ${HiddenCheckbox}:checked ~ & {
    border-color: var(--color-brand-700);
    background-color: var(--color-brand-700);
  }

  /* Focus state */
  ${HiddenCheckbox}:focus ~ & {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  /* Error variant */
  ${(props) =>
    props.$variant === "error" &&
    css`
      border-color: var(--color-error-500);

      ${HiddenCheckbox}:checked ~ & {
        border-color: var(--color-error-600);
        background-color: var(--color-error-600);
      }

      ${HiddenCheckbox}:focus ~ & {
        outline-color: var(--color-error-600);
      }
    `}

  /* Success variant */
  ${(props) =>
    props.$variant === "success" &&
    css`
      border-color: var(--color-success-500);

      ${HiddenCheckbox}:checked ~ & {
        border-color: var(--color-success-600);
        background-color: var(--color-success-600);
      }

      ${HiddenCheckbox}:focus ~ & {
        outline-color: var(--color-success-600);
      }
    `}

  /* Warning variant */
  ${(props) =>
    props.$variant === "warning" &&
    css`
      border-color: var(--color-warning-500);

      ${HiddenCheckbox}:checked ~ & {
        border-color: var(--color-warning-600);
        background-color: var(--color-warning-600);
      }

      ${HiddenCheckbox}:focus ~ & {
        outline-color: var(--color-warning-600);
      }
    `}

  /* Disabled state */
  ${(props) =>
    props.$disabled &&
    css`
      border-color: var(--color-grey-200);
      background-color: var(--color-grey-100);

      ${HiddenCheckbox}:checked ~ & {
        border-color: var(--color-grey-300);
        background-color: var(--color-grey-300);
        color: var(--color-grey-500);
      }
    `}

  /* Indeterminate state */
  ${(props) =>
    props.$indeterminate &&
    css`
      border-color: var(--color-brand-600);
      background-color: var(--color-brand-600);
      color: var(--color-brand-50);
    `}

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 3px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CheckIcon = styled(HiCheck)`
  width: var(--icon-size);
  height: var(--icon-size);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity var(--duration-fast) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const IndeterminateIcon = styled(HiMinus)`
  width: var(--icon-size);
  height: var(--icon-size);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity var(--duration-fast) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CheckboxLabel = styled.span`
  font-size: var(--font-size-base);
  color: var(--color-grey-700);
  line-height: 1.4;

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-500);
    `}

  ${(props) =>
    props.$variant === "error" &&
    css`
      color: var(--color-error-700);
    `}

  ${(props) =>
    props.$variant === "success" &&
    css`
      color: var(--color-success-700);
    `}

  ${(props) =>
    props.$variant === "warning" &&
    css`
      color: var(--color-warning-700);
    `}
`;

function Checkbox({
  checked = false,
  indeterminate = false,
  size = "medium",
  variant = "default",
  disabled = false,
  label,
  onChange,
  className = "",
  id,
  name,
  value,
  ...props
}) {
  const handleChange = (event) => {
    if (disabled) return;
    if (onChange) {
      onChange(event.target.checked, event);
    }
  };

  const showCheck = checked && !indeterminate;
  const showIndeterminate = indeterminate;

  return (
    <CheckboxContainer
      $size={size}
      $disabled={disabled}
      className={className}
      data-disabled={disabled}
    >
      <HiddenCheckbox
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <StyledCheckbox
        $variant={variant}
        $disabled={disabled}
        $indeterminate={indeterminate}
      >
        <CheckIcon $visible={showCheck} />
        <IndeterminateIcon $visible={showIndeterminate} />
      </StyledCheckbox>
      {label && (
        <CheckboxLabel $disabled={disabled} $variant={variant}>
          {label}
        </CheckboxLabel>
      )}
    </CheckboxContainer>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  indeterminate: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  disabled: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
};

export default Checkbox;
