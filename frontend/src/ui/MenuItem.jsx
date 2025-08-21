import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const StyledMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-50);
    color: var(--color-grey-800);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--color-grey-400);

    &:hover {
      background-color: transparent;
      color: var(--color-grey-400);
    }
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  /* Variant styles */
  ${(props) =>
    props.$variant === "danger" &&
    css`
      color: var(--color-error-600);

      &:hover:not(:disabled) {
        background-color: var(--color-error-50);
        color: var(--color-error-700);
      }

      &:focus {
        background-color: var(--color-error-50);
        color: var(--color-error-700);
      }

      svg {
        color: var(--color-error-500);
      }
    `}

  ${(props) =>
    props.$variant === "primary" &&
    css`
      color: var(--color-brand-600);

      &:hover:not(:disabled) {
        background-color: var(--color-brand-50);
        color: var(--color-brand-700);
      }

      svg {
        color: var(--color-brand-500);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MenuItemContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  flex: 1;
`;

const MenuItemLabel = styled.span`
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  /* FIXED: Removed overflow: hidden to prevent text hiding with icons */
  text-overflow: ellipsis;
`;

const MenuItemDescription = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-grey-500);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuItemShortcut = styled.span`
  margin-left: auto;
  font-size: var(--font-size-xs);
  color: var(--color-grey-400);
  flex-shrink: 0;
`;

/**
 * Reusable MenuItem component for menus, dropdowns, and lists
 *
 * Features:
 * - Icon support
 * - Description text
 * - Keyboard shortcuts display
 * - Multiple variants (default, primary, danger)
 * - Disabled state
 * - Accessibility compliant
 */
function MenuItem({
  children,
  label,
  description,
  icon: Icon,
  shortcut,
  variant = "default",
  disabled = false,
  onClick,
  className = "",
  showDescription = false,
  ...props
}) {
  const handleClick = (event) => {
    if (disabled) return;

    event.stopPropagation();

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <StyledMenuItem
      $variant={variant}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      role="menuitem"
      tabIndex={-1}
      {...props}
    >
      {Icon && <Icon />}

      {children || (
        <MenuItemContent>
          <MenuItemLabel>{label}</MenuItemLabel>
          {showDescription && description && (
            <MenuItemDescription>{description}</MenuItemDescription>
          )}
        </MenuItemContent>
      )}

      {shortcut && <MenuItemShortcut>{shortcut}</MenuItemShortcut>}
    </StyledMenuItem>
  );
}

MenuItem.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  shortcut: PropTypes.string,
  variant: PropTypes.oneOf(["default", "primary", "danger"]),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  showDescription: PropTypes.bool,
};

export default MenuItem;
