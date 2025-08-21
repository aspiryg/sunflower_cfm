import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const variants = {
  default: css`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
  `,
  elevated: css`
    background-color: var(--color-grey-0);
    border: 1px solid var(--color-grey-200);
    box-shadow: var(--shadow-md);
  `,
  flat: css`
    background-color: var(--color-grey-50);
    border: none;
  `,
  outlined: css`
    background-color: transparent;
    border: 2px solid var(--color-grey-200);
  `,
};

const StyledCard = styled.div`
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) => variants[props.$variant]}

  ${(props) =>
    props.$hoverable &&
    css`
      cursor: pointer;

      &:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-1px);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

function Card({
  children,
  variant = "default",
  hoverable = false,
  className = "",
  onClick,
  ...props
}) {
  return (
    <StyledCard
      $variant={variant}
      $hoverable={hoverable}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </StyledCard>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "elevated", "flat", "outlined"]),
  hoverable: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default Card;
