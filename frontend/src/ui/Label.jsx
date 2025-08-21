import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const sizes = {
  small: css`
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  `,
  medium: css`
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
  `,
  large: css`
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
  `,
};

const StyledLabel = styled.label`
  color: var(--color-grey-700);
  display: block;
  margin-bottom: var(--spacing-1);
  line-height: 1.4;

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Required indicator */
  ${(props) =>
    props.$required &&
    css`
      &::after {
        content: " *";
        color: var(--color-error-600);
        margin-left: var(--spacing-1);
      }
    `}

  /* Disabled state */
  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-500);
      cursor: not-allowed;
    `}

  /* Color variants */
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

function Label({
  children,
  size = "medium",
  variant = "default",
  required = false,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <StyledLabel
      $size={size}
      $variant={variant}
      $required={required}
      $disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </StyledLabel>
  );
}

Label.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Label;
