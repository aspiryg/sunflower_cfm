import { useEffect } from "react";

/**
 * Custom hook for keyboard navigation in lists/menus
 *
 * @param {React.RefObject} containerRef - Container element ref
 * @param {string} itemSelector - CSS selector for navigable items
 * @param {boolean} enabled - Whether navigation is active
 * @param {Object} options - Navigation options
 *
 * Options:
 * - loop: Whether to loop from last to first item (default: true)
 * - orientation: 'vertical' | 'horizontal' (default: 'vertical')
 * - onEnter: Function to call when Enter is pressed on an item
 *
 * Usage:
 * useKeyboardNavigation(menuRef, '[role="menuitem"]:not(:disabled)', isOpen);
 */
export function useKeyboardNavigation(
  containerRef,
  itemSelector,
  enabled = true,
  options = {}
) {
  const { loop = true, orientation = "vertical", onEnter = null } = options;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const handleKeyDown = (event) => {
      const items = containerRef.current?.querySelectorAll(itemSelector);
      if (!items?.length) return;

      const itemsArray = Array.from(items);
      const currentIndex = itemsArray.findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex = currentIndex;

      // Determine navigation keys based on orientation
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          if (currentIndex < itemsArray.length - 1) {
            nextIndex = currentIndex + 1;
          } else if (loop) {
            nextIndex = 0;
          }
          itemsArray[nextIndex].focus();
          break;

        case prevKey:
          event.preventDefault();
          if (currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (loop) {
            nextIndex = itemsArray.length - 1;
          }
          itemsArray[nextIndex].focus();
          break;

        case "Home":
          event.preventDefault();
          itemsArray[0].focus();
          break;

        case "End":
          event.preventDefault();
          itemsArray[itemsArray.length - 1].focus();
          break;

        case "Enter":
        case " ": // Space key
          if (onEnter && currentIndex >= 0) {
            event.preventDefault();
            onEnter(itemsArray[currentIndex], currentIndex);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, containerRef, itemSelector, loop, orientation, onEnter]);
}

export default useKeyboardNavigation;
