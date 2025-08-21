import { useState, useMemo, useEffect } from "react";
import { useFeedbacks } from "./useFeedback";
import { useUserPreference } from "../../hooks/useLocalStorage";

/**
 * Enhanced hook for feedback table with search, filtering, sorting, and pagination
 * Uses hybrid approach: backend filtering + frontend search/sort/pagination
 */
export function useFeedbackTable() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state (for backend)
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    dateRange: "all",
  });

  // Sort state (for frontend)
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state (for frontend) - with persistent pageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useUserPreference(
    "feedbackTablePageSize",
    25
  );

  // Convert filters for backend API call
  const backendFilters = useMemo(() => {
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

    // Always exclude deleted items
    converted.isDeleted = false;

    return converted;
  }, [filters]);

  // Fetch data from backend with filters
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useFeedbacks({
    filters: backendFilters,
    limit: 100000, // Get all filtered data for frontend processing
  });

  const allData = useMemo(() => response?.data?.data || [], [response]);

  // Frontend search filtering
  const searchFilteredData = useMemo(() => {
    if (!searchQuery?.trim()) return allData;

    const query = searchQuery.toLowerCase().trim();

    // return allData.filter((item) => {
    //   return (
    //     item.title?.toLowerCase().includes(query) ||
    //     item.description?.toLowerCase().includes(query) ||
    //     item.feedbackNumber?.toLowerCase().includes(query) ||
    //     item.providerName?.toLowerCase().includes(query) ||
    //     item.providerEmail?.toLowerCase().includes(query) ||
    //     item.tags?.toLowerCase().includes(query) ||
    //     item.submittedBy?.firstName?.toLowerCase().includes(query) ||
    //     item.submittedBy?.lastName?.toLowerCase().includes(query) ||
    //     item.category?.name?.toLowerCase().includes(query)
    //   );
    // });

    const listOfSearchTokens = query.split(" ");
    return allData.filter((item) => {
      return listOfSearchTokens.every((token) => {
        return (
          item.title?.toLowerCase().includes(token) ||
          item.description?.toLowerCase().includes(token) ||
          item.feedbackNumber?.toLowerCase().includes(token) ||
          item.providerName?.toLowerCase().includes(token) ||
          item.providerEmail?.toLowerCase().includes(token) ||
          item.tags?.toLowerCase().includes(token) ||
          item.submittedBy?.firstName?.toLowerCase().includes(token) ||
          item.submittedBy?.lastName?.toLowerCase().includes(token) ||
          item.category?.name?.toLowerCase().includes(token)
        );
      });
    });
  }, [allData, searchQuery]);

  // Frontend sorting
  const sortedData = useMemo(() => {
    if (!searchFilteredData.length) return [];

    return [...searchFilteredData].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle nested properties
      if (sortBy === "category") {
        aValue = a.category?.name || "";
        bValue = b.category?.name || "";
      } else if (sortBy === "submittedBy") {
        aValue = `${a.submittedBy?.firstName || ""} ${
          a.submittedBy?.lastName || ""
        }`.trim();
        bValue = `${b.submittedBy?.firstName || ""} ${
          b.submittedBy?.lastName || ""
        }`.trim();
      }

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle dates
      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === "asc" ? -1 : 1;
      if (bValue == null) return sortOrder === "asc" ? 1 : -1;

      // Compare values
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [searchFilteredData, sortBy, sortOrder]);

  // Frontend pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Pagination info
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, sortOrder, pageSize]);

  // Handler functions
  const handleSearchChange = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      priority: "all",
      category: "all",
      dateRange: "all",
    });
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    // Data
    data: paginatedData,
    allData,
    searchFilteredData,
    sortedData,

    // Loading states
    isLoading,
    isFetching,
    isError,
    error,

    // Search
    searchQuery,
    handleSearchChange,

    // Filters
    filters,
    handleFilterChange,
    handleResetFilters,

    // Sorting
    sortBy,
    sortOrder,
    handleSort,

    // Pagination
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    handlePageChange,
    handlePageSizeChange,

    // Actions
    handleRefresh,

    // Stats for display
    totalResults: allData.length,
    filteredResults: totalItems,
  };
}

/**
 * Convert date range string to dateFrom/dateTo objects
 * Reused from dashboard hook
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
