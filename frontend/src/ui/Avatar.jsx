import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineUser } from "react-icons/hi2";

const sizes = {
  xs: css`
    --avatar-size: 2.4rem;
    --font-size: var(--font-size-xs);
  `,
  sm: css`
    --avatar-size: 3.2rem;
    --font-size: var(--font-size-sm);
  `,
  md: css`
    --avatar-size: 4rem;
    --font-size: var(--font-size-base);
  `,
  lg: css`
    --avatar-size: 4.8rem;
    --font-size: var(--font-size-lg);
  `,
  xl: css`
    --avatar-size: 6.4rem;
    --font-size: var(--font-size-xl);
  `,
};

const AvatarContainer = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Hover effect for clickable avatars */
  ${(props) =>
    props.$clickable &&
    css`
      &:hover {
        transform: scale(1.05);
        box-shadow: var(--shadow-md);
      }
    `}

  /* Status indicator positioning */
  ${(props) =>
    props.$showStatus &&
    css`
      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25%;
        height: 25%;
        border-radius: var(--border-radius-full);
        border: 2px solid var(--color-grey-0);
        background-color: ${props.$status === "online"
          ? "var(--color-success-500)"
          : props.$status === "away"
          ? "var(--color-warning-500)"
          : props.$status === "busy"
          ? "var(--color-error-500)"
          : "var(--color-grey-400)"};
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`;

const AvatarInitials = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-600)
  );
  color: var(--color-brand-50);
  font-size: var(--font-size);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  user-select: none;
`;

const AvatarFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);

  svg {
    width: 60%;
    height: 60%;
  }
`;

function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  showStatus = false,
  clickable = false,
  onClick,
  className = "",
  ...props
}) {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2);
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  return (
    <AvatarContainer
      $size={size}
      $clickable={clickable}
      $showStatus={showStatus}
      $status={status}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {src ? (
        <>
          <AvatarImage
            src={src}
            alt={alt || `${name}'s avatar`}
            onError={handleImageError}
          />
          {/* Fallback initials - hidden by default, shown if image fails */}
          <AvatarInitials style={{ position: "absolute", display: "none" }}>
            {getInitials(name)}
          </AvatarInitials>
        </>
      ) : name ? (
        <AvatarInitials>{getInitials(name)}</AvatarInitials>
      ) : (
        <AvatarFallback>
          <HiOutlineUser />
        </AvatarFallback>
      )}
    </AvatarContainer>
  );
}

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  status: PropTypes.oneOf(["online", "away", "busy", "offline"]),
  showStatus: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Avatar;
