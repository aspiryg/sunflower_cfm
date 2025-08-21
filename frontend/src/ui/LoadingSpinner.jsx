import styled, { keyframes, css } from "styled-components";
import PropTypes from "prop-types";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$fullScreen &&
    css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--color-grey-0);
      z-index: var(--z-modal);
    `}

  ${(props) =>
    props.$size === "page" &&
    css`
      height: 50vh;
    `}
`;

const Spinner = styled.div`
  width: ${(props) => {
    switch (props.$size) {
      case "small":
        return "2rem";
      case "large":
        return "4rem";
      default:
        return "3rem";
    }
  }};
  height: ${(props) => {
    switch (props.$size) {
      case "small":
        return "2rem";
      case "large":
        return "4rem";
      default:
        return "3rem";
    }
  }};
  border: 3px solid var(--color-grey-200);
  border-top: 3px solid var(--color-brand-600);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    border: 3px solid var(--color-brand-600);
  }
`;

function LoadingSpinner({
  size = "medium",
  fullScreen = false,
  className = "",
}) {
  return (
    <SpinnerContainer
      $fullScreen={fullScreen}
      $size={size}
      className={className}
    >
      <Spinner $size={size} />
    </SpinnerContainer>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large", "page"]),
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default LoadingSpinner;
