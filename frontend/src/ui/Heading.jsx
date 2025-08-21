import styled, { css } from "styled-components";

const sizes = {
  h1: css`
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: var(--font-size-3xl);
    }
  `,
  h2: css`
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
    line-height: 1.3;

    @media (max-width: 768px) {
      font-size: var(--font-size-2xl);
    }
  `,
  h3: css`
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: var(--font-size-xl);
    }
  `,
  h4: css`
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: var(--font-size-lg);
    }
  `,
  h5: css`
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  `,
  h6: css`
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  `,
};

const StyledHeading = styled.h1`
  color: var(--color-grey-800);
  margin: 0;

  ${(props) => sizes[props.as]}

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
    text-align: ${(props) => props.$mobileAlign || props.align || "left"};
  }
`;

function Heading({
  children,
  as = "h1",
  color = "default",
  align = "left",
  mobileAlign,
  className = "",
  ...props
}) {
  return (
    <StyledHeading
      as={as}
      color={color}
      $align={align}
      $mobileAlign={mobileAlign}
      className={className}
      {...props}
    >
      {children}
    </StyledHeading>
  );
}

export default Heading;
