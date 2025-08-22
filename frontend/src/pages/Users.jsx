import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiMiniArrowPath,
  HiOutlineUserGroup,
  HiOutlineUsers,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Text from "../ui/Text";
import Column from "../ui/Column";

import UsersTable from "../features/user/UsersTable";
import UsersFilters from "../features/user/UsersFilters";
import UsersTableControls from "../features/user/UsersTableControls";

import { useUsersTable } from "../features/user/useUsersTable";

// Import modals (we'll create these later)
// import DeleteUserModal from "../features/user/modals/DeleteUserModal";
// import EditUserModal from "../features/user/modals/EditUserModal";
// import ChangeRoleModal from "../features/user/modals/ChangeRoleModal";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;

  @media (max-width: 768px) {
    gap: var(--spacing-4);
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const PageHeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const PageActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const ErrorContainer = styled.div`
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-3);
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-2);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const StatCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  transition: border-color var(--duration-fast) var(--ease-in-out);

  &:hover {
    border-color: var(--color-brand-200);
  }
`;

const StatIcon = styled.div`
  width: 4rem;
  height: 4rem;
  background-color: ${(props) => props.$bgColor || "var(--color-brand-50)"};
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.$color || "var(--color-brand-600)"};

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const EmptyStateContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-8);
  text-align: center;
`;

function Users() {
  // Modal states (for future use)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    user: null,
  });
  const [roleModal, setRoleModal] = useState({
    isOpen: false,
    user: null,
  });

  // Use the users table hook
  const {
    // Data
    data: usersData,
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

    // Stats
    totalResults,
    filteredResults,

    // Available options for filters
    availableRoles,
    availableOrganizations,
  } = useUsersTable();

  const navigate = useNavigate();

  // Navigation handlers
  const handleCreateUser = () => {
    navigate("/users/add");
  };

  const handleViewUser = (user) => {
    navigate(`/users/view/${user.id}`);
  };

  const handleEditUser = (user) => {
    setEditModal({ isOpen: true, user });
  };

  // Modal handlers
  const handleDeleteUser = (user) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleChangeRole = (user) => {
    setRoleModal({ isOpen: true, user });
  };

  const handleToggleStatus = (user) => {
    console.log("Toggle status for user:", user);
    // This will be implemented with the mutation hooks later
  };

  // Modal close handlers
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, user: null });
  };

  const handleCloseRoleModal = () => {
    setRoleModal({ isOpen: false, user: null });
  };

  // Success handlers for modals
  const handleModalSuccess = (data, originalUser) => {
    console.log("Modal operation successful:", { data, originalUser });
    // Data will be automatically updated via React Query cache invalidation
  };

  // Get stats display values
  const getStatsDisplay = () => {
    if (!stats) return null;

    return [
      {
        key: "total",
        icon: HiOutlineUsers,
        label: "Total Users",
        value: stats.total,
        color: "var(--color-blue-600)",
        bgColor: "var(--color-blue-50)",
      },
      {
        key: "active",
        icon: HiOutlineUserGroup,
        label: "Active Users",
        value: stats.active,
        color: "var(--color-green-600)",
        bgColor: "var(--color-green-50)",
      },
      {
        key: "recently_active",
        icon: HiOutlineShieldCheck,
        label: "Recently Active",
        value: stats.recentlyActive,
        color: "var(--color-purple-600)",
        bgColor: "var(--color-purple-50)",
      },
      {
        key: "new_this_month",
        icon: HiOutlinePlus,
        label: "New This Month",
        value: stats.newThisMonth,
        color: "var(--color-orange-600)",
        bgColor: "var(--color-orange-50)",
      },
    ];
  };

  const statsDisplay = getStatsDisplay();

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <PageHeaderContent>
          <Heading as="h1" size="h1">
            User Management
          </Heading>
          <Text size="lg" color="muted">
            Manage system users, roles, and permissions
          </Text>
        </PageHeaderContent>

        <PageActions>
          <IconButton
            variant="ghost"
            size="medium"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            aria-label="Refresh users data"
          >
            <HiMiniArrowPath className={isFetching ? "animate-spin" : ""} />
          </IconButton>

          <Button variant="primary" size="medium" onClick={handleCreateUser}>
            <HiOutlinePlus />
            Add User
          </Button>
        </PageActions>
      </PageHeader>

      {/* Stats Cards */}
      {statsDisplay && (
        <StatsContainer>
          {statsDisplay.map((stat) => (
            <StatCard key={stat.key}>
              <StatIcon $color={stat.color} $bgColor={stat.bgColor}>
                <stat.icon />
              </StatIcon>
              <StatContent>
                <Text size="xs" weight="medium" color="muted">
                  {stat.label}
                </Text>
                <Text size="xl" weight="bold">
                  {stat.value?.toLocaleString() || 0}
                </Text>
              </StatContent>
            </StatCard>
          ))}
        </StatsContainer>
      )}

      {/* Error State */}
      {isError && (
        <ErrorContainer>
          <ErrorContent>
            <Text size="sm" weight="semibold" color="error">
              Failed to load users
            </Text>
            <Text size="sm" color="muted">
              {error?.message ||
                "Something went wrong while loading the users data."}
            </Text>
          </ErrorContent>
          <Button variant="secondary" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        </ErrorContainer>
      )}

      {/* Main Table Section */}
      <TableSection>
        {/* Search and Filters */}
        <UsersFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={totalResults}
          filteredResults={filteredResults}
          isLoading={isLoading}
          availableRoles={availableRoles}
          availableOrganizations={availableOrganizations}
        />

        {/* Table Controls (Sort & Pagination) */}
        <UsersTableControls
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalItems={totalItems}
          startItem={startItem}
          endItem={endItem}
        />

        {/* Users Table */}
        <UsersTable
          usersData={usersData}
          isLoading={isLoading}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onChangeRole={handleChangeRole}
          onToggleStatus={handleToggleStatus}
        />

        {/* Empty State for No Results */}
        {!isLoading && totalItems === 0 && (
          <EmptyStateContainer>
            <Column align="center" gap={3}>
              <HiOutlineUsers size={48} color="var(--color-grey-400)" />
              <Text size="lg" color="muted">
                {totalResults === 0
                  ? "No users found"
                  : "No results match your criteria"}
              </Text>
              <Text size="sm" color="muted">
                {totalResults === 0
                  ? "Get started by adding your first user"
                  : "Try adjusting your search terms or filters"}
              </Text>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={handleResetFilters}
                >
                  Clear search and filters
                </Button>
              )}
              {totalResults === 0 && (
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleCreateUser}
                >
                  <HiOutlinePlus />
                  Add First User
                </Button>
              )}
            </Column>
          </EmptyStateContainer>
        )}
      </TableSection>

      {/* Modals (for future implementation)
      <DeleteUserModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        user={deleteModal.user}
        onSuccess={handleModalSuccess}
      />

      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        user={editModal.user}
        onSuccess={handleModalSuccess}
      />

      <ChangeRoleModal
        isOpen={roleModal.isOpen}
        onClose={handleCloseRoleModal}
        user={roleModal.user}
        onSuccess={handleModalSuccess}
      /> */}
    </PageContainer>
  );
}

export default Users;
