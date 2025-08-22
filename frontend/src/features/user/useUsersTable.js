import { useState, useMemo, useCallback } from "react";
import { useUsers } from "./useUsers";

/**
 * Enhanced hook for managing users table state and operations with frontend stats
 */
export function useUsersTable() {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    organization: "all",
  });

  // Sorting state
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Build query parameters for API (fetch all data for frontend processing)
  const queryParams = useMemo(
    () => ({
      // Fetch all data without server-side filtering for frontend processing
      page: 1,
      limit: 1000, // Large limit to get all data
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    []
  );

  // Fetch users data
  const {
    data: usersResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUsers(queryParams);

  // Get all users data
  const allUsersData = usersResponse?.data || [];

  // Frontend filtering, searching, and sorting
  const processedData = useMemo(() => {
    let filteredData = [...allUsersData];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredData = filteredData.filter((user) => {
        const firstName = user.firstName?.toLowerCase() || "";
        const lastName = user.lastName?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const username = user.username?.toLowerCase() || "";
        const organization = user.organization?.toLowerCase() || "";

        return (
          firstName.includes(query) ||
          lastName.includes(query) ||
          email.includes(query) ||
          username.includes(query) ||
          organization.includes(query) ||
          `${firstName} ${lastName}`.includes(query)
        );
      });
    }

    // Apply filters
    if (filters.role && filters.role !== "all") {
      filteredData = filteredData.filter((user) => user.role === filters.role);
    }

    if (filters.status && filters.status !== "all") {
      const isActive = filters.status === "active";
      filteredData = filteredData.filter((user) => user.isActive === isActive);
    }

    if (filters.organization && filters.organization !== "all") {
      filteredData = filteredData.filter(
        (user) => user.organization === filters.organization
      );
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "lastLogin"
      ) {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === "string") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = "";
      if (bValue === null || bValue === undefined) bValue = "";

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredData;
  }, [allUsersData, searchQuery, filters, sortBy, sortOrder]);

  // Frontend pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize]);

  // Calculate frontend stats
  const stats = useMemo(() => {
    if (!allUsersData.length) return null;

    // Role distribution
    const byRole = allUsersData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const activeUsers = allUsersData.filter((user) => user.isActive).length;
    const inactiveUsers = allUsersData.length - activeUsers;

    // Organization distribution
    const byOrganization = allUsersData.reduce((acc, user) => {
      const org = user.organization || "other";
      acc[org] = (acc[org] || 0) + 1;
      return acc;
    }, {});

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyActive = allUsersData.filter((user) => {
      return user.lastLogin && new Date(user.lastLogin) > thirtyDaysAgo;
    }).length;

    // New users this month
    const newThisMonth = allUsersData.filter((user) => {
      return new Date(user.createdAt) > thirtyDaysAgo;
    }).length;

    return {
      total: allUsersData.length,
      active: activeUsers,
      inactive: inactiveUsers,
      recentlyActive,
      newThisMonth,
      byRole,
      byOrganization,
    };
  }, [allUsersData]);

  // Pagination calculations
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Search handlers
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Filter handlers
  const handleFilterChange = useCallback((filterKey, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setFilters({
      role: "all",
      status: "all",
      organization: "all",
    });
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  // Sorting handlers
  const handleSort = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page on sort change
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page on page size change
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Results info
  const totalResults = allUsersData.length;
  const filteredResults = totalItems;

  // Check if filters are active
  const hasActiveFilters =
    searchQuery ||
    Object.values(filters).some((value) => value && value !== "all");

  return {
    // Data
    data: paginatedData,
    allData: allUsersData,
    stats,

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
    hasActiveFilters,

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

    // Results info
    totalResults,
    filteredResults,

    // Available options for filters (derived from data)
    availableRoles: [...new Set(allUsersData.map((user) => user.role))],
    availableOrganizations: [
      ...new Set(allUsersData.map((user) => user.organization).filter(Boolean)),
    ],
  };
}
