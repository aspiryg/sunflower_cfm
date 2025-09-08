import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlusCircle,
  HiOutlineChatBubbleLeftRight,
  HiMiniArrowPath,
  HiOutlineDocumentText,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentCheck,
  HiOutlineUserGroup,
  HiOutlinePlus,
} from "react-icons/hi2";

import Breadcrumb from "../../../ui/Breadcrumb";
import Heading from "../../../ui/Heading";
import Text from "../../../ui/Text";
import IconButton from "../../../ui/IconButton";
import Button from "../../../ui/Button";
import Column from "../../../ui/Column";
import Card from "../../../ui/Card";

import CaseTable from "../CaseTable";
import CreatedCaseFilters from "./CreatedCaseFilters";
import CaseTableControls from "../CaseTableControls";
import { useCreatedByMeTable } from "./useCreatedByMeTable";

// Reuse modals from main Cases page
import UpdateStatusModal from "../modals/UpdateStatusModal";
import AddCommentModal from "../modals/AddCommentModal";
import EscalateCaseModal from "../modals/EscalateCaseModal";
import AssignCaseModal from "../modals/AssignCaseModal";

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

const PageHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const CreatedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  background: linear-gradient(
    135deg,
    var(--color-green-500),
    var(--color-green-400)
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

const PageActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const StatCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--border-radius-lg);
  background: ${(props) => props.$color || "var(--color-grey-100)"};
  color: ${(props) => props.$textColor || "var(--color-grey-600)"};

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

const StatValue = styled(Text)`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
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

function CreatedByMe() {
  // Modal states
  const [statusModal, setStatusModal] = useState({ isOpen: false, case: null });
  const [commentModal, setCommentModal] = useState({
    isOpen: false,
    case: null,
  });
  const [escalateModal, setEscalateModal] = useState({
    isOpen: false,
    case: null,
  });
  const [assignModal, setAssignModal] = useState({ isOpen: false, case: null });

  const navigate = useNavigate();

  const {
    data: caseData,
    isLoading,
    isFetching,
    isError,
    error,
    currentUser,
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
  } = useCreatedByMeTable();

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Cases",
      to: "/cases",
      icon: HiOutlineChatBubbleLeftRight,
    },
    {
      label: "Created By Me",
      icon: HiOutlinePlusCircle,
    },
  ];

  // Calculate stats
  const stats = {
    total: totalResults,
    active: caseData.filter(
      (c) => !["closed", "resolved"].includes(c.status?.name?.toLowerCase())
    ).length,
    assigned: caseData.filter((c) => c.assignedTo?.id).length,
    unassigned: caseData.filter((c) => !c.assignedTo?.id).length,
  };

  // Navigation handlers
  const handleViewCase = (caseItem) => {
    navigate(`/cases/view/${caseItem.id}`);
  };

  const handleEditCase = (caseItem) => {
    navigate(`/cases/edit/${caseItem.id}`);
  };

  const handleCreateCase = () => {
    navigate("/cases/create");
  };

  // Modal handlers (full feature set for created cases)
  const handleUpdateStatus = (caseItem) => {
    setStatusModal({ isOpen: true, case: caseItem });
  };

  const handleAddComment = (caseItem) => {
    setCommentModal({ isOpen: true, case: caseItem });
  };

  const handleEscalateCase = (caseItem) => {
    setEscalateModal({ isOpen: true, case: caseItem });
  };

  const handleAssignCase = (caseItem) => {
    setAssignModal({ isOpen: true, case: caseItem });
  };

  // Modal close handlers
  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, case: null });
  };

  const handleCloseCommentModal = () => {
    setCommentModal({ isOpen: false, case: null });
  };

  const handleCloseEscalateModal = () => {
    setEscalateModal({ isOpen: false, case: null });
  };

  const handleCloseAssignModal = () => {
    setAssignModal({ isOpen: false, case: null });
  };

  const handleModalSuccess = () => {
    handleRefresh();
  };

  // Show loading state when user data isn't available yet
  if (!currentUser) {
    return (
      <PageContainer>
        <Column align="center" gap={4} style={{ padding: "var(--spacing-8)" }}>
          <Text size="lg">Loading user information...</Text>
        </Column>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <HeaderContent>
          <PageHeaderInfo>
            <CreatedIcon>
              <HiOutlinePlusCircle />
            </CreatedIcon>
            <PageHeaderText>
              <Heading as="h2" size="h1">
                My Created Cases
              </Heading>
              <Text size="md" color="muted">
                Cases created by{" "}
                <strong>
                  {currentUser.firstName} {currentUser.lastName}
                </strong>
              </Text>
            </PageHeaderText>
          </PageHeaderInfo>

          <PageActions>
            <IconButton
              variant="ghost"
              size="medium"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
              aria-label="Refresh created cases"
            >
              <HiMiniArrowPath />
            </IconButton>

            <Button variant="primary" size="medium" onClick={handleCreateCase}>
              <HiOutlinePlus />
              Create New Case
            </Button>
          </PageActions>
        </HeaderContent>
      </PageHeader>

      {/* Quick Stats */}
      <StatsCards>
        <StatCard>
          <StatIcon
            $color="var(--color-green-100)"
            $textColor="var(--color-green-600)"
          >
            <HiOutlineDocumentText />
          </StatIcon>
          <StatContent>
            <Text size="sm" color="muted">
              Total Created
            </Text>
            <StatValue>{stats.total}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon
            $color="var(--color-blue-100)"
            $textColor="var(--color-blue-600)"
          >
            <HiOutlineChartBarSquare />
          </StatIcon>
          <StatContent>
            <Text size="sm" color="muted">
              Active Cases
            </Text>
            <StatValue>{stats.active}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon
            $color="var(--color-purple-100)"
            $textColor="var(--color-purple-600)"
          >
            <HiOutlineUserGroup />
          </StatIcon>
          <StatContent>
            <Text size="sm" color="muted">
              Assigned
            </Text>
            <StatValue>{stats.assigned}</StatValue>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon
            $color="var(--color-orange-100)"
            $textColor="var(--color-orange-600)"
          >
            <HiOutlineClipboardDocumentCheck />
          </StatIcon>
          <StatContent>
            <Text size="sm" color="muted">
              Unassigned
            </Text>
            <StatValue>{stats.unassigned}</StatValue>
          </StatContent>
        </StatCard>
      </StatsCards>

      {/* Error State */}
      {isError && (
        <ErrorContainer>
          <div>
            <Text size="sm" weight="semibold" color="error">
              Failed to load created cases
            </Text>
            <Text size="sm" color="muted">
              {error?.message ||
                "Something went wrong while loading your created cases."}
            </Text>
          </div>
          <IconButton variant="secondary" size="small" onClick={handleRefresh}>
            Try Again
          </IconButton>
        </ErrorContainer>
      )}

      {/* Main Content */}
      <TableSection>
        <CreatedCaseFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={totalResults}
          filteredResults={filteredResults}
          isLoading={isLoading}
          currentUser={currentUser}
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
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onEscalateCase={handleEscalateCase}
          onAssignCase={handleAssignCase}
          // Full feature set enabled for created cases
          tableType="created"
        />

        {/* Empty State */}
        {!isLoading && totalItems === 0 && (
          <Column
            align="center"
            gap={3}
            style={{ padding: "var(--spacing-8)" }}
          >
            <HiOutlinePlusCircle
              style={{
                fontSize: "4.8rem",
                color: "var(--color-grey-400)",
              }}
            />
            <Text size="lg" color="muted">
              {totalResults === 0
                ? "No cases created yet"
                : "No results match your search"}
            </Text>
            <Text size="sm" color="muted">
              {totalResults === 0
                ? "Create your first case to get started"
                : "Try adjusting your search terms or filters"}
            </Text>
            {totalResults === 0 ? (
              <Button variant="primary" size="small" onClick={handleCreateCase}>
                <HiOutlinePlus />
                Create Your First Case
              </Button>
            ) : (
              <IconButton
                variant="ghost"
                size="small"
                onClick={handleResetFilters}
              >
                Clear search and filters
              </IconButton>
            )}
          </Column>
        )}
      </TableSection>

      {/* Modals - Full feature set for created cases */}
      <UpdateStatusModal
        isOpen={statusModal.isOpen}
        onClose={handleCloseStatusModal}
        case={statusModal.case}
        onSuccess={handleModalSuccess}
      />

      <AddCommentModal
        isOpen={commentModal.isOpen}
        onClose={handleCloseCommentModal}
        case={commentModal.case}
        onSuccess={handleModalSuccess}
      />

      <EscalateCaseModal
        isOpen={escalateModal.isOpen}
        onClose={handleCloseEscalateModal}
        case={escalateModal.case}
        onSuccess={handleModalSuccess}
      />

      <AssignCaseModal
        isOpen={assignModal.isOpen}
        onClose={handleCloseAssignModal}
        case={assignModal.case}
        onSuccess={handleModalSuccess}
      />
    </PageContainer>
  );
}

export default CreatedByMe;
