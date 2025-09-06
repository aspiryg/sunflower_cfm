// Create this file: /frontend/src/pages/Case.jsx
import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiMiniArrowPath,
  HiOutlineScale,
  HiOutlineDocumentText,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Text from "../ui/Text";
import Column from "../ui/Column";
import Breadcrumb from "../ui/Breadcrumb";

import CaseTable from "../features/cases/CaseTable";
import CaseFilters from "../features/cases/CaseFilters";
import CaseTableControls from "../features/cases/CaseTableControls";

import { useCaseTable } from "../features/cases/useCaseTable";

// Import modals (these will need to be created following your feedback modal patterns)
import DeleteCaseModal from "../features/cases/modals/DeleteCaseModal";
import UpdateStatusModal from "../features/cases/modals/UpdateStatusModal";
import AssignCaseModal from "../features/cases/modals/AssignCaseModal";
import AddCommentModal from "../features/cases/modals/AddCommentModal";
import EscalateCaseModal from "../features/cases/modals/EscalateCaseModal";

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

function Case() {
  // Modal states (uncomment when modals are created)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    case: null,
  });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    case: null,
  });
  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    case: null,
  });
  const [addCommentModal, setAddCommentModal] = useState({
    isOpen: false,
    case: null,
  });
  const [escalateModal, setEscalateModal] = useState({
    isOpen: false,
    case: null,
  });

  const {
    data: caseData,
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
  } = useCaseTable();

  const navigate = useNavigate();

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Case Management",
      to: "/cases",
      icon: HiOutlineScale,
    },
  ];

  // Navigation handlers
  const handleCreateCase = () => {
    navigate("/cases/add");
  };

  const handleViewCase = (caseItem) => {
    navigate(`/cases/view/${caseItem.id}`);
  };

  const handleEditCase = (caseItem) => {
    navigate(`/cases/edit/${caseItem.id}`);
  };

  // Modal handlers (uncomment when modals are created)
  const handleDeleteCase = (caseItem) => {
    // console.log("Delete case:", caseItem);
    setDeleteModal({ isOpen: true, case: caseItem });
  };

  const handleAssignCase = (caseItem) => {
    // console.log("Assign case:", caseItem);
    setAssignModal({ isOpen: true, case: caseItem });
  };

  const handleUpdateStatus = (caseItem) => {
    setStatusModal({ isOpen: true, case: caseItem });
  };

  const handleAddComment = (caseItem) => {
    // console.log("Add comment:", caseItem);
    setAddCommentModal({ isOpen: true, case: caseItem });
  };

  const handleEscalateCase = (caseItem) => {
    // console.log("Escalate case:", caseItem);
    setEscalateModal({ isOpen: true, case: caseItem });
  };

  const handleArchiveCase = (caseItem) => {
    console.log("Archive case:", caseItem);
    // Implement archive logic
  };

  const handleDuplicateCase = (caseItem) => {
    console.log("Duplicate case:", caseItem);
    // Navigate to create page with pre-filled data
    navigate("/cases/add", { state: { duplicateFrom: caseItem } });
  };

  const handleMarkPriority = (caseItem) => {
    console.log("Mark priority:", caseItem);
    // Implement priority marking logic
  };

  // Modal close handlers (uncomment when modals are created)
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, case: null });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, case: null });
  };

  const handleCloseAssignModal = () => {
    setAssignModal({ isOpen: false, case: null });
  };

  const handleCloseAddCommentModal = () => {
    setAddCommentModal({ isOpen: false, case: null });
  };

  const handleCloseEscalateModal = () => {
    setEscalateModal({ isOpen: false, case: null });
  };

  const handleModalSuccess = (data, originalCase) => {
    console.log("Modal operation successful:", { data, originalCase });
    // Refresh data or handle success
    handleRefresh();
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
              <HiOutlineScale />
            </CaseIcon>
            <PageHeaderText>
              <Heading as="h2" size="h1">
                Case Management
              </Heading>
              <Text size="md" color="muted">
                Track and manage beneficiary cases, complaints, and feedback
                through their lifecycle
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
        <CaseFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={totalResults}
          filteredResults={filteredResults}
          isLoading={isLoading}
        />

        <CaseTableControls
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

        <CaseTable
          caseData={caseData}
          isLoading={isLoading}
          onViewCase={handleViewCase}
          onEditCase={handleEditCase}
          onDeleteCase={handleDeleteCase}
          onUpdateStatus={handleUpdateStatus}
          onAssignCase={handleAssignCase}
          onAddComment={handleAddComment}
          onEscalateCase={handleEscalateCase}
          onArchiveCase={handleArchiveCase}
          onDuplicateCase={handleDuplicateCase}
          onMarkPriority={handleMarkPriority}
        />

        {/* Empty State */}
        {!isLoading && totalItems === 0 && (
          <Column
            align="center"
            gap={3}
            style={{ padding: "var(--spacing-8)" }}
          >
            <HiOutlineDocumentText
              style={{
                fontSize: "4.8rem",
                color: "var(--color-grey-400)",
              }}
            />
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

      {/* Modals - Uncomment when modals are created */}
      <UpdateStatusModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        case={statusModal.case}
        onSuccess={handleModalSuccess}
      />

      <AssignCaseModal
        isOpen={assignModal.isOpen}
        onClose={handleCloseAssignModal}
        case={assignModal.case}
        onSuccess={handleModalSuccess}
      />

      <EscalateCaseModal
        isOpen={escalateModal.isOpen}
        onClose={handleCloseEscalateModal}
        case={escalateModal.case}
        onSuccess={handleModalSuccess}
      />

      <DeleteCaseModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        case={deleteModal.case}
        onSuccess={handleModalSuccess}
      />

      <AddCommentModal
        isOpen={addCommentModal.isOpen}
        onClose={handleCloseAddCommentModal}
        case={addCommentModal.case}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
}

export default Case;
