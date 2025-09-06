// Create this file: /frontend/src/features/cases/useCaseTable.js
import { useState, useMemo, useEffect } from "react";
import { useCases } from "./useCase";
import { useUserPreference } from "../../hooks/useLocalStorage";

/**
 * Enhanced hook for case table with search, filtering, sorting, and pagination
 * Uses hybrid approach: backend filtering + frontend search/sort/pagination
 * Following the exact pattern from useFeedbackTable.js
 */
export function useCaseTable() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state (for backend)
  const [filters, setFilters] = useState({
    statusId: "all",
    priorityId: "all",
    categoryId: "all",
    dateRange: "all",
    assignedTo: "all",
    urgencyLevel: "all",
  });

  // Sort state (for frontend)
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state (for frontend) - with persistent pageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useUserPreference("caseTablePageSize", 25);

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
    if (filters.statusId && filters.statusId !== "all") {
      converted.statusId = filters.statusId;
    }

    if (filters.priorityId && filters.priorityId !== "all") {
      converted.priorityId = filters.priorityId;
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      converted.categoryId = filters.categoryId;
    }

    if (filters.assignedTo && filters.assignedTo !== "all") {
      converted.assignedTo = filters.assignedTo;
    }

    if (filters.urgencyLevel && filters.urgencyLevel !== "all") {
      converted.urgencyLevel = filters.urgencyLevel;
    }

    // Always exclude deleted items
    converted.isDeleted = false;

    return converted;
  }, [filters]);

  // console.log("Case Table - frontend filters:", filters);

  // Fetch data from backend with filters
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useCases({ ...backendFilters, limit: 100000 });

  // console.log("Case Table - backend filters:", response);

  const allData = useMemo(() => response?.data || [], [response]);

  // Frontend search filtering
  const searchFilteredData = useMemo(() => {
    if (!searchQuery?.trim()) return allData;

    const query = searchQuery.toLowerCase().trim();

    const listOfSearchTokens = query.split(" ");
    return allData.filter((item) => {
      return listOfSearchTokens.every((token) => {
        return (
          item.title?.toLowerCase().includes(token) ||
          item.description?.toLowerCase().includes(token) ||
          item.caseNumber?.toLowerCase().includes(token) ||
          item.submitterName?.toLowerCase().includes(token) ||
          item.submitterEmail?.toLowerCase().includes(token) ||
          item.tags?.toLowerCase().includes(token) ||
          item.submittedBy?.firstName?.toLowerCase().includes(token) ||
          item.submittedBy?.lastName?.toLowerCase().includes(token) ||
          item.assignedTo?.firstName?.toLowerCase().includes(token) ||
          item.assignedTo?.lastName?.toLowerCase().includes(token) ||
          item.category?.name?.toLowerCase().includes(token) ||
          item.status?.name?.toLowerCase().includes(token) ||
          item.priority?.name?.toLowerCase().includes(token) ||
          item.location?.toLowerCase().includes(token) ||
          item.community?.name?.toLowerCase().includes(token) ||
          item.program?.name?.toLowerCase().includes(token) ||
          item.project?.name?.toLowerCase().includes(token)
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
      } else if (sortBy === "status") {
        aValue = a.status?.name || "";
        bValue = b.status?.name || "";
      } else if (sortBy === "priority") {
        aValue = a.priority?.name || "";
        bValue = b.priority?.name || "";
      } else if (sortBy === "submittedBy") {
        aValue = `${a.submittedBy?.firstName || ""} ${
          a.submittedBy?.lastName || ""
        }`.trim();
        bValue = `${b.submittedBy?.firstName || ""} ${
          b.submittedBy?.lastName || ""
        }`.trim();
      } else if (sortBy === "assignedTo") {
        aValue = `${a.assignedTo?.firstName || ""} ${
          a.assignedTo?.lastName || ""
        }`.trim();
        bValue = `${b.assignedTo?.firstName || ""} ${
          b.assignedTo?.lastName || ""
        }`.trim();
      } else if (sortBy === "community") {
        aValue = a.community?.name || "";
        bValue = b.community?.name || "";
      } else if (sortBy === "program") {
        aValue = a.program?.name || "";
        bValue = b.program?.name || "";
      }

      // Handle different data types
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle dates
      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "submittedAt" ||
        sortBy === "assignedAt" ||
        sortBy === "escalatedAt" ||
        sortBy === "resolvedAt"
      ) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle priority levels (if they have numeric levels)
      if (sortBy === "priority" && a.priority?.level && b.priority?.level) {
        aValue = a.priority.level;
        bValue = b.priority.level;
      }

      // Handle urgency levels
      if (sortBy === "urgencyLevel") {
        const urgencyOrder = {
          low: 1,
          normal: 2,
          high: 3,
          urgent: 4,
          critical: 5,
        };
        aValue = urgencyOrder[aValue] || 0;
        bValue = urgencyOrder[bValue] || 0;
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
      statusId: "all",
      priorityId: "all",
      categoryId: "all",
      dateRange: "all",
      assignedTo: "all",
      urgencyLevel: "all",
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
 * Reused from feedback table hook pattern
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
