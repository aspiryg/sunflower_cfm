import { useState, useMemo } from "react";

export function useDashboardFilters() {
  const [filters, setFilters] = useState({
    dateRange: "30d",
    status: "all",
    priority: "all",
    category: "all",
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: "30d",
      status: "all",
      priority: "all",
      category: "all",
    });
  };

  /**
   * Convert dashboard filters to format expected by useFeedbackStats
   * Converts dateRange to dateFrom/dateTo and removes "all" values
   */
  const statsFilters = useMemo(() => {
    const converted = {};

    // Convert date range to dateFrom/dateTo
    if (filters.dateRange && filters.dateRange !== "all") {
      const dateRange = convertDateRangeToDateFromTo(filters.dateRange);
      if (dateRange.dateFrom) converted.createdAtFrom = dateRange.dateFrom;
      if (dateRange.dateTo) converted.createdAtTo = dateRange.dateTo;
    }

    // Add other filters if they're not "all"
    if (filters.status && filters.status !== "all") {
      converted.status = filters.status;
    }

    if (filters.priority && filters.priority !== "all") {
      converted.priority = filters.priority;
    }

    if (filters.category && filters.category !== "all") {
      converted.category = filters.category;
    }

    return converted;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    statsFilters, // Converted filters for API calls
  };
}

/**
 * Convert date range string to dateFrom/dateTo objects
 * @param {string} dateRange - Date range string (e.g., "7d", "30d", "6m", "1y")
 * @returns {Object} Object with dateFrom and dateTo properties
 */
function convertDateRangeToDateFromTo(dateRange) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let dateFrom = null;
  let dateTo = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today

  switch (dateRange) {
    case "7d":
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 7);
      break;

    case "30d":
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 30);
      break;

    case "90d":
      dateFrom = new Date(today);
      dateFrom.setDate(dateFrom.getDate() - 90);
      break;

    case "6m":
      dateFrom = new Date(today);
      dateFrom.setMonth(dateFrom.getMonth() - 6);
      break;

    case "1y":
      dateFrom = new Date(today);
      dateFrom.setFullYear(dateFrom.getFullYear() - 1);
      break;

    case "all":
    default:
      // No date restrictions for "all"
      dateFrom = null;
      dateTo = null;
      break;
  }

  return {
    dateFrom: dateFrom ? dateFrom.toISOString() : null,
    dateTo: dateTo ? dateTo.toISOString() : null,
  };
}
