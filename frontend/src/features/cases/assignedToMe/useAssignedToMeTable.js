import { useState, useMemo, useEffect } from "react";
import { useCases } from "../useCase";
import { useUserPreference } from "../../../hooks/useLocalStorage";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * Custom hook for cases assigned to the current user
 * Simplified version of useCaseTable with user-specific filtering
 */
export function useAssignedToMeTable() {
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state (simplified for assigned cases)
  const [filters, setFilters] = useState({
    statusId: "all",
    priorityId: "all",
    categoryId: "all",
    dateRange: "all",
    urgencyLevel: "all",
  });

  // Sort state
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useUserPreference(
    "assignedCaseTablePageSize",
    25
  );

  // Convert filters for backend API call + add user assignment filter
  const backendFilters = useMemo(() => {
    const converted = {
      assignedTo: currentUserId, // Filter for current user's assignments
      isDeleted: false,
    };

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

    if (filters.urgencyLevel && filters.urgencyLevel !== "all") {
      converted.urgencyLevel = filters.urgencyLevel;
    }

    return converted;
  }, [filters, currentUserId]);

  // Fetch data from backend with filters
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isError,
    isFetching,
  } = useCases(
    { ...backendFilters, limit: 100000 },
    {
      enabled: !!currentUserId, // Only fetch if user is available
    }
  );

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
          item.tags?.toLowerCase().includes(token) ||
          item.submittedBy?.firstName?.toLowerCase().includes(token) ||
          item.submittedBy?.lastName?.toLowerCase().includes(token) ||
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
        sortBy === "assignedAt" ||
        sortBy === "dueDate"
      ) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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
    setCurrentPage(1);
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

    // User info
    currentUser: user,
    currentUserId,

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
 */
function convertDateRangeToDateFromTo(dateRange) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let dateFrom = null;
  let dateTo = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

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
      dateFrom = null;
      dateTo = null;
      break;
  }

  return {
    dateFrom: dateFrom ? dateFrom.toISOString() : null,
    dateTo: dateTo ? dateTo.toISOString() : null,
  };
}
