import { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiChevronDown, HiCheck } from "react-icons/hi2";

const sizes = {
  small: css`
    height: var(--input-height-sm);
    padding: 0 var(--spacing-8) 0 var(--spacing-3);
    font-size: var(--font-size-xs);
  `,
  medium: css`
    height: var(--input-height-md);
    padding: 0 var(--spacing-10) 0 var(--spacing-4);
    font-size: var(--font-size-sm);
  `,
  large: css`
    height: var(--input-height-lg);
    padding: 0 var(--spacing-12) 0 var(--spacing-5);
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

    &:focus {
      outline: none;
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

    &:focus {
      outline: none;
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

    &:focus {
      outline: none;
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

    &:focus {
      outline: none;
      border-color: var(--color-warning-500);
      box-shadow: 0 0 0 3px var(--color-warning-100);
    }
  `,
};

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const SelectTrigger = styled.button`
  width: 100%;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  transition: all var(--duration-normal) var(--ease-in-out);
  font-family: inherit;
  cursor: pointer;
  background: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant]}

  /* Error state */
  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);
      background-color: var(--color-error-50);

      &:hover:not(:disabled) {
        border-color: var(--color-error-600);
      }

      &:focus {
        outline: none;
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  /* Full width */
  ${(props) =>
    props.$fullWidth &&
    css`
      width: 100%;
    `}

  /* Open state */
  ${(props) =>
    props.$isOpen &&
    css`
      border-color: var(--color-brand-500);
      box-shadow: 0 0 0 3px var(--color-brand-100);
    `}

  /* Disabled state */
  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
    border-color: var(--color-grey-200);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    ${(props) =>
      props.$responsive &&
      css`
        height: var(--input-height-sm);
        padding: 0 var(--spacing-8) 0 var(--spacing-3);
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

const SelectValue = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block; /* Ensure it's displayed as block */
  line-height: 1.5; /* Ensure proper line height */

  ${(props) =>
    props.$isPlaceholder &&
    css`
      color: var(--color-grey-500);
      font-style: italic;
    `}
`;

const SelectIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-grey-500);
  margin-left: var(--spacing-2);
  transition: transform var(--duration-normal) var(--ease-in-out);

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  ${(props) =>
    props.$isOpen &&
    css`
      transform: rotate(180deg);
    `}

  ${(props) =>
    props.$disabled &&
    css`
      color: var(--color-grey-400);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: var(--spacing-1);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all var(--duration-fast) var(--ease-in-out);
  max-height: 32rem;
  overflow-y: auto;

  ${(props) =>
    props.$isOpen &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    `}

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-grey-50);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-grey-400);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--duration-fast) ease;
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const OptionItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  position: relative;

  &:hover {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
    transform: translateX(2px);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      background-color: var(--color-brand-100);
      color: var(--color-brand-800);
      font-weight: var(--font-weight-semibold);

      &:hover {
        background-color: var(--color-brand-100);
        color: var(--color-brand-800);
      }
    `}

  ${(props) =>
    props.$isDisabled &&
    css`
      color: var(--color-grey-400);
      cursor: not-allowed;
      background-color: var(--color-grey-25);

      &:hover {
        background-color: var(--color-grey-25);
        color: var(--color-grey-400);
        transform: none;
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: background-color var(--duration-fast) ease;

    &:hover {
      transform: none;
    }
  }
`;

const OptionLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionCheck = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  margin-left: var(--spacing-2);
  color: var(--color-brand-600);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-fast) var(--ease-in-out);

  ${(props) =>
    props.$isVisible &&
    css`
      opacity: 1;
      transform: scale(1);
    `}

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--duration-fast) ease;
    transform: none;
  }
`;

const EmptyState = styled.div`
  padding: var(--spacing-4);
  text-align: center;
  color: var(--color-grey-500);
  font-size: var(--font-size-sm);
  font-style: italic;
`;

/**
 * Enhanced Select component with beautiful styled dropdown
 * Features custom dropdown with hover effects, selection indicators, and smooth animations
 */
function StyledSelect({
  // Enhanced props for options array
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  emptyMessage = "No options available",

  // Original Select props
  size = "medium",
  variant = "default",
  fullWidth = true,
  responsive = false,
  disabled = false,
  className = "",
  $hasError = false,

  // Standard HTML select props
  ...htmlProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  // Get the currently selected option
  const getSelectedOption = () => {
    if (!value || !options.length) return null;

    return options.find((option) => {
      if (typeof option === "string") {
        return option === value;
      }
      return option.value === value || String(option.value) === String(value);
    });
  };

  const selectedOption = getSelectedOption();

  // Get display value - FIXED: Better handling of display value
  const displayValue = selectedOption
    ? typeof selectedOption === "string"
      ? selectedOption
      : selectedOption.label
    : "";

  //   // Enhanced debug logging to check if displayValue is actually being used
  //   useEffect(() => {
  //     console.log("StyledSelect Debug:", {
  //       value,
  //       valueType: typeof value,
  //       options,
  //       selectedOption,
  //       displayValue,
  //       isPlaceholder: !displayValue, // This is what controls the placeholder styling
  //     });
  //   }, [value, options, selectedOption, displayValue]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case "ArrowDown":
        case "ArrowUp":
          event.preventDefault();
          // TODO: Implement keyboard navigation between options
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          // TODO: Select currently focused option
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option) => {
    const optionValue = typeof option === "string" ? option : option.value;
    const isDisabled = typeof option === "object" && option.disabled;

    if (!isDisabled && onChange) {
      onChange(optionValue);
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <SelectContainer ref={containerRef} className={className}>
      <SelectTrigger
        ref={triggerRef}
        type="button"
        $size={size}
        $variant={variant}
        $fullWidth={fullWidth}
        $responsive={responsive}
        $isOpen={isOpen}
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        $hasError={$hasError}
        {...htmlProps}
      >
        <SelectValue $isPlaceholder={!displayValue}>
          {displayValue || placeholder}
        </SelectValue>

        <SelectIcon $isOpen={isOpen} $disabled={disabled}>
          <HiChevronDown />
        </SelectIcon>
      </SelectTrigger>

      <DropdownContainer $isOpen={isOpen}>
        {options.length === 0 ? (
          <EmptyState>{emptyMessage}</EmptyState>
        ) : (
          <OptionsList role="listbox">
            {options.map((option, index) => {
              // Handle both string options and object options
              const optionValue =
                typeof option === "string" ? option : option.value;
              const optionLabel =
                typeof option === "string" ? option : option.label;
              const isDisabled = typeof option === "object" && option.disabled;
              // FIXED: More robust selection comparison
              const isSelected = String(optionValue) === String(value);
              return (
                <OptionItem
                  key={`${optionValue}-${index}`} // More unique key
                  role="option"
                  aria-selected={isSelected}
                  $isSelected={isSelected}
                  $isDisabled={isDisabled}
                  onClick={() => handleOptionSelect(option)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOptionSelect(option);
                    }
                  }}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <OptionLabel>{optionLabel}</OptionLabel>

                  <OptionCheck $isVisible={isSelected}>
                    <HiCheck />
                  </OptionCheck>
                </OptionItem>
              );
            })}
          </OptionsList>
        )}
      </DropdownContainer>
    </SelectContainer>
  );
}

StyledSelect.propTypes = {
  // Enhanced props
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        label: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
      }),
    ])
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  emptyMessage: PropTypes.string,

  // Original props
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["default", "error", "success", "warning"]),
  fullWidth: PropTypes.bool,
  responsive: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default StyledSelect;
