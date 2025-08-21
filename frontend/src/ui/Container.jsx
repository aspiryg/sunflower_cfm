import styled, { css } from "styled-components";

const sizes = {
  xs: css`
    max-width: var(--container-xs);
  `,
  sm: css`
    max-width: var(--container-sm);
  `,
  md: css`
    max-width: var(--container-md);
  `,
  lg: css`
    max-width: var(--container-lg);
  `,
  xl: css`
    max-width: var(--container-xl);
  `,
  "2xl": css`
    max-width: var(--container-2xl);
  `,
  full: css`
    max-width: var(--container-full);
  `,
};

const StyledContainer = styled.div`
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);

  ${(props) => sizes[props.size]}

  /* Responsive padding adjustments */
  @media (max-width: 640px) {
    padding-left: var(--spacing-3);
    padding-right: var(--spacing-3);
  }

  @media (min-width: 1024px) {
    padding-left: var(--spacing-6);
    padding-right: var(--spacing-6);
  }

  /* Fluid container */
  ${(props) =>
    props.$fluid &&
    css`
      max-width: none;
      padding-left: var(--spacing-4);
      padding-right: var(--spacing-4);
    `}

  /* Center content */
  ${(props) =>
    props.$centercontent &&
    css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: ${props.$minHeight || "auto"};
    `}
`;

function Container({
  children,
  size = "lg",
  fluid = false,
  centercontent = false,
  minHeight,
  className = "",
  ...props
}) {
  return (
    <StyledContainer
      size={size}
      $fluid={fluid}
      $centercontent={centercontent}
      $minHeight={minHeight}
      className={className}
      {...props}
    >
      {children}
    </StyledContainer>
  );
}

export default Container;
