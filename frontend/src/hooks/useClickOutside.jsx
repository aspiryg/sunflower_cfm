import { useEffect } from "react";

/**
 * Custom hook to handle clicks outside of specified elements
 *
 * @param {Array<React.RefObject>|React.RefObject} refs - Array of refs or single ref to check against
 * @param {Function} handler - Function to call when click is outside
 * @param {boolean} enabled - Whether the hook is active
 * @param {boolean} useCapture - Whether to use capture phase (default: true)
 *
 * Usage:
 * useClickOutside([menuRef, triggerRef], handleClose, isOpen);
 */
export function useClickOutside(
  refs,
  handler,
  enabled = true,
  useCapture = true
) {
  useEffect(() => {
    if (!enabled || !handler) return;

    const handleClickOutside = (event) => {
      // Convert single ref to array for consistency
      const refsArray = Array.isArray(refs) ? refs : [refs];

      // Check if click is outside all specified elements
      const isOutside = refsArray.every((ref) => {
        if (!ref?.current) return true;
        return !ref.current.contains(event.target);
      });

      if (isOutside) {
        handler(event);
      }
    };

    // Use capture phase for more reliable detection
    document.addEventListener("mousedown", handleClickOutside, useCapture);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, useCapture);
    };
  }, [refs, handler, enabled, useCapture]);
}

export default useClickOutside;
