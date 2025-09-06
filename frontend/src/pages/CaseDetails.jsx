import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserPlus,
  HiOutlineFlag,
  HiOutlineEllipsisVertical,
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineChatBubbleLeft,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineScale,
  HiOutlineArrowPath,
  HiOutlineArrowTrendingUp,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";

import { useCase } from "../features/cases/useCase";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import StatusBadge from "../ui/StatusBadge2";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import ContextMenu from "../ui/ContextMenu";
import Breadcrumb from "../ui/Breadcrumb";
import Card from "../ui/Card";
import InfoCard from "../ui/InfoCard";

// Import case detail components (we'll create these)
import CaseOverview from "../features/cases/details/CaseOverview";
import CaseAssignment from "../features/cases/details/CaseAssignment";
import CaseTimeline from "../features/cases/details/CaseTimeline";
import CaseComments from "../features/cases/details/CaseComments";
import CaseLocation from "../features/cases/details/CaseLocation";
import CaseSettings from "../features/cases/details/CaseSettings";

// Import modals (using the ones we created earlier)
import DeleteCaseModal from "../features/cases/modals/DeleteCaseModal";
import UpdateStatusModal from "../features/cases/modals/UpdateStatusModal";
import AssignCaseModal from "../features/cases/modals/AssignCaseModal";
import AddCommentModal from "../features/cases/modals/AddCommentModal";
import EscalateCaseModal from "../features/cases/modals/EscalateCaseModal";

import { getColorStyles } from "../utils/caseUtils";
import { getUserDisplayName } from "../utils/userUtils";
import { formatRelativeTime } from "../utils/dateUtils";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;
  min-height: 100vh;
  width: 100%;
  min-width: 0;
  padding: var(--spacing-0);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: 0 var(--spacing-0);
  }
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const CaseHeaderCard = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);
  background: linear-gradient(
    135deg,
    var(--color-grey-0),
    var(--color-grey-25)
  );

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const CaseNumber = styled(Text)`
  font-family: var(--font-mono);
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--border-radius-full);
  display: inline-block;
  width: fit-content;
  font-weight: var(--font-weight-semibold);
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  margin-top: var(--spacing-2);
`;

const QuickMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const MetadataLabel = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const MetadataValue = styled(Text)`
  color: var(--color-grey-800);
  font-weight: var(--font-weight-medium);
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  flex: 1;
`;

const TabsContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  width: 100%;
  min-width: 0;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  min-height: 40rem;
`;

const PriorityIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);

  ${(props) => {
    if (
      props.$level === "high" ||
      props.$level === "urgent" ||
      props.$level === "critical"
    ) {
      return `
        background-color: var(--color-error-100);
        color: var(--color-error-700);
        border: 1px solid var(--color-error-200);
      `;
    }
    return `
      background-color: var(--color-grey-100);
      color: var(--color-grey-600);
      border: 1px solid var(--color-grey-200);
    `;
  }}
`;

/**
 * Case Details Page Component
 *
 * Comprehensive case details view with tabbed interface for different aspects
 * of case management including overview, assignment, timeline, comments, etc.
 */
function CaseDetails() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
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
  const [commentModal, setCommentModal] = useState({
    isOpen: false,
    case: null,
  });
  const [escalateModal, setEscalateModal] = useState({
    isOpen: false,
    case: null,
  });

  // Fetch case data
  const {
    data: caseResponse,
    isLoading,
    error,
    refetch,
    isError,
  } = useCase(caseId);

  const caseData = caseResponse?.data;

  // Navigation handlers
  const handleBack = () => {
    navigate("/cases");
  };

  const handleEdit = () => {
    navigate(`/cases/edit/${caseId}`);
  };

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      label: "Case Management",
      to: "/cases",
      icon: HiOutlineScale,
    },
    {
      label: "Case Details",
      icon: HiOutlineDocumentText,
    },
  ];

  // Action handlers
  const handleDelete = () => {
    setDeleteModal({ isOpen: true, case: caseData });
  };

  const handleUpdateStatus = () => {
    setStatusModal({ isOpen: true, case: caseData });
  };

  const handleAssign = () => {
    setAssignModal({ isOpen: true, case: caseData });
  };

  const handleAddComment = () => {
    setCommentModal({ isOpen: true, case: caseData });
  };

  const handleEscalate = () => {
    setEscalateModal({ isOpen: true, case: caseData });
  };

  const handleRefresh = () => {
    refetch();
  };

  // Modal close handlers
  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, case: null });
  };

  const handleCloseStatusModal = () => {
    setStatusModal({ isOpen: false, case: null });
  };

  const handleCloseAssignModal = () => {
    setAssignModal({ isOpen: false, case: null });
  };

  const handleCloseCommentModal = () => {
    setCommentModal({ isOpen: false, case: null });
  };

  const handleCloseEscalateModal = () => {
    setEscalateModal({ isOpen: false, case: null });
  };

  // Success handlers
  const handleModalSuccess = (data, originalCase) => {
    console.log("Modal operation successful:", { data, originalCase });
    refetch();
  };

  // Get context menu items
  const getContextMenuItems = () => [
    {
      key: "edit",
      label: "Edit Case",
      description: "Modify case information",
      icon: HiOutlinePencil,
      onClick: handleEdit,
      group: "primary",
    },
    {
      key: "status",
      label: "Update Status",
      description: "Change case status",
      icon: HiOutlineClipboardDocumentCheck,
      onClick: handleUpdateStatus,
      group: "secondary",
    },
    {
      key: "assign",
      label: "Assign to User",
      description: "Assign case to team member",
      icon: HiOutlineUserPlus,
      onClick: handleAssign,
      group: "secondary",
    },
    {
      key: "comment",
      label: "Add Comment",
      description: "Add internal comment or note",
      icon: HiOutlineChatBubbleLeft,
      onClick: handleAddComment,
      group: "secondary",
    },
    {
      key: "escalate",
      label: "Escalate Case",
      description: "Escalate to higher priority",
      icon: HiOutlineArrowTrendingUp,
      onClick: handleEscalate,
      group: "secondary",
    },
    {
      key: "delete",
      label: "Delete Case",
      description: "Permanently remove case",
      icon: HiOutlineTrash,
      onClick: handleDelete,
      variant: "danger",
      group: "danger",
    },
  ];

  // Tab configuration with case-specific structure
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: HiOutlineInformationCircle,
      component: CaseOverview,
      description: "Case details and description",
    },
    {
      value: "assignment",
      label: "Assignment",
      icon: HiOutlineUsers,
      component: CaseAssignment,
      description: "Assignment history and management",
    },
    {
      value: "timeline",
      label: "Timeline",
      icon: HiOutlineClock,
      component: CaseTimeline,
      description: "Activity timeline and history",
    },
    {
      value: "comments",
      label: "Comments",
      icon: HiOutlineChatBubbleLeft,
      component: CaseComments,
      description: "Internal and external comments",
    },
    {
      value: "location",
      label: "Location",
      icon: HiOutlineMapPin,
      component: CaseLocation,
      description: "Geographic and location data",
    },
    {
      value: "settings",
      label: "Settings",
      icon: HiOutlineCog6Tooth,
      component: CaseSettings,
      description: "Privacy and advanced settings",
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading case details...
          </Text>
          <Text size="sm" color="muted">
            Retrieving case information and related data
          </Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (isError || !caseData) {
    return (
      <PageContainer>
        <Breadcrumb items={breadcrumbItems} />
        <ErrorContainer>
          <InfoCard
            variant="error"
            title={
              error?.response?.status === 404
                ? "Case Not Found"
                : "Failed to Load Case"
            }
            size="large"
          >
            <Text size="sm">
              {error?.response?.status === 404
                ? "The case you're looking for doesn't exist or has been deleted."
                : error?.message ||
                  "An unexpected error occurred while loading the case details."}
            </Text>
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-3)",
                marginTop: "var(--spacing-4)",
                justifyContent: "center",
              }}
            >
              <Button variant="secondary" onClick={handleBack}>
                Back to Cases
              </Button>
              <Button variant="primary" onClick={handleRefresh}>
                <HiOutlineArrowPath />
                Try Again
              </Button>
            </div>
          </InfoCard>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <PageHeader>
        <Breadcrumb items={breadcrumbItems} />

        <CaseHeaderCard>
          <HeaderTop>
            <HeaderContent>
              <TitleSection>
                <CaseNumber size="sm" weight="semibold">
                  {caseData.caseNumber}
                </CaseNumber>
                <Heading as="h2" size="h2">
                  {caseData.title}
                </Heading>
                <Text size="md" color="muted">
                  {caseData.description?.substring(0, 150)}
                  {caseData.description?.length > 150 ? "..." : ""}
                </Text>
              </TitleSection>

              <StatusSection>
                <StatusBadge
                  content={caseData.status?.name || "Unknown"}
                  size="sm"
                  style={getColorStyles(
                    caseData.status?.color || "--color-grey-200"
                  )}
                />
                <StatusBadge
                  content={caseData.priority?.name || "Normal"}
                  size="sm"
                  style={getColorStyles(
                    caseData.priority?.color || "--color-grey-200"
                  )}
                />
                {caseData.category && (
                  <StatusBadge
                    content={caseData.category.name}
                    size="sm"
                    style={getColorStyles(
                      caseData.category.color || "--color-blue-200"
                    )}
                  />
                )}
                {caseData.isSensitive && (
                  <PriorityIndicator $level="high">
                    <HiOutlineFlag size={12} />
                    Sensitive
                  </PriorityIndicator>
                )}
              </StatusSection>
            </HeaderContent>

            <HeaderActions>
              <Button variant="secondary" onClick={handleEdit}>
                <HiOutlinePencil />
                Edit Case
              </Button>

              <ContextMenu
                items={getContextMenuItems()}
                header="Case Actions"
                trigger={
                  <IconButton variant="ghost" size="medium">
                    <HiOutlineEllipsisVertical />
                  </IconButton>
                }
              />
            </HeaderActions>
          </HeaderTop>

          {/* Quick Metadata */}
          <QuickMetadata>
            <MetadataItem>
              <MetadataLabel size="sm">Submitted By</MetadataLabel>
              <MetadataValue size="sm">
                {caseData.submittedBy
                  ? getUserDisplayName(caseData.submittedBy)
                  : caseData.providerDetails?.contactPersonName || "Anonymous"}
              </MetadataValue>
            </MetadataItem>

            <MetadataItem>
              <MetadataLabel size="sm">Assigned To</MetadataLabel>
              <MetadataValue size="sm">
                {caseData.assignedTo
                  ? getUserDisplayName(caseData.assignedTo)
                  : "Unassigned"}
              </MetadataValue>
            </MetadataItem>

            <MetadataItem>
              <MetadataLabel size="sm">Channel</MetadataLabel>
              <MetadataValue size="sm">
                {caseData.channel?.name || "N/A"}
              </MetadataValue>
            </MetadataItem>

            <MetadataItem>
              <MetadataLabel size="sm">Created</MetadataLabel>
              <MetadataValue size="sm">
                {formatRelativeTime(caseData.createdAt)}
              </MetadataValue>
            </MetadataItem>

            <MetadataItem>
              <MetadataLabel size="sm">Last Updated</MetadataLabel>
              <MetadataValue size="sm">
                {formatRelativeTime(caseData.updatedAt)}
              </MetadataValue>
            </MetadataItem>

            {caseData.community && (
              <MetadataItem>
                <MetadataLabel size="sm">Location</MetadataLabel>
                <MetadataValue size="sm">
                  {caseData.community.name}
                </MetadataValue>
              </MetadataItem>
            )}
          </QuickMetadata>
        </CaseHeaderCard>
      </PageHeader>

      {/* Content Area with Tabs */}
      <ContentArea>
        <TabsContainer>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  title={tab.description}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <tab.component
                  case={caseData}
                  caseId={caseId}
                  onRefresh={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  onAssign={handleAssign}
                  onAddComment={handleAddComment}
                  onEscalate={handleEscalate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContainer>
      </ContentArea>

      {/* Modals */}
      <DeleteCaseModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        case={deleteModal.case}
        onSuccess={handleModalSuccess}
      />

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
    </PageContainer>
  );
}

export default CaseDetails;
