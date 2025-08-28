import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiMiniArrowPath,
  HiOutlineChatBubbleLeftRight,
  // HiOutlineDocumentText,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Text from "../ui/Text";
import Column from "../ui/Column";
import Breadcrumb from "../ui/Breadcrumb";

import FeedbackTable from "../features/feedback/FeedbackTable";
import FeedbackFilters from "../features/feedback/FeedbackFilters";
import FeedbackTableControls from "../features/feedback/FeedbackTableControls";

import { useFeedbackTable } from "../features/feedback/useFeedbackTable";

// Import modals
import DeleteFeedbackModal from "../features/feedback/modals/DeleteFeedbackModal";
import UpdateStatusModal from "../features/feedback/modals/UpdateStatusModal";
import AssignFeedbackModal from "../features/feedback/modals/AssignFeedbackModal";
import AddCommentModal from "../features/feedback/modals/AddCommentModel";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;
  padding: var(--spacing-0);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: var(--spacing-0);
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    gap: var(--spacing-1);
  }
`;

const HeaderContent = styled.div`
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

const PageHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    gap: var(--spacing-3);
  }
`;

const CaseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-lg);
  color: var(--color-grey-0);
  box-shadow: var(--shadow-md);

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  @media (max-width: 640px) {
    width: 4rem;
    height: 4rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const PageHeaderText = styled.div`
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
  const [addCommentModal, setAddCommentModal] = useState({
    isOpen: false,
    feedback: null,
  });

  const {
    data: feedbackData,
    isLoading,
    isFetching,
    isError,
    error,
    searchQuery,
    handleSearchChange,
    filters,
    handleFilterChange,
    handleResetFilters,
    sortBy,
    sortOrder,
    handleSort,
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startItem,
    endItem,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
    totalResults,
    filteredResults,
  } = useFeedbackTable();

  const navigate = useNavigate();

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Case Management",
      to: "/feedback",
      icon: HiOutlineChatBubbleLeftRight,
    },
  ];

  // Navigation handlers
  const handleCreateCase = () => {
    navigate("/feedback/add");
  };

  const handleViewCase = (feedback) => {
    navigate(`/feedback/view/${feedback.id}`);
  };

  const handleEditCase = (feedback) => {
    navigate(`/feedback/edit/${feedback.id}`);
  };

  // Modal handlers
  const handleDeleteCase = (feedback) => {
    setDeleteModal({ isOpen: true, feedback });
  };

  const handleAssignCase = (feedback) => {
    setAssignModal({ isOpen: true, feedback });
  };

  const handleUpdateStatus = (feedback) => {
    setStatusModal({ isOpen: true, feedback });
  };

  const handleAddComment = (feedback) => {
    setAddCommentModal({ isOpen: true, feedback });
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

  const handleCloseAddCommentModal = () => {
    setAddCommentModal({ isOpen: false, feedback: null });
  };

  const handleModalSuccess = (data, originalFeedback) => {
    console.log("Modal operation successful:", { data, originalFeedback });
  };

  return (
    <PageContainer>
      <PageHeader>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <HeaderContent>
          <PageHeaderInfo>
            <CaseIcon>
              <HiOutlineChatBubbleLeftRight />
            </CaseIcon>
            <PageHeaderText>
              <Heading as="h2" size="h1">
                Case Management
              </Heading>
              <Text size="md" color="muted">
                Track and manage beneficiary complaints, suggestions, and
                feedback
              </Text>
            </PageHeaderText>
          </PageHeaderInfo>

          <PageActions>
            <IconButton
              variant="ghost"
              size="medium"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
              aria-label="Refresh case data"
            >
              <HiMiniArrowPath />
            </IconButton>

            <Button variant="primary" size="medium" onClick={handleCreateCase}>
              <HiOutlinePlus />
              New Case
            </Button>
          </PageActions>
        </HeaderContent>
      </PageHeader>

      {/* Error State */}
      {isError && (
        <ErrorContainer>
          <ErrorContent>
            <Text size="sm" weight="semibold" color="error">
              Failed to load cases
            </Text>
            <Text size="sm" color="muted">
              {error?.message ||
                "Something went wrong while loading the cases data."}
            </Text>
          </ErrorContent>
          <Button variant="secondary" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        </ErrorContainer>
      )}

      {/* Main Table Section */}
      <TableSection>
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

        <FeedbackTable
          feedbackData={feedbackData}
          isLoading={isLoading}
          onViewFeedback={handleViewCase}
          onEditFeedback={handleEditCase}
          onDeleteFeedback={handleDeleteCase}
          onUpdateStatus={handleUpdateStatus}
          onAssignFeedback={handleAssignCase}
          onAddComment={handleAddComment}
        />

        {/* Empty State */}
        {!isLoading && totalItems === 0 && (
          <Column
            align="center"
            gap={3}
            style={{ padding: "var(--spacing-8)" }}
          >
            <Text size="lg" color="muted">
              {totalResults === 0
                ? "No cases found"
                : "No results match your search"}
            </Text>
            <Text size="sm" color="muted">
              {totalResults === 0
                ? "Get started by creating your first case"
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

      <AddCommentModal
        isOpen={addCommentModal.isOpen}
        onClose={handleCloseAddCommentModal}
        feedback={addCommentModal.feedback}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
}

export default Feedback;
