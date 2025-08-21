import { useRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiEllipsisHorizontal,
} from "react-icons/hi2";

import Portal from "./Portal";
import useClickOutside from "../hooks/useClickOutside";
import useEscapeKey from "../hooks/useEscapeKey";
import useMenuPosition from "../hooks/useMenuPosition";

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background-color: var(--color-grey-0);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ScrollButton = styled.button`
  type: button; /* Explicitly set type to prevent form submission */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 4.8rem;
  background: linear-gradient(
    ${(props) =>
      props.$direction === "left"
        ? "90deg, var(--color-grey-0) 60%, transparent"
        : "270deg, var(--color-grey-0) 60%, transparent"}
  );
  border: none;
  cursor: pointer;
  color: var(--color-grey-500);
  transition: all var(--duration-fast) var(--ease-in-out);
  z-index: 10;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: var(--color-brand-600);
    background: linear-gradient(
      ${(props) =>
        props.$direction === "left"
          ? "90deg, var(--color-brand-25) 60%, transparent"
          : "270deg, var(--color-brand-25) 60%, transparent"}
    );
  }

  &:focus {
    outline: none;
    color: var(--color-brand-600);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Completely hide when not needed to save space */
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? "auto" : "none")};
  width: ${(props) => (props.$visible ? "3.2rem" : "0")};
  overflow: hidden;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 480px) {
    width: ${(props) => (props.$visible ? "2.8rem" : "0")};
    height: 4rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  }
`;

const OverflowButton = styled.button`
  type: button; /* Explicitly set type to prevent form submission */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 4.8rem;
  background-color: var(--color-grey-0);
  border: none;
  cursor: pointer;
  color: var(--color-grey-600);
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;
  flex-shrink: 0;

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-brand-25);
  }

  &:focus {
    outline: none;
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  }

  /* Show active state when menu is open */
  ${(props) =>
    props.$isActive &&
    `
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  `}

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 480px) {
    width: 2.8rem;
    height: 4rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  }
`;

const OverflowMenu = styled.div`
  position: fixed;
  min-width: 18rem;
  max-height: 32rem;
  overflow-y: auto;
  padding: var(--spacing-2);
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 10000;

  /* FIXED: Ensure menu can receive pointer events */
  pointer-events: auto;

  /* Animation */
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: all var(--duration-fast) var(--ease-in-out);

  @media (max-width: 640px) {
    min-width: 16rem;
    max-width: calc(100vw - var(--spacing-4));
  }
`;

const OverflowMenuItem = styled.button`
  type: button; /* Explicitly set type to prevent form submission */
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3);
  border: none;
  background: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
  text-align: left;
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  &:active {
    background-color: var(--color-brand-100);
    color: var(--color-brand-800);
  }

  ${(props) =>
    props.$isActive &&
    `
    background-color: var(--color-brand-100);
    color: var(--color-brand-800);
    font-weight: var(--font-weight-semibold);
  `}

  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }
`;

function TabOverflowControls({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  hiddenTabs = [],
  activeValue,
  onTabSelect,
  showOverflowMenu,
  onToggleOverflowMenu,
  onCloseOverflowMenu,
}) {
  const hasHiddenTabs = hiddenTabs.length > 0;
  const overflowButtonRef = useRef(null);
  const menuRef = useRef(null);

  // Use extracted hooks
  const menuPosition = useMenuPosition(
    showOverflowMenu,
    overflowButtonRef,
    menuRef
  );

  useClickOutside(
    [overflowButtonRef, menuRef],
    onCloseOverflowMenu,
    showOverflowMenu
  );

  useEscapeKey(onCloseOverflowMenu, showOverflowMenu, overflowButtonRef);

  // Fixed: Make sure handleTabSelect is properly defined and called
  const handleTabSelect = (tabValue) => {
    // console.log("Tab selected:", tabValue); // Debug log
    onTabSelect(tabValue);
    onCloseOverflowMenu();
  };

  return (
    <ControlsContainer>
      {/* Left scroll button */}
      <ScrollButton
        type="button"
        $direction="left"
        $visible={canScrollLeft}
        onClick={onScrollLeft}
        disabled={!canScrollLeft}
        aria-label="Scroll tabs left"
      >
        <HiOutlineChevronLeft />
      </ScrollButton>

      {/* Right scroll button or overflow menu trigger */}
      {hasHiddenTabs ? (
        <>
          <OverflowButton
            ref={overflowButtonRef}
            type="button"
            onClick={onToggleOverflowMenu}
            $isActive={showOverflowMenu}
            aria-label="Show hidden tabs"
            aria-expanded={showOverflowMenu}
            aria-haspopup="menu"
          >
            <HiEllipsisHorizontal />
          </OverflowButton>

          {/* FIXED: Menu rendering with proper click handlers */}
          {showOverflowMenu && (
            <Portal>
              <OverflowMenu
                ref={menuRef}
                id="tab-overflow-menu"
                role="menu"
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                }}
              >
                {hiddenTabs.map((tab) => (
                  <OverflowMenuItem
                    key={tab.value}
                    type="button"
                    onClick={() => handleTabSelect(tab.value)} // FIXED: Uncommented and properly calling handler
                    $isActive={activeValue === tab.value}
                    role="menuitem"
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    {tab.icon && <tab.icon />}
                    <span>{tab.label}</span>
                  </OverflowMenuItem>
                ))}
              </OverflowMenu>
            </Portal>
          )}
        </>
      ) : (
        <ScrollButton
          type="button"
          $direction="right"
          $visible={canScrollRight}
          onClick={onScrollRight}
          disabled={!canScrollRight}
          aria-label="Scroll tabs right"
        >
          <HiOutlineChevronRight />
        </ScrollButton>
      )}
    </ControlsContainer>
  );
}

TabOverflowControls.propTypes = {
  canScrollLeft: PropTypes.bool.isRequired,
  canScrollRight: PropTypes.bool.isRequired,
  onScrollLeft: PropTypes.func.isRequired,
  onScrollRight: PropTypes.func.isRequired,
  hiddenTabs: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ),
  activeValue: PropTypes.string,
  onTabSelect: PropTypes.func.isRequired,
  showOverflowMenu: PropTypes.bool.isRequired,
  onToggleOverflowMenu: PropTypes.func.isRequired,
  onCloseOverflowMenu: PropTypes.func.isRequired,
};

export default TabOverflowControls;
