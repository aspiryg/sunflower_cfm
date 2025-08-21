import styled, { css } from "styled-components";
import PropTypes from "prop-types";

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

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 10rem;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: all var(--duration-normal) var(--ease-in-out);
  resize: vertical;
  line-height: 1.5;

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Full width */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  /* Auto resize */
  ${(props) =>
    props.$autoResize &&
    css`
      resize: none;
      overflow: hidden;
    `}

  /* Fixed height */
  ${(props) =>
    props.$height &&
    css`
      height: ${props.$height};
      min-height: ${props.$height};
    `}

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

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${(props) =>
      props.$responsive &&
      css`
        padding: var(--spacing-2) var(--spacing-3);
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

function Textarea({
  variant = "default",
  fullWidth = true,
  autoResize = false,
  height,
  responsive = false,
  className = "",
  ...props
}) {
  return (
    <StyledTextarea
      $variant={variant}
      $fullWidth={fullWidth}
      $autoResize={autoResize}
      $height={height}
      $responsive={responsive}
      className={className}
      {...props}
    />
  );
}

Textarea.propTypes = {
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  fullWidth: PropTypes.bool,
  autoResize: PropTypes.bool,
  height: PropTypes.string,
  responsive: PropTypes.bool,
  className: PropTypes.string,
};

export default Textarea;
