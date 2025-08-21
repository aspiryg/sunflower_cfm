import { useState } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiEye, HiEyeSlash, HiLockClosed } from "react-icons/hi2";

const sizes = {
  small: css`
    height: var(--input-height-sm);
    padding: 0 var(--spacing-3);
    font-size: var(--font-size-sm);
  `,
  medium: css`
    height: var(--input-height-md);
    padding: 0 var(--spacing-4);
    font-size: var(--font-size-base);
  `,
  large: css`
    height: var(--input-height-lg);
    padding: 0 var(--spacing-5);
    font-size: var(--font-size-lg);
  `,
};

const variants = {
  default: css`
    border: 1px solid var(--color-grey-300);
    background-color: var(--color-grey-0);

    &:hover:not(:disabled) {
      border-color: var(--color-grey-400);
    }

    &:focus-within {
      border-color: var(--color-brand-500);
      box-shadow: 0 0 0 3px var(--color-brand-100);
    }
  `,
  error: css`
    border: 1px solid var(--color-error-500);
    background-color: var(--color-error-50);

    &:hover:not(:disabled) {
      border-color: var(--color-error-600);
    }

    &:focus-within {
      border-color: var(--color-error-500);
      box-shadow: 0 0 0 3px var(--color-error-100);
    }
  `,
  success: css`
    border: 1px solid var(--color-success-500);
    background-color: var(--color-success-50);

    &:hover:not(:disabled) {
      border-color: var(--color-success-600);
    }

    &:focus-within {
      border-color: var(--color-success-500);
      box-shadow: 0 0 0 3px var(--color-success-100);
    }
  `,
  warning: css`
    border: 1px solid var(--color-warning-500);
    background-color: var(--color-warning-50);

    &:hover:not(:disabled) {
      border-color: var(--color-warning-600);
    }

    &:focus-within {
      border-color: var(--color-warning-500);
      box-shadow: 0 0 0 3px var(--color-warning-100);
    }
  `,
};

const PasswordContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  border-radius: var(--border-radius-md);
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Full width */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  /* Disabled state */
  ${(props) =>
    props.$disabled &&
    css`
      background-color: var(--color-grey-100);
      border-color: var(--color-grey-200);
      cursor: not-allowed;

      &:hover {
        border-color: var(--color-grey-200);
      }
    `}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${(props) =>
      props.$responsive &&
      css`
        height: var(--input-height-sm);
        padding: 0 var(--spacing-3);
        font-size: var(--font-size-sm);
      `}
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const PasswordInputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--color-grey-700);
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  height: 100%;

  /* Hide all browser password controls */
  &::-ms-reveal,
  &::-ms-clear {
    display: none !important;
    visibility: hidden !important;
  }

  &::-webkit-credentials-auto-fill-button {
    display: none !important;
    visibility: hidden !important;
  }

  &::-webkit-textfield-decoration-container {
    display: none !important;
    visibility: hidden !important;
  }

  /* Force password masking */
  &[type="password"] {
    -webkit-text-security: disc;
  }

  /* Placeholder styling */
  &::placeholder {
    color: var(--color-grey-500);
    opacity: 1;
  }

  /* Disabled state */
  &:disabled {
    color: var(--color-grey-500);
    cursor: not-allowed;

    &::placeholder {
      color: var(--color-grey-400);
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-1);
  color: var(--color-grey-500);
  flex-shrink: 0;

  ${(props) =>
    props.$position === "left" &&
    css`
      margin-right: var(--spacing-2);
    `}

  ${(props) =>
    props.$position === "right" &&
    css`
      margin-left: var(--spacing-2);
    `}

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  border-radius: var(--border-radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
  margin-left: var(--spacing-2);

  &:hover:not(:disabled) {
    color: var(--color-grey-700);
    background-color: var(--color-grey-100);
  }

  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    color: var(--color-brand-600);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      color: var(--color-grey-500);
      background-color: transparent;
    }
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:active {
      transform: none;
    }
  }
`;

/**
 * Enhanced Password Input Component
 * Completely custom implementation to avoid browser conflicts
 */
function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  disabled = false,
  variant = "default",
  size = "medium",
  fullWidth = true,
  responsive = false,
  className = "",
  showPasswordToggle = true,
  autoComplete = "current-password",
  ...htmlProps
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <PasswordContainer
      $size={size}
      $variant={variant}
      $fullWidth={fullWidth}
      $responsive={responsive}
      $disabled={disabled}
      className={className}
    >
      {/* Left Icon - Lock */}
      <IconWrapper $position="left">
        <HiLockClosed />
      </IconWrapper>

      {/* Password Input Field */}
      <PasswordInputField
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        {...htmlProps}
      />

      {/* Right Icon - Toggle Visibility */}
      {showPasswordToggle && (
        <ToggleButton
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <HiEyeSlash /> : <HiEye />}
        </ToggleButton>
      )}
    </PasswordContainer>
  );
}

PasswordInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  fullWidth: PropTypes.bool,
  responsive: PropTypes.bool,
  className: PropTypes.string,
  showPasswordToggle: PropTypes.bool,
  autoComplete: PropTypes.string,
};

export default PasswordInput;
