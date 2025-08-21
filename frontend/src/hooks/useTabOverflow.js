import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Custom hook for managing tab overflow behavior
 * Handles scroll detection, visibility tracking, and navigation
 */
export function useTabOverflow() {
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState(new Set());
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  const checkScrollability = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setCanScrollLeft(scrollLeft > 1);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);

    // Check which tabs are visible
    const containerRect = container.getBoundingClientRect();
    const tabElements = container.querySelectorAll('[role="tab"]');
    const visible = new Set();

    tabElements.forEach((tab) => {
      const tabRect = tab.getBoundingClientRect();
      // More generous visibility check
      const isVisible =
        tabRect.left >= containerRect.left - 5 &&
        tabRect.right <= containerRect.right + 5;

      if (isVisible) {
        const tabValue = tab
          .getAttribute("aria-controls")
          ?.replace("tabpanel-", "");
        if (tabValue) {
          visible.add(tabValue);
        }
      }
    });

    setVisibleTabs(visible);
  }, []);

  const scrollLeft = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = Math.min(container.clientWidth * 0.7, 200);
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = Math.min(container.clientWidth * 0.7, 200);
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, []);

  const scrollToTab = useCallback((tabValue) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const tabElement = container.querySelector(
      `[aria-controls="tabpanel-${tabValue}"]`
    );

    if (tabElement) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();

      // Check if tab is fully visible
      const isVisible =
        tabRect.left >= containerRect.left &&
        tabRect.right <= containerRect.right;

      if (!isVisible) {
        // Calculate scroll position to center the tab
        const containerCenter = containerRect.left + containerRect.width / 2;
        const tabCenter = tabRect.left + tabRect.width / 2;
        const scrollAmount = tabCenter - containerCenter;

        container.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    }
  }, []);

  const toggleOverflowMenu = useCallback(() => {
    setShowOverflowMenu((prev) => !prev);
  }, []);

  const closeOverflowMenu = useCallback(() => {
    setShowOverflowMenu(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial check with slight delay to allow for layout
    const timeoutId = setTimeout(checkScrollability, 150);

    // Listen for scroll events
    container.addEventListener("scroll", checkScrollability, { passive: true });

    // Listen for resize events
    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize checks
      setTimeout(checkScrollability, 50);
    });
    resizeObserver.observe(container);

    // Listen for changes in tab content
    const mutationObserver = new MutationObserver(() => {
      // Debounce mutation checks
      setTimeout(checkScrollability, 50);
    });
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-controls", "role"],
    });

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", checkScrollability);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [checkScrollability]);

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    visibleTabs,
    showOverflowMenu,
    scrollLeft,
    scrollRight,
    scrollToTab,
    toggleOverflowMenu,
    closeOverflowMenu,
  };
}
