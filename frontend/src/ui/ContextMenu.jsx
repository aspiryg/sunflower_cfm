import { useState, useRef, useEffect, useCallback } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineEllipsisVertical } from "react-icons/hi2";
import IconButton from "./IconButton";
import Portal from "./Portal";
import MenuItem from "./MenuItem";
import MenuItemGroup from "./MenuItemGroup";
import useClickOutside from "../hooks/useClickOutside";
import useEscapeKey from "../hooks/useEscapeKey";
import useKeyboardNavigation from "../hooks/useKeyboardNavigation";

const ContextMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ContextMenuDropdown = styled.div`
  position: fixed;
  min-width: 24rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-modal);
  overflow: hidden;

  /* 
   * KEY FIX: Initially invisible and positioned off-screen 
   * This prevents the flash/transition from wrong position
   */
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  visibility: ${(props) => (props.$isVisible ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};

  /* 
   * POSITIONING: Only apply position when we have calculated values
   * This prevents the menu from appearing at (0,0) initially
   */
  ${(props) => {
    if (!props.$position || !props.$isVisible) {
      // When not visible or no position calculated, keep it off-screen
      return css`
        top: -9999px;
        left: -9999px;
        transform: scale(0.95);
      `;
    }

    // When visible with calculated position, apply the correct position
    return css`
      top: ${props.$position.top}px;
      left: ${props.$position.left}px;
      transform-origin: ${props.$position.transformOrigin};
      transform: scale(1);
    `;
  }}

  /* 
   * SMOOTH TRANSITIONS: Only apply transitions for opacity and scale
   * Position changes are instant to prevent the sliding effect
   */
  transition: opacity var(--duration-normal) var(--ease-in-out),
              visibility var(--duration-normal) var(--ease-in-out),
              transform var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: scale(1) !important;
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    min-width: 20rem;
    max-width: calc(100vw - 2rem);
  }
`;

const MenuHeader = styled.div`
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-100);
  background-color: var(--color-grey-25);
`;

const MenuHeaderText = styled.div`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * REDESIGNED POSITIONING HOOK
 * Calculates optimal menu position based on trigger position and viewport space
 */
const useSmartMenuPosition = (isOpen, triggerRef, menuRef) => {
  const [position, setPosition] = useState(null);
  const [isPositioned, setIsPositioned] = useState(false);

  // Reset positioning state when menu closes
  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      setIsPositioned(false);
    }
  }, [isOpen]);

  const calculatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual menu dimensions if available, otherwise estimate
    let menuWidth = 384; // 24rem default
    let menuHeight = 400; // estimated height

    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      if (menuRect.width > 0) menuWidth = menuRect.width;
      if (menuRect.height > 0) menuHeight = menuRect.height;
    }

    // Calculate available space in each direction
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.left;
    const spaceLeft = triggerRect.right;

    // Determine optimal vertical position
    const shouldOpenUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const vertical = shouldOpenUpward ? "top" : "bottom";

    // Determine optimal horizontal position
    const shouldOpenLeft = spaceRight < menuWidth && spaceLeft > spaceRight;
    const horizontal = shouldOpenLeft ? "left" : "right";

    // Calculate exact pixel positions
    let top, left;

    if (vertical === "bottom") {
      top = triggerRect.bottom + 4;
    } else {
      top = triggerRect.top - menuHeight - 4;
    }

    if (horizontal === "right") {
      left = triggerRect.right - menuWidth;
    } else {
      left = triggerRect.left;
    }

    // Ensure menu stays within viewport bounds
    const viewportPadding = 48;
    left = Math.max(
      viewportPadding,
      Math.min(left, viewportWidth - menuWidth - viewportPadding)
    );
    top = Math.max(
      viewportPadding,
      Math.min(top, viewportHeight - menuHeight - viewportPadding)
    );

    // Calculate transform origin for smooth scaling animation
    const originX = horizontal === "right" ? "right" : "left";
    const originY = vertical === "bottom" ? "top" : "bottom";
    const transformOrigin = `${originY} ${originX}`;

    const newPosition = {
      top,
      left,
      vertical,
      horizontal,
      transformOrigin,
    };

    setPosition(newPosition);
    setIsPositioned(true);
  }, [isOpen, triggerRef, menuRef]);

  // Calculate position immediately when menu opens
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [isOpen, calculatePosition]);

  // Recalculate on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleRecalculate = () => {
      calculatePosition();
    };

    window.addEventListener("scroll", handleRecalculate, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", handleRecalculate, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleRecalculate, {
        capture: true,
      });
      window.removeEventListener("resize", handleRecalculate);
    };
  }, [isOpen, calculatePosition]);

  return { position, isPositioned };
};

/**
 * Enhanced ContextMenu component with extracted reusable hooks
 *
 * Features:
 * - Smart positioning that avoids viewport edges
 * - Reusable hooks for outside clicks, escape key, and keyboard navigation
 * - Modular MenuItem and MenuItemGroup components
 * - Portal rendering to escape container boundaries
 * - Full accessibility support
 */
function ContextMenu({
  children,
  items = [],
  onItemClick,
  disabled = false,
  triggerIcon = HiOutlineEllipsisVertical,
  triggerProps = {},
  header,
  className = "",
  showDescriptions = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Use the redesigned smart positioning hook
  const { position, isPositioned } = useSmartMenuPosition(
    isOpen,
    triggerRef,
    menuRef
  );

  // Use extracted reusable hooks
  useClickOutside([menuRef, triggerRef], () => setIsOpen(false), isOpen);
  useEscapeKey(() => setIsOpen(false), isOpen, triggerRef);
  useKeyboardNavigation(menuRef, '[role="menuitem"]:not(:disabled)', isOpen, {
    onEnter: (element) => {
      element.click(); // Trigger the menu item click
    },
  });

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item) => {
    setIsOpen(false);

    if (onItemClick) {
      onItemClick(item);
    }

    if (item.onClick) {
      item.onClick(item);
    }
  };

  const TriggerIcon = triggerIcon;

  // Group items by group property for organized menu sections
  const groupedItems = items.reduce((groups, item) => {
    const group = item.group || "default";
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});

  // Only show menu when isOpen AND we have calculated position
  const shouldShowMenu = isOpen && isPositioned && position;

  return (
    <ContextMenuContainer className={className}>
      {/* TRIGGER BUTTON */}
      {children ? (
        <div ref={triggerRef} onClick={handleToggle}>
          {children}
        </div>
      ) : (
        <IconButton
          ref={triggerRef}
          variant="ghost"
          size="small"
          onClick={handleToggle}
          disabled={disabled}
          aria-label="More actions"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          {...triggerProps}
        >
          <TriggerIcon />
        </IconButton>
      )}

      {/* MENU DROPDOWN IN PORTAL */}
      <Portal>
        <ContextMenuDropdown
          ref={menuRef}
          $isVisible={shouldShowMenu}
          $position={position}
          role="menu"
        >
          {header && (
            <MenuHeader>
              <MenuHeaderText>{header}</MenuHeaderText>
            </MenuHeader>
          )}

          {Object.entries(groupedItems).map(([groupName, groupItems]) => (
            <MenuItemGroup key={groupName}>
              {groupItems.map((item, itemIndex) => (
                <MenuItem
                  key={item.key || `${groupName}-${itemIndex}`}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  shortcut={item.shortcut}
                  variant={item.variant}
                  disabled={item.disabled}
                  showDescription={showDescriptions}
                  onClick={() => handleItemClick(item)}
                  aria-label={item.ariaLabel || item.label}
                />
              ))}
            </MenuItemGroup>
          ))}
        </ContextMenuDropdown>
      </Portal>
    </ContextMenuContainer>
  );
}

ContextMenu.propTypes = {
  children: PropTypes.node,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.elementType,
      onClick: PropTypes.func,
      disabled: PropTypes.bool,
      variant: PropTypes.oneOf(["default", "primary", "danger"]),
      group: PropTypes.string,
      shortcut: PropTypes.string,
      ariaLabel: PropTypes.string,
    })
  ),
  onItemClick: PropTypes.func,
  disabled: PropTypes.bool,
  triggerIcon: PropTypes.elementType,
  triggerProps: PropTypes.object,
  header: PropTypes.string,
  className: PropTypes.string,
  showDescriptions: PropTypes.bool,
};

export default ContextMenu;
