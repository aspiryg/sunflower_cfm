// Create this file: /frontend/src/ui/InfoCard.jsx
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Text from "./Text";
import Column from "./Column";

const variants = {
  info: css`
    background: linear-gradient(
      135deg,
      var(--color-info-25),
      var(--color-info-50)
    );
    border: 1px solid var(--color-info-200);
    border-left: 4px solid var(--color-info-500);
    color: var(--color-info-700);
  `,
  success: css`
    background: linear-gradient(
      135deg,
      var(--color-success-25),
      var(--color-success-50)
    );
    border: 1px solid var(--color-success-200);
    border-left: 4px solid var(--color-success-500);
    color: var(--color-success-700);
  `,
  warning: css`
    background: linear-gradient(
      135deg,
      var(--color-warning-25),
      var(--color-warning-50)
    );
    border: 1px solid var(--color-warning-200);
    border-left: 4px solid var(--color-warning-500);
    color: var(--color-warning-700);
  `,
  error: css`
    background: linear-gradient(
      135deg,
      var(--color-error-25),
      var(--color-error-50)
    );
    border: 1px solid var(--color-error-200);
    border-left: 4px solid var(--color-error-500);
    color: var(--color-error-700);
  `,
};

const sizes = {
  small: css`
    padding: var(--spacing-3);
    border-radius: var(--border-radius-md);
  `,
  medium: css`
    padding: var(--spacing-4);
    border-radius: var(--border-radius-lg);
  `,
  large: css`
    padding: var(--spacing-5);
    border-radius: var(--border-radius-xl);
  `,
};

const InfoCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Dismissible styles */
  ${(props) =>
    props.$dismissible &&
    css`
      position: relative;
    `}

  /* Interactive styles */
  ${(props) =>
    props.$interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const InfoCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  justify-content: space-between;
`;

const InfoCardIconTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
`;

const InfoCardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  ${(props) =>
    props.$size === "small" &&
    css`
      width: 1.6rem;
      height: 1.6rem;

      svg {
        width: 1.4rem;
        height: 1.4rem;
      }
    `}

  ${(props) =>
    props.$size === "large" &&
    css`
      width: 2.4rem;
      height: 2.4rem;

      svg {
        width: 2rem;
        height: 2rem;
      }
    `}
`;

const InfoCardTitle = styled(Text)`
  flex: 1;
  margin: 0;
`;

const InfoCardDismiss = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  color: inherit;
  opacity: 0.7;
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const InfoCardContent = styled.div`
  flex: 1;
`;

const InfoCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  flex-wrap: wrap;
`;

// Default icons for each variant
const defaultIcons = {
  info: HiOutlineInformationCircle,
  success: HiOutlineCheckCircle,
  warning: HiOutlineExclamationTriangle,
  error: HiOutlineXCircle,
};

/**
 * InfoCard Component
 *
 * A versatile card component for displaying information, alerts, or notifications
 * with support for different variants, sizes, and interactive features
 */
function InfoCard({
  variant = "info",
  size = "medium",
  icon: CustomIcon,
  title,
  children,
  dismissible = false,
  interactive = false,
  actions,
  onDismiss,
  onClick,
  className = "",
  ...props
}) {
  // Determine which icon to use
  const IconComponent = CustomIcon || defaultIcons[variant];

  const handleClick = (event) => {
    if (onClick && interactive) {
      onClick(event);
    }
  };

  const handleDismiss = (event) => {
    event.stopPropagation(); // Prevent triggering onClick when dismissing
    if (onDismiss) {
      onDismiss(event);
    }
  };

  const getTitleSize = () => {
    switch (size) {
      case "small":
        return "sm";
      case "large":
        return "lg";
      default:
        return "md";
    }
  };

  return (
    <InfoCardContainer
      $variant={variant}
      $size={size}
      $dismissible={dismissible}
      $interactive={interactive}
      onClick={handleClick}
      className={className}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {/* Header with icon, title, and dismiss button */}
      {(IconComponent || title || dismissible) && (
        <InfoCardHeader>
          <InfoCardIconTitle>
            {IconComponent && (
              <InfoCardIcon $size={size}>
                <IconComponent />
              </InfoCardIcon>
            )}
            {title && (
              <InfoCardTitle size={getTitleSize()} weight="semibold">
                {title}
              </InfoCardTitle>
            )}
          </InfoCardIconTitle>

          {dismissible && (
            <InfoCardDismiss
              onClick={handleDismiss}
              aria-label="Dismiss"
              type="button"
            >
              <HiOutlineXCircle />
            </InfoCardDismiss>
          )}
        </InfoCardHeader>
      )}

      {/* Main content */}
      {children && (
        <InfoCardContent>
          {typeof children === "string" ? (
            <Text size={size === "small" ? "sm" : "base"}>{children}</Text>
          ) : (
            children
          )}
        </InfoCardContent>
      )}

      {/* Actions */}
      {actions && <InfoCardActions>{actions}</InfoCardActions>}
    </InfoCardContainer>
  );
}

InfoCard.propTypes = {
  variant: PropTypes.oneOf(["info", "success", "warning", "error"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  icon: PropTypes.elementType,
  title: PropTypes.string,
  children: PropTypes.node,
  dismissible: PropTypes.bool,
  interactive: PropTypes.bool,
  actions: PropTypes.node,
  onDismiss: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default InfoCard;
