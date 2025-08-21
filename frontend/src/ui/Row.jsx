import styled, { css } from "styled-components";

const alignments = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

const justifications = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

const gaps = {
  0: "0",
  1: "var(--spacing-1)",
  2: "var(--spacing-2)",
  3: "var(--spacing-3)",
  4: "var(--spacing-4)",
  5: "var(--spacing-5)",
  6: "var(--spacing-6)",
  8: "var(--spacing-8)",
  10: "var(--spacing-10)",
  12: "var(--spacing-12)",
  16: "var(--spacing-16)",
  20: "var(--spacing-20)",
};

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;

  align-items: ${(props) => alignments[props.$align] || "stretch"};
  justify-content: ${(props) => justifications[props.$justify] || "flex-start"};
  gap: ${(props) => gaps[props.$gap] || gaps[4]};

  /* Wrap behavior */
  ${(props) =>
    props.$wrap &&
    css`
      flex-wrap: wrap;
    `}

  ${(props) =>
    props.$wrap === "reverse" &&
    css`
      flex-wrap: wrap-reverse;
    `}

  /* Responsive behavior - stack on mobile */
  @media (max-width: 768px) {
    ${(props) =>
      props.$stackOnMobile &&
      css`
        flex-direction: column;
      `}

    ${(props) =>
      props.$mobileGap &&
      css`
        gap: ${gaps[props.$mobileGap]};
      `}
  }

  /* Full width */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}
`;

function Row({
  children,
  align = "stretch",
  justify = "start",
  gap = 4,
  wrap = false,
  stackOnMobile = false,
  mobileGap,
  fullWidth = false,
  className = "",
  ...props
}) {
  return (
    <StyledRow
      $align={align}
      $justify={justify}
      $gap={gap}
      $wrap={wrap}
      $stackOnMobile={stackOnMobile}
      $mobileGap={mobileGap}
      $fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {children}
    </StyledRow>
  );
}

export default Row;
