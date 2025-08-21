import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for calculating optimal menu position
 * Reusable for dropdowns, context menus, overflow menus, etc.
 */
export function useMenuPosition(isOpen, triggerRef, menuRef) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const calculatePosition = useCallback(() => {
    if (!isOpen || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual menu dimensions if available, otherwise estimate
    let menuWidth = 200; // default width
    let menuHeight = 300; // estimated height

    if (menuRef?.current) {
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

    // Determine optimal horizontal position
    const shouldOpenLeft = spaceRight < menuWidth && spaceLeft > spaceRight;

    // Calculate exact pixel positions
    let top, left;

    if (shouldOpenUpward) {
      top = triggerRect.top - menuHeight - 4;
    } else {
      top = triggerRect.bottom + 4;
    }

    if (shouldOpenLeft) {
      left = triggerRect.right - menuWidth;
    } else {
      left = triggerRect.left;
    }

    // Ensure menu stays within viewport bounds
    const viewportPadding = 8;
    left = Math.max(
      viewportPadding,
      Math.min(left, viewportWidth - menuWidth - viewportPadding)
    );
    top = Math.max(
      viewportPadding,
      Math.min(top, viewportHeight - menuHeight - viewportPadding)
    );

    setPosition({ top, left });
  }, [isOpen, triggerRef, menuRef]);

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen) {
      // Initial calculation
      calculatePosition();
      // Recalculate after a frame to ensure DOM is updated
      requestAnimationFrame(calculatePosition);
    }
  }, [isOpen, calculatePosition]);

  // Recalculate on scroll and resize
  useEffect(() => {
    if (!isOpen) return;

    const handleRecalculate = () => calculatePosition();

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

  return position;
}

export default useMenuPosition;
