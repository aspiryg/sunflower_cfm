import styled, { css } from "styled-components";

const sizes = {
  small: css`
    width: var(--button-height-sm);
    height: var(--button-height-sm);
    border-radius: var(--border-radius-sm);

    svg {
      width: 1.4rem;
      height: 1.4rem;
    }
  `,
  medium: css`
    width: var(--button-height-md);
    height: var(--button-height-md);
    border-radius: var(--border-radius-md);

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  `,
  large: css`
    width: var(--button-height-lg);
    height: var(--button-height-lg);
    border-radius: var(--border-radius-lg);

    svg {
      width: 2rem;
      height: 2rem;
    }
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
      transform: translateY(-1px);
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
      transform: translateY(-1px);
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
      outline-offset: 2px;
    }
  `,
  danger: css`
    color: var(--color-red-50);
    background-color: var(--color-red-600);
    border: 1px solid var(--color-red-600);

    &:hover:not(:disabled) {
      background-color: var(--color-red-700);
      border-color: var(--color-red-700);
      transform: translateY(-1px);
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
      outline-offset: 2px;
    }
  `,
  success: css`
    color: var(--color-success-50);
    background-color: var(--color-success-600);
    border: 1px solid var(--color-success-600);

    &:hover:not(:disabled) {
      background-color: var(--color-success-700);
      border-color: var(--color-success-700);
      transform: translateY(-1px);
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
      outline-offset: 2px;
    }
  `,
  ghost: css`
    color: var(--color-grey-600);
    background-color: transparent;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      color: var(--color-grey-700);
      background-color: var(--color-grey-100);
      border-color: var(--color-grey-200);
      transform: translateY(-1px);
    }

    &:active {
      color: var(--color-grey-800);
      background-color: var(--color-grey-200);
      border-color: var(--color-grey-300);
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid var(--color-grey-500);
      outline-offset: 2px;
    }

    &:focus {
      outline: 2px solid var(--color-brand-600);
      outline-offset: 2px;
    }
  `,
  outline: css`
    color: var(--color-brand-600);
    background-color: transparent;
    border: 1px solid var(--color-brand-600);

    &:hover:not(:disabled) {
      color: var(--color-brand-50);
      background-color: var(--color-brand-600);
      transform: translateY(-1px);
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
      outline-offset: 2px;
    }
  `,
};

const StyledIconButton = styled.button`
  border: none;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  /* Apply size styles */
  ${(props) => sizes[props.size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

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

  /* Loading state */
  ${(props) =>
    props.loading &&
    css`
      cursor: wait;
      opacity: 0.7;

      &:hover {
        transform: none !important;
        box-shadow: none !important;
      }
    `}

  /* Icon styling */
  svg {
    flex-shrink: 0;
    transition: transform var(--duration-fast) var(--ease-in-out);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    &.responsive {
      ${sizes.small}
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

    svg {
      transition: none;
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
  position: absolute;

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

function IconButton({
  children,
  variant = "secondary",
  size = "medium",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  "aria-label": ariaLabel,
  tooltip,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <StyledIconButton
      $variant={variant}
      size={size}
      $loading={loading}
      disabled={isDisabled}
      onClick={onClick}
      type={type}
      className={className}
      aria-label={ariaLabel || tooltip}
      title={tooltip}
      {...props}
    >
      {loading && <LoadingSpinner />}
      <span style={{ opacity: loading ? 0 : 1 }}>{children}</span>
    </StyledIconButton>
  );
}

export default IconButton;
