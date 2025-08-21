import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const sizes = {
  small: css`
    height: var(--input-height-sm);
    padding: 0 var(--spacing-3);
    font-size: var(--font-size-sm);
  `,
  medium: css`
    height: var(--input-height-md);
    padding: 0 var(--spacing-4);
    font-size: var(--font-size-base);
  `,
  large: css`
    height: var(--input-height-lg);
    padding: 0 var(--spacing-5);
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

const StyledInput = styled.input`
  width: 100%;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  transition: all var(--duration-normal) var(--ease-in-out);
  font-family: inherit;

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

  /* Hide browser's built-in password reveal button */
  &::-ms-reveal,
  &::-ms-clear {
    display: none;
  }

  &::-webkit-credentials-auto-fill-button {
    display: none !important;
  }

  /* Hide Chrome's password visibility toggle */
  &[type="password"]::-webkit-textfield-decoration-container {
    display: none !important;
  }

  /* Additional Chrome password input fixes */
  &[type="password"] {
    -webkit-text-security: disc;
  }

  /* Disabled state */
  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
    border-color: var(--color-grey-200);

    &::placeholder {
      color: var(--color-grey-400);
    }
  }

  /* Placeholder styling */
  &::placeholder {
    color: var(--color-grey-500);
    opacity: 1;
  }

  /* Remove default styling for different input types */
  &[type="search"] {
    -webkit-appearance: none;
  }

  &[type="number"] {
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${(props) =>
      props.$responsive &&
      css`
        height: var(--input-height-sm);
        padding: 0 var(--spacing-3);
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

const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  /* Icon positioning */
  ${(props) =>
    (props.$hasLeftIcon || props.$hasRightIcon) &&
    css`
      position: relative;
    `}
`;

const IconWrapper = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  z-index: 1;

  ${(props) =>
    props.$position === "left" &&
    css`
      left: var(--spacing-3);
      pointer-events: none;
    `}

  ${(props) =>
    props.$position === "right" &&
    css`
      right: var(--spacing-3);
      pointer-events: ${props.$interactive ? "auto" : "none"};
    `}

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const StyledInputWithIcon = styled(StyledInput)`
  ${(props) =>
    props.$hasLeftIcon &&
    css`
      padding-left: var(--spacing-10);
    `}

  ${(props) =>
    props.$hasRightIcon &&
    css`
      padding-right: var(--spacing-10);
    `}
`;

function Input({
  size = "medium",
  variant = "default",
  fullWidth = true,
  responsive = false,
  leftIcon,
  rightIcon,
  rightIconInteractive = false,
  className = "",
  ...props
}) {
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  if (hasLeftIcon || hasRightIcon) {
    return (
      <InputContainer className={className}>
        <InputWrapper $hasLeftIcon={hasLeftIcon} $hasRightIcon={hasRightIcon}>
          {hasLeftIcon && (
            <IconWrapper $position="left">{leftIcon}</IconWrapper>
          )}
          <StyledInputWithIcon
            $size={size}
            $variant={variant}
            $fullWidth={fullWidth}
            $responsive={responsive}
            $hasLeftIcon={hasLeftIcon}
            $hasRightIcon={hasRightIcon}
            {...props}
          />
          {hasRightIcon && (
            <IconWrapper $position="right" $interactive={rightIconInteractive}>
              {rightIcon}
            </IconWrapper>
          )}
        </InputWrapper>
      </InputContainer>
    );
  }

  return (
    <StyledInput
      $size={size}
      $variant={variant}
      $fullWidth={fullWidth}
      $responsive={responsive}
      className={className}
      {...props}
    />
  );
}

Input.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  fullWidth: PropTypes.bool,
  responsive: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  rightIconInteractive: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
