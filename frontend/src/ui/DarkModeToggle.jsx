import { useState, useRef, useEffect } from "react";
import styled, { css, keyframes } from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineComputerDesktop,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import { useTheme } from "../contexts/ThemeContext";
import IconButton from "./IconButton";
import Text from "./Text";

const ThemeToggleContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ThemeToggleButton = styled(IconButton)`
  position: relative;
  overflow: hidden;
`;

const IconWrapper = styled.div`
  position: relative;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const rotateIn = keyframes`
  from {
    transform: rotate(-180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
`;

const rotateOut = keyframes`
  from {
    transform: rotate(0deg) scale(1);
    opacity: 1;
  }
  to {
    transform: rotate(180deg) scale(0);
    opacity: 0;
  }
`;

const ThemeIcon = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  /* Animation for entering icon */
  ${(props) =>
    props.$isActive &&
    css`
      animation: ${rotateIn} var(--duration-normal) var(--ease-in-out) forwards;
    `}

  /* Animation for exiting icon */
  ${(props) =>
    !props.$isActive &&
    props.$wasActive &&
    css`
      animation: ${rotateOut} var(--duration-normal) var(--ease-in-out) forwards;
    `}

  /* Hide non-active icons by default */
  ${(props) =>
    !props.$isActive &&
    !props.$wasActive &&
    css`
      opacity: 0;
      transform: scale(0);
    `}

  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    opacity: ${(props) => (props.$isActive ? 1 : 0)};
    transform: ${(props) => (props.$isActive ? "scale(1)" : "scale(0)")};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  min-width: 16rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-8px)"};
  transition: all var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;

const DropdownHeader = styled.div`
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ThemeOptionsList = styled.div`
  padding: var(--spacing-2) 0;
`;

const ThemeOption = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
  }

  ${(props) =>
    props.$isActive &&
    css`
      background-color: var(--color-brand-100);
      color: var(--color-brand-700);
      font-weight: var(--font-weight-semibold);
    `}

  svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-500);
    flex-shrink: 0;
  }

  &:hover svg,
  &:focus svg {
    color: var(--color-grey-600);
  }

  ${(props) =>
    props.$isActive &&
    css`
      svg {
        color: var(--color-brand-600);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const QuickToggle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-500);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
    transform: ${(props) =>
      props.$isOpen ? "rotate(180deg)" : "rotate(0deg)"};
    transition: transform var(--duration-normal) var(--ease-in-out);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    svg {
      transition: none;
    }
  }
`;

const themeOptions = [
  {
    value: "light",
    label: "Light",
    icon: HiOutlineSun,
    description: "Always use light theme",
  },
  {
    value: "dark",
    label: "Dark",
    icon: HiOutlineMoon,
    description: "Always use dark theme",
  },
  {
    value: "system",
    label: "System",
    icon: HiOutlineComputerDesktop,
    description: "Follow system preference",
  },
];

function DarkModeToggle({
  variant = "icon-only", // "icon-only" | "with-dropdown"
  className = "",
}) {
  const { theme, actualTheme, isDark, toggleTheme, setTheme, themes } =
    useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [previousTheme, setPreviousTheme] = useState(actualTheme);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  // Track theme changes for animations
  useEffect(() => {
    if (actualTheme !== previousTheme) {
      setPreviousTheme(actualTheme);
    }
  }, [actualTheme, previousTheme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isDropdownOpen]);

  const handleQuickToggle = () => {
    toggleTheme();
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleThemeSelect = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsDropdownOpen(false);
  };

  const getCurrentIcon = () => {
    if (theme === themes.SYSTEM) {
      return HiOutlineComputerDesktop;
    }
    return isDark ? HiOutlineMoon : HiOutlineSun;
  };

  const CurrentIcon = getCurrentIcon();

  if (variant === "icon-only") {
    return (
      <ThemeToggleButton
        variant="ghost"
        size="medium"
        onClick={handleQuickToggle}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className={className}
      >
        <IconWrapper>
          <ThemeIcon $isActive={true}>
            <CurrentIcon />
          </ThemeIcon>
        </IconWrapper>
      </ThemeToggleButton>
    );
  }

  return (
    <ThemeToggleContainer ref={containerRef} className={className}>
      <QuickToggle>
        <ThemeToggleButton
          variant="ghost"
          size="medium"
          onClick={handleQuickToggle}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          <IconWrapper>
            {themeOptions.map((option) => {
              const IconComponent = option.icon;
              const isActive =
                (theme === themes.SYSTEM && option.value === "system") ||
                (theme !== themes.SYSTEM && actualTheme === option.value);
              const wasActive =
                previousTheme === option.value && theme !== themes.SYSTEM;

              return (
                <ThemeIcon
                  key={option.value}
                  $isActive={isActive}
                  $wasActive={wasActive}
                >
                  <IconComponent />
                </ThemeIcon>
              );
            })}
          </IconWrapper>
        </ThemeToggleButton>

        <ExpandButton
          onClick={handleDropdownToggle}
          $isOpen={isDropdownOpen}
          aria-label="Theme options"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          <HiOutlineChevronDown />
        </ExpandButton>
      </QuickToggle>

      <DropdownMenu ref={dropdownRef} $isOpen={isDropdownOpen} role="menu">
        <DropdownHeader>
          <Text size="sm" weight="semibold">
            Choose Theme
          </Text>
        </DropdownHeader>

        <ThemeOptionsList>
          {themeOptions.map((option) => (
            <ThemeOption
              key={option.value}
              onClick={() => handleThemeSelect(option.value)}
              $isActive={theme === option.value}
              role="menuitem"
            >
              <option.icon />
              <div>
                <Text size="sm" weight="medium">
                  {option.label}
                </Text>
                <Text size="xs" color="muted">
                  {option.description}
                </Text>
              </div>
            </ThemeOption>
          ))}
        </ThemeOptionsList>
      </DropdownMenu>
    </ThemeToggleContainer>
  );
}

DarkModeToggle.propTypes = {
  variant: PropTypes.oneOf(["icon-only", "with-dropdown"]),
  className: PropTypes.string,
};

export default DarkModeToggle;
