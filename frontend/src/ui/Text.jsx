import styled, { css } from "styled-components";

const sizes = {
  xs: css`
    font-size: var(--font-size-xs);
    line-height: 1.4;
  `,
  sm: css`
    font-size: var(--font-size-sm);
    line-height: 1.4;
  `,
  base: css`
    font-size: var(--font-size-base);
    line-height: 1.5;
  `,
  lg: css`
    font-size: var(--font-size-lg);
    line-height: 1.5;
  `,
  xl: css`
    font-size: var(--font-size-xl);
    line-height: 1.6;
  `,
};

const weights = {
  light: css`
    font-weight: var(--font-weight-light);
  `,
  normal: css`
    font-weight: var(--font-weight-normal);
  `,
  medium: css`
    font-weight: var(--font-weight-medium);
  `,
  semibold: css`
    font-weight: var(--font-weight-semibold);
  `,
  bold: css`
    font-weight: var(--font-weight-bold);
  `,
};

const StyledText = styled.p`
  color: var(--color-grey-700);
  margin: 0;

  ${(props) => sizes[props.size]}
  ${(props) => weights[props.$weight]}

  /* Color variants */
  ${(props) =>
    props.color === "primary" &&
    css`
      color: var(--color-brand-700);
    `}

  ${(props) =>
    props.color === "secondary" &&
    css`
      color: var(--color-grey-600);
    `}

  ${(props) =>
    props.color === "muted" &&
    css`
      color: var(--color-grey-500);
    `}

  ${(props) =>
    props.color === "success" &&
    css`
      color: var(--color-success-700);
    `}

  ${(props) =>
    props.color === "warning" &&
    css`
      color: var(--color-warning-700);
    `}

  ${(props) =>
    props.color === "danger" &&
    css`
      color: var(--color-error-700);
    `}

  /* Text alignment */
  text-align: ${(props) => props.$align || "left"};

  /* Responsive text alignment */
  @media (max-width: 768px) {
    text-align: ${(props) => props.$mobileAlign || props.$align || "left"};
  }

  /* Truncation */
  ${(props) =>
    props.$truncate &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}

  /* Line clamping */
  ${(props) =>
    props.lineClamp &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: ${props.lineClamp};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `}
`;

function Text({
  children,
  as = "p",
  size = "base",
  weight = "normal",
  color = "default",
  align = "left",
  mobileAlign,
  truncate = false,
  lineClamp,
  className = "",
  ...props
}) {
  return (
    <StyledText
      as={as}
      size={size}
      $weight={weight}
      color={color}
      $align={align}
      $mobileAlign={mobileAlign}
      $truncate={truncate}
      lineClamp={lineClamp}
      className={className}
      {...props}
    >
      {children}
    </StyledText>
  );
}

export default Text;
