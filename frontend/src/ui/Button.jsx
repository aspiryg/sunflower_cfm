import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const sizes = {
  small: css`
    font-size: var(--font-size-sm);
    padding: var(--spacing-1) var(--spacing-3);
    height: var(--button-height-sm);
    font-weight: var(--font-weight-medium);
  `,
  medium: css`
    font-size: var(--font-size-base);
    padding: var(--spacing-2) var(--spacing-4);
    height: var(--button-height-md);
    font-weight: var(--font-weight-medium);
  `,
  large: css`
    font-size: var(--font-size-lg);
    padding: var(--spacing-3) var(--spacing-6);
    height: var(--button-height-lg);
    font-weight: var(--font-weight-semibold);
  `,
};

const variants = {
  primary: css`
    color: var(--color-brand-50);
    background-color: var(--color-brand-600);
    border: 1px solid var(--color-brand-600);

    &:hover:not(:disabled) {
      background-color: var(--color-brand-700);
      border-color: var(--color-brand-700);
      /* transform: translateY(-1px); */
      box-shadow: var(--shadow-md);
    }

    &:active {
      background-color: var(--color-brand-800);
      border-color: var(--color-brand-800);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-brand-600);
    }
  `,
  secondary: css`
    color: var(--color-grey-600);
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-300);

    &:hover:not(:disabled) {
      background-color: var(--color-grey-50);
      border-color: var(--color-grey-400);
      /* transform: translateY(-1px); */
      box-shadow: var(--shadow-md);
    }

    &:active {
      background-color: var(--color-grey-100);
      border-color: var(--color-grey-500);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-grey-500);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-grey-500);
    }
  `,
  danger: css`
    color: var(--color-red-50);
    background-color: var(--color-red-600);
    border: 1px solid var(--color-red-600);

    &:hover:not(:disabled) {
      background-color: var(--color-red-700);
      border-color: var(--color-red-700);
      /* transform: translateY(-1px); */
      box-shadow: var(--shadow-md);
    }

    &:active {
      background-color: var(--color-red-800);
      border-color: var(--color-red-800);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-red-600);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-red-600);
    }
  `,
  success: css`
    color: var(--color-success-50);
    background-color: var(--color-success-600);
    border: 1px solid var(--color-success-600);

    &:hover:not(:disabled) {
      background-color: var(--color-success-700);
      border-color: var(--color-success-700);
      /* transform: translateY(-1px); */
      box-shadow: var(--shadow-md);
    }

    &:active {
      background-color: var(--color-success-800);
      border-color: var(--color-success-800);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-success-600);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-success-600);
    }
  `,
  outline: css`
    color: var(--color-brand-600);
    background-color: transparent;
    border: 1px solid var(--color-brand-600);

    &:hover:not(:disabled) {
      color: var(--color-brand-50);
      background-color: var(--color-brand-600);
      /* transform: translateY(-1px); */
      box-shadow: var(--shadow-md);
    }

    &:active {
      color: var(--color-brand-50);
      background-color: var(--color-brand-700);
      border-color: var(--color-brand-700);
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-brand-600);
    }
  `,
  ghost: css`
    color: var(--color-brand-600);
    background-color: transparent;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: var(--color-brand-700);
      background-color: var(--color-brand-50);
      border-color: var(--color-brand-200);
      /* transform: translateY(-1px); */
    }

    &:active {
      color: var(--color-brand-800);
      background-color: var(--color-brand-100);
      border-color: var(--color-brand-300);
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
    &:focus {
      outline: 2px solid var(--color-brand-600);
    }
  `,
};

const StyledButton = styled.button`
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  text-align: center;
  line-height: 1;
  white-space: nowrap;
  text-decoration: none;
  position: relative;
  overflow: hidden;

  /* Apply size styles */
  ${(props) => sizes[props.size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Full width modifier */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  /* Loading state */
  ${(props) =>
    props.$loading &&
    css`
      cursor: wait;
      opacity: 0.7;

      &:hover {
        transform: none !important;
        box-shadow: none !important;
      }
    `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;

    &:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  }

  /* Icon spacing */
  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    &.responsive {
      font-size: var(--font-size-sm);
      padding: var(--spacing-2) var(--spacing-3);
      height: var(--button-height-sm);
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border: 2px solid currentColor;
    border-top: 2px solid transparent;
  }
`;

function Button({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <StyledButton
      $variant={variant}
      size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      className={className}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "outline",
    "ghost",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
};

export default Button;
