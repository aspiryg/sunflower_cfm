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

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;

  align-items: ${(props) => alignments[props.$align] || "stretch"};
  justify-content: ${(props) => justifications[props.$justify] || "flex-start"};
  gap: ${(props) => gaps[props.$gap] || gaps[4]};

  /* Full width/height */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  ${(props) =>
    props.$fullHeight &&
    css`
      height: 100%;
    `}

  /* Flex properties */
  ${(props) =>
    props.$flex &&
    css`
      flex: ${props.$flex};
    `}

  /* Responsive gap */
  @media (max-width: 768px) {
    ${(props) =>
      props.$mobileGap &&
      css`
        gap: ${gaps[props.$mobileGap]};
      `}
  }
`;

function Column({
  children,
  align = "stretch",
  justify = "start",
  gap = 4,
  fullWidth = false,
  fullHeight = false,
  flex,
  mobileGap,
  className = "",
  ...props
}) {
  return (
    <StyledColumn
      $align={align}
      $justify={justify}
      $gap={gap}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      $flex={flex}
      $mobileGap={mobileGap}
      className={className}
      {...props}
    >
      {children}
    </StyledColumn>
  );
}

export default Column;
