import { useEffect } from "react";

/**
 * Custom hook to handle escape key press
 *
 * @param {Function} handler - Function to call when escape is pressed
 * @param {boolean} enabled - Whether the hook is active
 * @param {React.RefObject} focusRef - Optional ref to focus after escape
 *
 * Usage:
 * useEscapeKey(handleClose, isOpen, triggerRef);
 */
export function useEscapeKey(handler, enabled = true, focusRef = null) {
  useEffect(() => {
    if (!enabled || !handler) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handler(event);

        // Focus the specified element after handling escape
        if (focusRef?.current) {
          focusRef.current.focus();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handler, enabled, focusRef]);
}

export default useEscapeKey;
