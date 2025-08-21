import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineXMark } from "react-icons/hi2";
import IconButton from "./IconButton";
import Button from "./Button";
import Text from "./Text";

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
`;

// Styled components with higher z-index
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999; /* Very high z-index to ensure it's above everything */
  animation: ${fadeIn} var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  animation: ${slideIn} var(--duration-normal) var(--ease-in-out);
  z-index: 10000; /* Even higher to ensure modal content is on top */

  ${(props) =>
    props.$size === "sm" &&
    `
    width: 40rem;
    max-width: 40rem;
  `}

  ${(props) =>
    props.$size === "md" &&
    `
    width: 50rem;
    max-width: 50rem;
  `}
  
  ${(props) =>
    props.$size === "lg" &&
    `
    width: 60rem;
    max-width: 60rem;
  `}
  
  ${(props) =>
    props.$size === "xl" &&
    `
    width: 70rem;
    max-width: 70rem;
  `}
  
  ${(props) =>
    props.$isClosing &&
    `
    animation: ${slideOut} var(--duration-fast) var(--ease-in-out);
  `}
  
  @media (max-width: 768px) {
    width: 95vw;
    max-width: 95vw;
    max-height: 95vh;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-25);
`;

const ModalHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  min-width: 0;
`;

const ModalTitle = styled.h2`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  margin: 0;
`;

const ModalDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  margin: 0;
`;

const ModalBody = styled.div`
  padding: var(--spacing-6);
  overflow-y: auto;
  max-height: calc(90vh - 20rem);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
    max-height: calc(95vh - 16rem);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-25);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: var(--spacing-2);

    & > * {
      width: 100%;
      justify-content: center;
    }
  }
`;

/**
 * Generic Modal Component
 *
 * Features:
 * - Portal rendering for proper z-index management
 * - Keyboard navigation (ESC to close, focus trapping)
 * - Smooth animations with reduced motion support
 * - Responsive design for mobile devices
 * - Customizable size variants
 * - Accessibility compliant (ARIA attributes, focus management)
 * - High z-index to ensure it appears above all other content
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {string} description - Optional modal description
 * @param {string} size - Size variant ('sm', 'md', 'lg', 'xl')
 * @param {boolean} closeOnOverlayClick - Whether clicking overlay closes modal
 * @param {boolean} closeOnEscape - Whether ESC key closes modal
 * @param {boolean} showCloseButton - Whether to show X close button
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Optional custom footer content
 */
function Modal({
  isOpen = false,
  onClose,
  title,
  description,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  footer,
  className = "",
  ...props
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement;

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus and scroll
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  // Handle focus trap
  const handleKeyDown = (event) => {
    if (event.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer
        ref={modalRef}
        $size={size}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        {...props}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            <ModalHeaderContent>
              {title && <ModalTitle id="modal-title">{title}</ModalTitle>}
              {description && (
                <ModalDescription id="modal-description">
                  {description}
                </ModalDescription>
              )}
            </ModalHeaderContent>

            {showCloseButton && (
              <IconButton
                variant="ghost"
                size="medium"
                onClick={onClose}
                aria-label="Close modal"
              >
                <HiOutlineXMark />
              </IconButton>
            )}
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );

  // Render to portal for proper z-index management
  return createPortal(modalContent, document.body);
}

/**
 * Confirmation Modal - Specialized modal for confirmations
 *
 * @param {string} variant - Style variant ('danger', 'warning', 'info')
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @param {function} onConfirm - Callback when confirmed
 * @param {boolean} isLoading - Whether confirm action is loading
 * @param {boolean} destructive - Whether this is a destructive action
 */
export function ConfirmationModal({
  variant = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
  disabled = false,
  onConfirm,
  onClose,
  isLoading = false,
  destructive = false,
  children,
  ...modalProps
}) {
  const handleConfirm = () => {
    onConfirm?.();
  };

  const confirmVariant = destructive ? "danger" : "primary";

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={confirmVariant}
        onClick={handleConfirm}
        loading={isLoading}
        disabled={disabled || isLoading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      {...modalProps}
      onClose={onClose}
      size="sm"
      footer={footer}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      {children}
    </Modal>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
};

ConfirmationModal.propTypes = {
  ...Modal.propTypes,
  variant: PropTypes.oneOf(["danger", "warning", "info"]),
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  destructive: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Modal;
