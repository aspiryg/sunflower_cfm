import { createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { createPortal } from "react-dom";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXCircle,
  HiOutlineInformationCircle,
  HiOutlineXMark,
} from "react-icons/hi2";

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  pointer-events: none;

  @media (max-width: 640px) {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
`;

const ToastItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 320px;
  max-width: 500px;
  pointer-events: auto;
  animation: ${(props) => (props.$isLeaving ? slideOut : slideIn)} 0.3s
    ease-in-out;

  ${(props) =>
    props.$variant === "success" &&
    `
    border-left: 4px solid var(--color-success-500);
  `}

  ${(props) =>
    props.$variant === "error" &&
    `
    border-left: 4px solid var(--color-error-500);
  `}
  
  ${(props) =>
    props.$variant === "warning" &&
    `
    border-left: 4px solid var(--color-warning-500);
  `}
  
  ${(props) =>
    props.$variant === "info" &&
    `
    border-left: 4px solid var(--color-info-500);
  `}
  
  @media (max-width: 640px) {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
`;

const ToastIcon = styled.div`
  margin-top: 2px;

  ${(props) =>
    props.$variant === "success" &&
    `
    color: var(--color-success-600);
  `}

  ${(props) =>
    props.$variant === "error" &&
    `
    color: var(--color-error-600);
  `}
  
  ${(props) =>
    props.$variant === "warning" &&
    `
    color: var(--color-warning-600);
  `}
  
  ${(props) =>
    props.$variant === "info" &&
    `
    color: var(--color-info-600);
  `}
  
  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const ToastContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const ToastTitle = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  line-height: 1.4;
`;

const ToastMessage = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  line-height: 1.4;
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-grey-400);
  cursor: pointer;
  padding: 2px;
  border-radius: var(--border-radius-sm);
  transition: color var(--duration-normal) var(--ease-in-out);

  &:hover {
    color: var(--color-grey-600);
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const ToastContext = createContext();

const TOAST_ICONS = {
  success: HiOutlineCheckCircle,
  error: HiOutlineXCircle,
  warning: HiOutlineExclamationTriangle,
  info: HiOutlineInformationCircle,
};

const TOAST_TITLES = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Information",
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = "info", options = {}) => {
    const {
      title = TOAST_TITLES[variant],
      duration = variant === "error" ? 5000 : 3000,
      id = Date.now() + Math.random(),
    } = options;

    const toast = {
      id,
      message,
      variant,
      title,
      duration,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto remove toast
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message, options) => {
      return addToast(message, "success", options);
    },
    [addToast]
  );

  const error = useCallback(
    (message, options) => {
      return addToast(message, "error", options);
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options) => {
      return addToast(message, "warning", options);
    },
    [addToast]
  );

  const info = useCallback(
    (message, options) => {
      return addToast(message, "info", options);
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <ToastContainer>
          {toasts.map((toast) => {
            const IconComponent = TOAST_ICONS[toast.variant];
            return (
              <ToastItem key={toast.id} $variant={toast.variant}>
                <ToastIcon $variant={toast.variant}>
                  <IconComponent />
                </ToastIcon>
                <ToastContent>
                  <ToastTitle>{toast.title}</ToastTitle>
                  <ToastMessage>{toast.message}</ToastMessage>
                </ToastContent>
                <ToastCloseButton onClick={() => removeToast(toast.id)}>
                  <HiOutlineXMark />
                </ToastCloseButton>
              </ToastItem>
            );
          })}
        </ToastContainer>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastProvider;
