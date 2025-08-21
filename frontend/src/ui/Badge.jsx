import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const variants = {
  primary: css`
    background-color: var(--color-brand-600);
    color: var(--color-brand-50);
  `,
  secondary: css`
    background-color: var(--color-grey-600);
    color: var(--color-grey-50);
  `,
  success: css`
    background-color: var(--color-success-600);
    color: var(--color-success-50);
  `,
  warning: css`
    background-color: var(--color-warning-600);
    color: var(--color-warning-50);
  `,
  error: css`
    background-color: var(--color-error-600);
    color: var(--color-error-50);
  `,
  info: css`
    background-color: var(--color-blue-600);
    color: var(--color-blue-50);
  `,
};

const sizes = {
  xs: css`
    --badge-padding: 0.2rem 0.4rem;
    --badge-font-size: var(--font-size-xs);
    --badge-min-width: 1.6rem;
    --badge-height: 1.6rem;
  `,
  sm: css`
    --badge-padding: 0.2rem 0.6rem;
    --badge-font-size: var(--font-size-xs);
    --badge-min-width: 2rem;
    --badge-height: 2rem;
  `,
  md: css`
    --badge-padding: 0.4rem 0.8rem;
    --badge-font-size: var(--font-size-sm);
    --badge-min-width: 2.4rem;
    --badge-height: 2.4rem;
  `,
  lg: css`
    --badge-padding: 0.6rem 1rem;
    --badge-font-size: var(--font-size-base);
    --badge-min-width: 2.8rem;
    --badge-height: 2.8rem;
  `,
};

const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--badge-padding);
  min-width: var(--badge-min-width);
  height: var(--badge-height);
  border-radius: var(--border-radius-full);
  font-size: var(--badge-font-size);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  user-select: none;

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Dot variant (no content, just a dot) */
  ${(props) =>
    props.$dot &&
    css`
      width: var(--badge-height);
      height: var(--badge-height);
      min-width: auto;
      padding: 0;
    `}

  /* Pulse animation for notifications */
  ${(props) =>
    props.$pulse &&
    css`
      animation: pulse 2s infinite;

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 currentColor;
          opacity: 1;
        }
        70% {
          box-shadow: 0 0 0 0.8rem transparent;
          opacity: 0.7;
        }
        100% {
          box-shadow: 0 0 0 0 transparent;
          opacity: 1;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    `}
`;

function Badge({
  variant = "primary",
  size = "md",
  content,
  dot = false,
  pulse = false,
  className = "",
  children,
  ...props
}) {
  return (
    <BadgeContainer
      $variant={variant}
      $size={size}
      $dot={dot}
      $pulse={pulse}
      className={className}
      {...props}
    >
      {dot ? null : content || children}
    </BadgeContainer>
  );
}

Badge.propTypes = {
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "success",
    "warning",
    "error",
    "info",
  ]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  dot: PropTypes.bool,
  pulse: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Badge;
