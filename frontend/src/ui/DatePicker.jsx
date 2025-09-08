import { useState, useRef, useEffect } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCalendarDays,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineXMark,
  HiOutlineChevronDown,
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

const CalendarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const MonthYearButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  transition: background-color var(--duration-fast) var(--ease-in-out);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);

  &:hover {
    background-color: var(--color-grey-100);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    color: var(--color-grey-500);
  }
`;

const MonthYearDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1001;
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-3);
  min-width: 20rem;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-8px);
  transition: all var(--duration-fast) var(--ease-in-out);

  ${(props) =>
    props.$isOpen &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    `}
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-200);
`;

const YearNavButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  color: var(--color-grey-600);

  &:hover {
    background-color: var(--color-grey-100);
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-1);
`;

const MonthButton = styled.button`
  padding: var(--spacing-2);
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-brand-100);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      background-color: var(--color-brand-500);
      color: var(--color-grey-0);
    `}
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
 * Enhanced with:
 * - Manual date input support
 * - Year/month navigation
 * - Proper timezone handling
 * - Better date validation
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
  const [isMonthYearSelectorOpen, setIsMonthYearSelectorOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = parseInputDate(value);
      if (date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
      }
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const [inputValue, setInputValue] = useState("");

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const monthYearRef = useRef(null);

  // Initialize input value when component mounts or value changes
  useEffect(() => {
    if (value) {
      setInputValue(formatDateForInput(value));
    } else {
      setInputValue("");
    }
  }, [value]);

  // Close calendar on escape key
  useEscapeKey(() => {
    if (isMonthYearSelectorOpen) {
      setIsMonthYearSelectorOpen(false);
    } else if (isOpen) {
      setIsOpen(false);
      inputRef.current?.focus();
    }
  }, isOpen || isMonthYearSelectorOpen);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setIsMonthYearSelectorOpen(false);
      }
    };

    if (isOpen || isMonthYearSelectorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, isMonthYearSelectorOpen]);

  // ===== DATE UTILITY FUNCTIONS =====

  /**
   * Parse input date string and return Date object
   * Handles multiple formats: YYYY-MM-DD, MM/DD/YYYY, etc.
   */
  function parseInputDate(dateString) {
    if (!dateString) return null;

    // Handle ISO date format (YYYY-MM-DD)
    if (
      typeof dateString === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateString)
    ) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    // Handle other formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Format date for input display
   */
  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = parseInputDate(date);
    if (!parsedDate) return "";

    return parsedDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  /**
   * Format date for display in input field
   */
  const formatDateForDisplay = (date) => {
    if (!date) return "";

    const parsedDate = parseInputDate(date);
    if (!parsedDate) return "";

    return parsedDate.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  /**
   * Convert Date object to ISO string (YYYY-MM-DD)
   */
  const dateToISOString = (date) => {
    if (!date || isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
    const selectedDate = parseInputDate(value);
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
      const minDate = parseInputDate(min);
      if (minDate && date < minDate) return true;
    }

    if (max) {
      const maxDate = parseInputDate(max);
      if (maxDate && date > maxDate) return true;
    }

    return false;
  };

  // Validate input date string
  const validateInputDate = (dateString) => {
    if (!dateString.trim()) return { isValid: true, date: null };

    const parsed = parseInputDate(dateString);
    if (!parsed) return { isValid: false, date: null };

    if (isDateDisabled(parsed)) return { isValid: false, date: parsed };

    return { isValid: true, date: parsed };
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

  // ===== EVENT HANDLERS =====

  // Handle input click - open calendar
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Handle manual input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const validation = validateInputDate(newValue);
    if (validation.isValid && validation.date) {
      const isoString = dateToISOString(validation.date);
      onChange(isoString);

      // Update current month to show the selected date
      setCurrentMonth(
        new Date(validation.date.getFullYear(), validation.date.getMonth(), 1)
      );
    } else if (validation.isValid && !validation.date) {
      // Empty input
      onChange("");
    }
  };

  // Handle input blur - validate and format
  const handleInputBlur = () => {
    if (!inputValue.trim()) {
      onChange("");
      return;
    }

    const validation = validateInputDate(inputValue);
    if (validation.isValid && validation.date) {
      setInputValue(formatDateForDisplay(validation.date));
    } else {
      // Reset to previous valid value or empty
      setInputValue(value ? formatDateForDisplay(value) : "");
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;

    const isoString = dateToISOString(date);
    onChange(isoString);
    setInputValue(formatDateForDisplay(date));
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

  // Handle year navigation
  const handlePreviousYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1)
    );
  };

  const handleNextYear = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1)
    );
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1));
    setIsMonthYearSelectorOpen(false);
  };

  // Handle quick actions
  const handleToday = () => {
    const today = new Date();
    handleDateSelect(today);
  };

  const handleClear = () => {
    onChange("");
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const calendarDays = generateCalendarDays();

  return (
    <DatePickerContainer ref={containerRef} className={className}>
      <DatePickerInput
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onClick={handleInputClick}
        placeholder={placeholder}
        disabled={disabled}
        variant={error ? "error" : "default"}
        size={size}
        rightIcon={<HiOutlineCalendarDays />}
        autoComplete="off"
        {...props}
      />

      <CalendarDropdown $isOpen={isOpen}>
        {/* Calendar Header */}
        <CalendarHeader>
          <CalendarNavButton
            onClick={handlePreviousMonth}
            disabled={disabled}
            type="button"
            aria-label="Previous month"
          >
            <HiOutlineChevronLeft />
          </CalendarNavButton>

          <CalendarTitle>
            <div style={{ position: "relative" }} ref={monthYearRef}>
              <MonthYearButton
                type="button"
                onClick={() =>
                  setIsMonthYearSelectorOpen(!isMonthYearSelectorOpen)
                }
              >
                <Text size="md" weight="semibold">
                  {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <HiOutlineChevronDown />
              </MonthYearButton>

              <MonthYearDropdown $isOpen={isMonthYearSelectorOpen}>
                <YearSelector>
                  <YearNavButton onClick={handlePreviousYear} type="button">
                    <HiOutlineChevronLeft />
                  </YearNavButton>
                  <Text size="md" weight="semibold">
                    {currentMonth.getFullYear()}
                  </Text>
                  <YearNavButton onClick={handleNextYear} type="button">
                    <HiOutlineChevronRight />
                  </YearNavButton>
                </YearSelector>

                <MonthGrid>
                  {MONTHS.map((month, index) => (
                    <MonthButton
                      key={month}
                      type="button"
                      onClick={() => handleMonthSelect(index)}
                      $isSelected={index === currentMonth.getMonth()}
                    >
                      {month.slice(0, 3)}
                    </MonthButton>
                  ))}
                </MonthGrid>
              </MonthYearDropdown>
            </div>
          </CalendarTitle>

          <CalendarNavButton
            onClick={handleNextMonth}
            disabled={disabled}
            type="button"
            aria-label="Next month"
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
                  aria-label={`Select ${date.toLocaleDateString()}`}
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

          {showClearButton && (inputValue || value) && (
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
