import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import { useTabOverflow } from "../hooks/useTabOverflow";
import TabOverflowControls from "./TabOverflowControls";

// Context for managing tab state across all tab components
const TabsContext = createContext();

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%; /* Prevent container from exceeding viewport */
  overflow: hidden; /* Critical: prevent horizontal overflow */
`;

const TabsHeader = styled.div`
  display: flex;
  align-items: end;

  width: 100%;
  max-width: 100%; /* Ensure header doesn't exceed viewport */
  min-width: 0; /* Allow shrinking */
  border-bottom: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-0);
  overflow: hidden; /* Prevent header overflow */

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const TabsListContainer = styled.div`
  flex: 1;
  min-width: 0; /* Critical: allow container to shrink */
  overflow: hidden;
  position: relative;
`;

const TabsListStyled = styled.div`
  display: flex;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  /* Hide scrollbar completely */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Prevent text selection during scroll */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
`;

const TabsTriggerStyled = styled.button`
  type: button; /* Explicitly set type to prevent form submission */
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-600);
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all var(--duration-normal) var(--ease-in-out);
  flex-shrink: 0; /* Prevent individual tabs from shrinking */
  min-width: fit-content; /* Ensure minimum readable width */

  &:hover {
    color: var(--color-grey-800);
    background-color: var(--color-grey-50);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  /* Active state */
  ${(props) =>
    props.$isActive &&
    css`
      color: var(--color-brand-600);
      border-bottom-color: var(--color-brand-500);
      background-color: var(--color-brand-25);

      &:hover {
        color: var(--color-brand-700);
        background-color: var(--color-brand-50);
      }
    `}

  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--color-grey-400);

    &:hover {
      background-color: transparent;
      color: var(--color-grey-400);
    }
  }

  /* Error indicator */
  ${(props) =>
    props.$hasError &&
    css`
      color: var(--color-error-600);

      &::after {
        content: "";
        position: absolute;
        top: var(--spacing-2);
        right: var(--spacing-2);
        width: 6px;
        height: 6px;
        background-color: var(--color-error-500);
        border-radius: 50%;
      }
    `}

  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  /* Responsive behavior - gradually reduce padding and font size */
  @media (max-width: 768px) {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-xs);
    gap: var(--spacing-1);

    svg {
      width: 1.4rem;
      height: 1.4rem;
    }
  }

  /* More compact on small screens */
  @media (max-width: 640px) {
    padding: var(--spacing-2);

    /* Abbreviate long text */
    /* .tab-text {
      max-width: 10rem;
      overflow: hidden;
      text-overflow: ellipsis;
    } */
  }

  /* Very compact on extra small screens */
  @media (max-width: 480px) {
    padding: var(--spacing-1) var(--spacing-2);
    min-width: 4rem;

    /* .tab-text {
      max-width: 6rem;
      overflow: hidden;
      text-overflow: ellipsis;
    } */
  }

  /* Ultra compact - show initials or icons only */
  @media (max-width: 360px) {
    min-width: 3.6rem;
    padding: var(--spacing-1);

    /* .tab-text {
      display: none;
    } */

    /* Show first letter if no icon */
    &:not(:has(svg))::after {
      content: attr(data-initial);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
    }
  }
`;

const TabsContentStyled = styled.div`
  padding: var(--spacing-6);
  width: 100%;
  max-width: 100%; /* Prevent content overflow */
  overflow-x: auto; /* Allow horizontal scroll for content if needed */

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

// Navigation components (unchanged)
const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background-color: var(--color-grey-25);
  border-top: 1px solid var(--color-grey-200);
  width: 100%;
  max-width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-3);
  }
`;

const NavigationButton = styled.button`
  type: button; /* Explicitly set type to prevent form submission */
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover:not(:disabled) {
    background-color: var(--color-brand-50);
    border-color: var(--color-brand-300);
    color: var(--color-brand-700);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--color-grey-400);

    &:hover {
      background-color: var(--color-grey-0);
      border-color: var(--color-grey-300);
    }
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  @media (max-width: 640px) {
    flex: 1;
    justify-content: center;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    order: -1;
    width: 100%;
  }
`;

const ProgressText = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);
  font-weight: var(--font-weight-medium);
`;

const ProgressBar = styled.div`
  width: 20rem;
  height: 4px;
  background-color: var(--color-grey-200);
  border-radius: var(--border-radius-full);
  overflow: hidden;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: var(--color-brand-500);
  border-radius: var(--border-radius-full);
  transition: width var(--duration-normal) var(--ease-in-out);
  width: ${(props) => props.$progress}%;
`;

const NavigationActions = styled.div`
  display: flex;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    width: 100%;
  }
`;

/**
 * Main Tabs container component with overflow management
 */
function Tabs({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className = "",
  ...props
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [registeredTabs, setRegisteredTabs] = useState([]);

  const activeValue =
    controlledValue !== undefined ? controlledValue : internalValue;

  const handleValueChange = useCallback(
    (newValue) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [controlledValue, onValueChange]
  );

  const registerTab = useCallback((tabValue, tabLabel, tabIcon) => {
    setRegisteredTabs((prev) => {
      const exists = prev.find((tab) => tab.value === tabValue);
      if (exists) return prev;

      return [...prev, { value: tabValue, label: tabLabel, icon: tabIcon }];
    });
  }, []);

  const unregisterTab = useCallback((tabValue) => {
    setRegisteredTabs((prev) => prev.filter((tab) => tab.value !== tabValue));
  }, []);

  // Navigation helper functions
  const getCurrentTabIndex = useCallback(() => {
    return registeredTabs.findIndex((tab) => tab.value === activeValue);
  }, [registeredTabs, activeValue]);

  const canGoNext = useCallback(() => {
    const currentIndex = getCurrentTabIndex();
    return currentIndex < registeredTabs.length - 1 && currentIndex !== -1;
  }, [getCurrentTabIndex, registeredTabs.length]);

  const canGoPrevious = useCallback(() => {
    const currentIndex = getCurrentTabIndex();
    return currentIndex > 0;
  }, [getCurrentTabIndex]);

  const goToNext = useCallback(() => {
    const currentIndex = getCurrentTabIndex();
    if (canGoNext()) {
      const nextTab = registeredTabs[currentIndex + 1];
      handleValueChange(nextTab.value);
    }
  }, [getCurrentTabIndex, canGoNext, registeredTabs, handleValueChange]);

  const goToPrevious = useCallback(() => {
    const currentIndex = getCurrentTabIndex();
    if (canGoPrevious()) {
      const previousTab = registeredTabs[currentIndex - 1];
      handleValueChange(previousTab.value);
    }
  }, [getCurrentTabIndex, canGoPrevious, registeredTabs, handleValueChange]);

  const contextValue = useMemo(
    () => ({
      activeValue,
      registeredTabs,
      onValueChange: handleValueChange,
      registerTab,
      unregisterTab,
      getCurrentTabIndex,
      canGoNext,
      canGoPrevious,
      goToNext,
      goToPrevious,
    }),
    [
      activeValue,
      registeredTabs,
      handleValueChange,
      registerTab,
      unregisterTab,
      getCurrentTabIndex,
      canGoNext,
      canGoPrevious,
      goToNext,
      goToPrevious,
    ]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <TabsContainer className={className} {...props}>
        {children}
      </TabsContainer>
    </TabsContext.Provider>
  );
}

/**
 * Enhanced TabsList with overflow navigation
 */
function TabsList({ children, className = "", ...props }) {
  const context = useContext(TabsContext);
  const {
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
  } = useTabOverflow();

  if (!context) {
    throw new Error("TabsList must be used within a Tabs component");
  }

  const { registeredTabs, activeValue, onValueChange } = context;

  // Calculate hidden tabs
  const hiddenTabs = registeredTabs.filter(
    (tab) => !visibleTabs.has(tab.value)
  );

  const handleTabSelect = useCallback(
    (tabValue) => {
      onValueChange(tabValue);
      scrollToTab(tabValue);
    },
    [onValueChange, scrollToTab]
  );

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (activeValue) {
      scrollToTab(activeValue);
    }
  }, [activeValue, scrollToTab]);

  return (
    <TabsHeader className={className} {...props}>
      <TabsListContainer>
        <TabsListStyled ref={containerRef}>{children}</TabsListStyled>
      </TabsListContainer>

      <TabOverflowControls
        canScrollLeft={canScrollLeft}
        canScrollRight={canScrollRight}
        onScrollLeft={scrollLeft}
        onScrollRight={scrollRight}
        hiddenTabs={hiddenTabs}
        activeValue={activeValue}
        onTabSelect={handleTabSelect}
        showOverflowMenu={showOverflowMenu}
        onToggleOverflowMenu={toggleOverflowMenu}
        onCloseOverflowMenu={closeOverflowMenu}
      />
    </TabsHeader>
  );
}

/**
 * Enhanced TabsTrigger with better responsiveness
 */
function TabsTrigger({
  children,
  value,
  disabled = false,
  hasError = false,
  icon: Icon,
  className = "",
  ...props
}) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const { activeValue, onValueChange, registerTab, unregisterTab } = context;
  const isActive = activeValue === value;

  const tabLabel = useMemo(() => {
    if (typeof children === "string") {
      return children;
    }
    return `Tab ${value}`;
  }, [children, value]);

  // Get first letter for ultra-compact display
  const firstLetter = useMemo(() => {
    return tabLabel.charAt(0).toUpperCase();
  }, [tabLabel]);

  useEffect(() => {
    registerTab(value, tabLabel, Icon);
    return () => unregisterTab(value);
  }, [value, tabLabel, Icon, registerTab, unregisterTab]);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      if (!disabled) {
        onValueChange(value);
      }
    },
    [disabled, onValueChange, value]
  );

  return (
    <TabsTriggerStyled
      type="button"
      $isActive={isActive}
      $hasError={hasError}
      disabled={disabled}
      onClick={handleClick}
      className={className}
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      data-initial={firstLetter}
      {...props}
    >
      {Icon && <Icon />}
      <span className="tab-text">{children}</span>
    </TabsTriggerStyled>
  );
}

/**
 * TabsContent component (unchanged)
 */
function TabsContent({ children, value, className = "", ...props }) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const { activeValue } = context;

  if (activeValue !== value) {
    return null;
  }

  return (
    <TabsContentStyled
      className={className}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`tabpanel-${value}`}
      {...props}
    >
      {children}
    </TabsContentStyled>
  );
}

/**
 * TabsNavigation component (unchanged)
 */
function TabsNavigation({
  showProgress = true,
  previousLabel = "Previous",
  nextLabel = "Next",
  className = "",
  onPrevious,
  onNext,
  ...props
}) {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("TabsNavigation must be used within a Tabs component");
  }

  const {
    registeredTabs,
    getCurrentTabIndex,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
  } = context;

  const currentIndex = getCurrentTabIndex();
  const currentTab = registeredTabs[currentIndex];
  const progressPercentage =
    registeredTabs.length > 0
      ? ((currentIndex + 1) / registeredTabs.length) * 100
      : 0;

  const handlePrevious = useCallback(() => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPrevious();
    }
  }, [onPrevious, goToPrevious]);

  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    } else {
      goToNext();
    }
  }, [onNext, goToNext]);

  if (registeredTabs.length === 0) {
    return null;
  }

  return (
    <NavigationContainer className={className} {...props}>
      <NavigationActions>
        <NavigationButton
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious()}
          aria-label="Go to previous tab"
        >
          <HiChevronLeft />
          {previousLabel}
        </NavigationButton>
      </NavigationActions>

      {showProgress && (
        <ProgressInfo>
          <ProgressText>
            Step {currentIndex + 1} of {registeredTabs.length}
            {currentTab && ` - ${currentTab.label}`}
          </ProgressText>
          <ProgressBar>
            <ProgressFill $progress={progressPercentage} />
          </ProgressBar>
        </ProgressInfo>
      )}

      <NavigationActions>
        <NavigationButton
          type="button"
          onClick={handleNext}
          disabled={!canGoNext()}
          aria-label="Go to next tab"
        >
          {nextLabel}
          <HiChevronRight />
        </NavigationButton>
      </NavigationActions>
    </NavigationContainer>
  );
}

/**
 * Custom hook to access tab context
 */
export function useTabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("useTabs must be used within a Tabs component");
  }

  return context;
}

// PropTypes (unchanged)
Tabs.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onValueChange: PropTypes.func,
  className: PropTypes.string,
};

TabsList.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

TabsTrigger.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

TabsContent.propTypes = {
  children: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
};

TabsNavigation.propTypes = {
  showProgress: PropTypes.bool,
  previousLabel: PropTypes.string,
  nextLabel: PropTypes.string,
  className: PropTypes.string,
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
};

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsNavigation };
export default Tabs;
