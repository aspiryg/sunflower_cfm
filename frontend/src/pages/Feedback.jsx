import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlinePlus, HiMiniArrowPath } from "react-icons/hi2";

import Heading from "../ui/Heading";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Text from "../ui/Text";
import Column from "../ui/Column";

// import FeedbackSummary from "../features/feedback/FeedbackSummary";
import FeedbackTable from "../features/feedback/FeedbackTable";
import FeedbackFilters from "../features/feedback/FeedbackFilters";
import FeedbackTableControls from "../features/feedback/FeedbackTableControls";

// Import the enhanced hook
import { useFeedbackTable } from "../features/feedback/useFeedbackTable";

// Import modals
import DeleteFeedbackModal from "../features/feedback/modals/DeleteFeedbackModal";
import UpdateStatusModal from "../features/feedback/modals/UpdateStatusModal";
import AssignFeedbackModal from "../features/feedback/modals/AssignFeedbackModal";

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

function Feedback() {
  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    feedback: null,
  });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    feedback: null,
  });
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    feedback: null,
  });

  // Use the enhanced feedback table hook
  const {
    // Data
    data: feedbackData,
    // allData,

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

    // Stats
    totalResults,
    filteredResults,
  } = useFeedbackTable();

  const navigate = useNavigate();

  // Navigation handlers
  const handleCreateFeedback = () => {
    navigate("/feedback/add");
  };

  const handleViewFeedback = (feedback) => {
    navigate(`/feedback/view/${feedback.id}`);
  };

  const handleEditFeedback = (feedback) => {
    navigate(`/feedback/edit/${feedback.id}`);
  };

  // Modal handlers
  const handleDeleteFeedback = (feedback) => {
    setDeleteModal({ isOpen: true, feedback });
  };

  const handleAssignFeedback = (feedback) => {
    setAssignModal({ isOpen: true, feedback });
  };

  const handleUpdateStatus = (feedback) => {
    setStatusModal({ isOpen: true, feedback });
  };

  // Modal close handlers
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, feedback: null });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, feedback: null });
  };

  const handleCloseAssignModal = () => {
    setAssignModal({ isOpen: false, feedback: null });
  };

  // Success handlers for modals
  const handleModalSuccess = (data, originalFeedback) => {
    console.log("Modal operation successful:", { data, originalFeedback });
    // Data will be automatically updated via React Query cache invalidation
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <PageHeaderContent>
          <Heading as="h1" size="h1">
            Beneficiary Feedback
          </Heading>
          <Text size="lg" color="muted">
            Manage and track beneficiary feedback submissions
          </Text>
        </PageHeaderContent>

        <PageActions>
          <IconButton
            variant="ghost"
            size="medium"
            onClick={handleRefresh}
            disabled={isLoading || isFetching}
            aria-label="Refresh feedback data"
          >
            <HiMiniArrowPath />
          </IconButton>

          <Button
            variant="primary"
            size="medium"
            onClick={handleCreateFeedback}
          >
            <HiOutlinePlus />
            Add Feedback
          </Button>
        </PageActions>
      </PageHeader>

      {/* Summary Cards */}
      {/* <FeedbackSummary feedbackData={allData} isLoading={isLoading} /> */}

      {/* Error State */}
      {isError && (
        <ErrorContainer>
          <ErrorContent>
            <Text size="sm" weight="semibold" color="error">
              Failed to load feedback
            </Text>
            <Text size="sm" color="muted">
              {error?.message ||
                "Something went wrong while loading the feedback data."}
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
        <FeedbackFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={totalResults}
          filteredResults={filteredResults}
          isLoading={isLoading}
        />

        {/* Table Controls (Sort & Pagination) */}
        <FeedbackTableControls
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

        {/* Feedback Table */}
        <FeedbackTable
          feedbackData={feedbackData}
          isLoading={isLoading}
          onViewFeedback={handleViewFeedback}
          onEditFeedback={handleEditFeedback}
          onDeleteFeedback={handleDeleteFeedback}
          onUpdateStatus={handleUpdateStatus}
          onAssignFeedback={handleAssignFeedback}
        />

        {/* Empty State for No Results */}
        {!isLoading && totalItems === 0 && (
          <Column
            align="center"
            gap={3}
            style={{ padding: "var(--spacing-8)" }}
          >
            <Text size="lg" color="muted">
              {totalResults === 0
                ? "No feedback entries found"
                : "No results match your search"}
            </Text>
            <Text size="sm" color="muted">
              {totalResults === 0
                ? "Get started by adding your first feedback entry"
                : "Try adjusting your search terms or filters"}
            </Text>
            {(searchQuery ||
              Object.values(filters).some((f) => f !== "all")) && (
              <Button variant="ghost" size="small" onClick={handleResetFilters}>
                Clear search and filters
              </Button>
            )}
          </Column>
        )}
      </TableSection>

      {/* Modals */}
      <DeleteFeedbackModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        feedback={deleteModal.feedback}
        onSuccess={handleModalSuccess}
      />

      <UpdateStatusModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        feedback={statusModal.feedback}
        onSuccess={handleModalSuccess}
      />

      <AssignFeedbackModal
        isOpen={assignModal.isOpen}
        onClose={handleCloseAssignModal}
        feedback={assignModal.feedback}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
}

export default Feedback;
