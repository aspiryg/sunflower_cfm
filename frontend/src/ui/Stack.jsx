import styled, { css } from "styled-components";

const directions = {
  row: css`
    flex-direction: row;
  `,
  column: css`
    flex-direction: column;
  `,
  rowReverse: css`
    flex-direction: row-reverse;
  `,
  columnReverse: css`
    flex-direction: column-reverse;
  `,
};

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

const StyledStack = styled.div`
  display: flex;

  ${(props) => directions[props.direction]}

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

  /* Responsive direction */
  @media (max-width: 768px) {
    ${(props) =>
      props.$mobileDirection &&
      css`
        flex-direction: ${props.$mobileDirection};
      `}

    ${(props) =>
      props.$mobileGap &&
      css`
        gap: ${gaps[props.$mobileGap]};
      `}
  }

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
`;

function Stack({
  children,
  direction = "column",
  align = "stretch",
  justify = "start",
  gap = 4,
  wrap = false,
  mobileDirection,
  mobileGap,
  fullWidth = false,
  fullHeight = false,
  className = "",
  ...props
}) {
  return (
    <StyledStack
      direction={direction}
      $align={align}
      $justify={justify}
      $gap={gap}
      $wrap={wrap}
      $mobileDirection={mobileDirection}
      $mobileGap={mobileGap}
      $fullWidth={fullWidth}
      $fullHeight={fullHeight}
      className={className}
      {...props}
    >
      {children}
    </StyledStack>
  );
}

export default Stack;
