// Create this file: /frontend/src/ui/DatePicker.jsx
import { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCalendarDays,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineXMark,
} from "react-icons/hi2";

import Input from "./Input";
import Text from "./Text";
import { useEscapeKey } from "../hooks/useEscapeKey";

const sizes = {
  small: css`
    font-size: var(--font-size-xs);
  `,
  medium: css`
    font-size: var(--font-size-sm);
  `,
  large: css`
    font-size: var(--font-size-base);
  `,
};

const DatePickerContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const DatePickerInput = styled(Input)`
  cursor: pointer;

  input {
    cursor: pointer;
  }
`;

const CalendarDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: var(--z-popover);
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
  min-width: 28rem;

  ${(props) =>
    props.$isOpen &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    `}

  @media (max-width: 768px) {
    min-width: 26rem;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);

    ${(props) =>
      props.$isOpen &&
      css`
        transform: translateX(-50%) translateY(0);
      `}
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--duration-fast) ease;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const CalendarNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CalendarTitle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  transition: background-color var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
  }
`;

const CalendarGrid = styled.div`
  padding: var(--spacing-3);
`;

const WeekDaysHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
`;

const WeekDay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.2rem;
  color: var(--color-grey-500);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-1);
`;

const DayButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.2rem;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--color-grey-700);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;

  ${(props) => sizes[props.$size]}

  &:hover {
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
  }

  &:disabled {
    color: var(--color-grey-300);
    cursor: not-allowed;

    &:hover {
      background: none;
      color: var(--color-grey-300);
    }
  }

  /* Selected day */
  ${(props) =>
    props.$isSelected &&
    css`
      background-color: var(--color-brand-500);
      color: var(--color-grey-0);
      font-weight: var(--font-weight-semibold);

      &:hover {
        background-color: var(--color-brand-600);
        color: var(--color-grey-0);
      }
    `}

  /* Today indicator */
  ${(props) =>
    props.$isToday &&
    !props.$isSelected &&
    css`
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background-color: var(--color-brand-500);
        border-radius: 50%;
      }
    `}

  /* Different month days */
  ${(props) =>
    props.$isOtherMonth &&
    css`
      color: var(--color-grey-300);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const CalendarFooter = styled.div`
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-grey-50);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-3);
`;

const QuickActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const QuickActionButton = styled.button`
  padding: var(--spacing-1) var(--spacing-2);
  background: none;
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-600);
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: none;
  border: none;
  color: var(--color-error-600);
  cursor: pointer;
  font-size: var(--font-size-xs);
  border-radius: var(--border-radius-sm);
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-error-50);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * DatePicker Component
 *
 * A comprehensive date picker with calendar dropdown, keyboard navigation,
 * and accessibility features
 */
function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  size = "medium",
  disabled = false,
  error = false,
  min,
  max,
  showClearButton = true,
  showQuickActions = true,
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close calendar on escape key
  useEscapeKey(() => {
    if (isOpen) {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, isOpen);

  // Close calendar when clicking outside
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

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Parse date string
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date) => {
    if (!value) return false;
    const selectedDate = parseDate(value);
    if (!selectedDate) return false;

    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (min) {
      const minDate = parseDate(min);
      if (minDate && date < minDate) return true;
    }

    if (max) {
      const maxDate = parseDate(max);
      if (maxDate && date > maxDate) return true;
    }

    return false;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const startOfMonth = new Date(currentMonth);
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isOtherMonth = !isCurrentMonth;

      days.push({
        date,
        isCurrentMonth,
        isOtherMonth,
        isToday: isToday(date),
        isSelected: isSelected(date),
        isDisabled: isDateDisabled(date),
      });
    }

    return days;
  };

  // Handle input click
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;

    const isoString = date.toISOString().split("T")[0];
    onChange(isoString);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Handle quick actions
  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const calendarDays = generateCalendarDays();

  return (
    <DatePickerContainer ref={containerRef} className={className}>
      <DatePickerInput
        ref={inputRef}
        value={formatDate(value)}
        onClick={handleInputClick}
        placeholder={placeholder}
        disabled={disabled}
        variant={error ? "error" : "default"}
        size={size}
        readOnly
        rightIcon={<HiOutlineCalendarDays />}
        {...props}
      />

      <CalendarDropdown $isOpen={isOpen}>
        {/* Calendar Header */}
        <CalendarHeader>
          <CalendarNavButton
            onClick={handlePreviousMonth}
            disabled={disabled}
            type="button"
          >
            <HiOutlineChevronLeft />
          </CalendarNavButton>

          <CalendarTitle type="button">
            <Text size="md" weight="semibold">
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
          </CalendarTitle>

          <CalendarNavButton
            onClick={handleNextMonth}
            disabled={disabled}
            type="button"
          >
            <HiOutlineChevronRight />
          </CalendarNavButton>
        </CalendarHeader>

        {/* Calendar Grid */}
        <CalendarGrid>
          {/* Week days header */}
          <WeekDaysHeader>
            {WEEKDAYS.map((day) => (
              <WeekDay key={day}>
                <Text size="xs" weight="medium">
                  {day}
                </Text>
              </WeekDay>
            ))}
          </WeekDaysHeader>

          {/* Days grid */}
          <DaysGrid>
            {calendarDays.map(
              (
                { date, isOtherMonth, isToday, isSelected, isDisabled },
                index
              ) => (
                <DayButton
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  $isSelected={isSelected}
                  $isToday={isToday}
                  $isOtherMonth={isOtherMonth}
                  $size={size}
                >
                  {date.getDate()}
                </DayButton>
              )
            )}
          </DaysGrid>
        </CalendarGrid>

        {/* Calendar Footer */}
        <CalendarFooter>
          {showQuickActions && (
            <QuickActions>
              <QuickActionButton type="button" onClick={handleToday}>
                Today
              </QuickActionButton>
            </QuickActions>
          )}

          {showClearButton && value && (
            <ClearButton type="button" onClick={handleClear}>
              <HiOutlineXMark />
              Clear
            </ClearButton>
          )}
        </CalendarFooter>
      </CalendarDropdown>
    </DatePickerContainer>
  );
}

DatePicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  min: PropTypes.string,
  max: PropTypes.string,
  showClearButton: PropTypes.bool,
  showQuickActions: PropTypes.bool,
  className: PropTypes.string,
};

export default DatePicker;
