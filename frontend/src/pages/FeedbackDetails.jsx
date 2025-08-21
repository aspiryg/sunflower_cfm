import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
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
} from "react-icons/hi2";

import { useFeedback } from "../features/feedback/useFeedback";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import StatusBadge from "../ui/StatusBadge";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import ContextMenu from "../ui/ContextMenu";

// Import detail components (we'll create these)
import FeedbackOverview from "../features/feedback/details/FeedbackOverview";
import FeedbackTimeline from "../features/feedback/details/FeedbackTimeline";
import FeedbackComments from "../features/feedback/details/FeedbackComments";
import FeedbackLocation from "../features/feedback/details/FeedbackLocation";
import FeedbackSettings from "../features/feedback/details/FeedbackSettings";

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
  min-height: 100vh;
  width: 100%;
  min-width: 0; /* Allow shrinking */
  padding: 0 var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: 0 var(--spacing-2);
  }

  @media (max-width: 600px) {
    gap: var(--spacing-3);
    padding: 0 var(--spacing-1);
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
  gap: var(--spacing-2);
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

const BackButton = styled(Button)`
  margin-bottom: var(--spacing-2);
  display: flex;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const FeedbackNumber = styled(Text)`
  font-family: var(--font-mono);
  background-color: var(--color-grey-100);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  display: inline-block;
  width: fit-content;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-grey-200);
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
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  width: 100%;
  min-width: 0; /* Allow shrinking */

  @media (max-width: 600px) {
    border-radius: var(--border-radius-md);
    border-left: none;
    border-right: none;
    margin: 0 calc(-1 * var(--spacing-1));
  }
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

/**
 * Feedback Details Page Component
 *
 * Displays comprehensive information about a single feedback entry
 * with organized tabs for different aspects and full CRUD operations
 */
function FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

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

  // Fetch feedback data
  const {
    data: feedback,
    isLoading,
    error,
    refetch,
    isError,
  } = useFeedback(feedbackId);

  //   console.log("Feedback data:", feedback);

  // Navigation handlers
  const handleBack = () => {
    navigate("/feedback");
  };

  const handleEdit = () => {
    navigate(`/feedback/edit/${feedbackId}`);
  };

  // Action handlers
  const handleDelete = () => {
    setDeleteModal({ isOpen: true, feedback });
  };

  const handleUpdateStatus = () => {
    setStatusModal({ isOpen: true, feedback });
  };

  const handleAssign = () => {
    setAssignModal({ isOpen: true, feedback });
  };

  const handleRefresh = () => {
    refetch();
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

  // Success handlers
  const handleModalSuccess = (data, originalFeedback) => {
    console.log("Modal operation successful:", { data, originalFeedback });
    // Refresh data or handle navigation if needed
  };

  // Get context menu items
  const getContextMenuItems = () => [
    {
      key: "edit",
      label: "Edit Feedback",
      icon: HiOutlinePencil,
      onClick: handleEdit,
      group: "primary",
    },
    {
      key: "status",
      label: "Update Status",
      icon: HiOutlineFlag,
      onClick: handleUpdateStatus,
      group: "secondary",
    },
    {
      key: "assign",
      label: "Assign to User",
      icon: HiOutlineUserPlus,
      onClick: handleAssign,
      group: "secondary",
    },
    {
      key: "delete",
      label: "Delete",
      icon: HiOutlineTrash,
      onClick: handleDelete,
      variant: "danger",
      group: "danger",
    },
  ];

  // Tab configuration
  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: HiOutlineInformationCircle,
      component: FeedbackOverview,
    },
    {
      value: "timeline",
      label: "Timeline",
      icon: HiOutlineClock,
      component: FeedbackTimeline,
    },
    {
      value: "comments",
      label: "Comments",
      icon: HiOutlineChatBubbleLeft,
      component: FeedbackComments,
    },
    {
      value: "location",
      label: "Location",
      icon: HiOutlineMapPin,
      component: FeedbackLocation,
    },
    {
      value: "settings",
      label: "Settings",
      icon: HiOutlineCog6Tooth,
      component: FeedbackSettings,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading feedback details...
          </Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (isError || !feedback) {
    return (
      <PageContainer>
        <ErrorContainer>
          <Text size="lg" weight="semibold" color="error">
            {error?.response?.status === 404
              ? "Feedback not found"
              : "Failed to load feedback details"}
          </Text>
          <Text size="sm" color="muted">
            {error?.message ||
              "The feedback you're looking for doesn't exist or has been deleted."}
          </Text>
          <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <Button variant="secondary" onClick={handleBack}>
              Back to Feedback List
            </Button>
            <Button variant="primary" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <PageHeader>
        <BackButton
          variant="outline"
          size="small"
          onClick={handleBack}
          aria-label="Go back to feedback list"
        >
          <HiOutlineArrowLeft />
          Back to Feedback
        </BackButton>

        <HeaderTop>
          {/* <HeaderContent>
            <IconButton
              variant="ghost"
              size="medium"
              onClick={handleBack}
              aria-label="Go back to feedback list"
            >
              <HiOutlineArrowLeft />
            </IconButton>
          </HeaderContent> */}
          <HeaderContent>
            <TitleSection>
              <FeedbackNumber size="sm" weight="medium">
                {feedback.feedbackNumber}
              </FeedbackNumber>
              <Heading as="h1" size="h1">
                {feedback.title}
              </Heading>
            </TitleSection>

            <StatusSection>
              <StatusBadge content={feedback.status} size="md" />
              <StatusBadge content={feedback.priority} size="md" />
              {feedback.isSensitive && (
                <StatusBadge content="Sensitive" variant="warning" size="md" />
              )}
            </StatusSection>
          </HeaderContent>

          <HeaderActions>
            <Button variant="secondary" onClick={handleEdit}>
              <HiOutlinePencil />
              Edit
            </Button>

            <ContextMenu
              items={getContextMenuItems()}
              header="Feedback Actions"
              trigger={
                <IconButton variant="ghost" size="medium">
                  <HiOutlineEllipsisVertical />
                </IconButton>
              }
            />
          </HeaderActions>
        </HeaderTop>

        {/* Quick Metadata */}
        <MetadataGrid>
          <MetadataItem>
            <MetadataLabel size="sm">Category</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {feedback.category?.name || "N/A"}
            </MetadataValue>
          </MetadataItem>

          <MetadataItem>
            <MetadataLabel size="sm">Channel</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {feedback.feedbackChannel?.name || "N/A"}
            </MetadataValue>
          </MetadataItem>

          <MetadataItem>
            <MetadataLabel size="sm">Submitted By</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {feedback.submittedBy?.firstName
                ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
                : feedback.providerName || "Anonymous"}
            </MetadataValue>
          </MetadataItem>

          <MetadataItem>
            <MetadataLabel size="sm">Assigned To</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {feedback.assignedTo?.firstName
                ? `${feedback.assignedTo.firstName} ${feedback.assignedTo.lastName}`
                : "Unassigned"}
            </MetadataValue>
          </MetadataItem>

          <MetadataItem>
            <MetadataLabel size="sm">Created</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </MetadataValue>
          </MetadataItem>

          <MetadataItem>
            <MetadataLabel size="sm">Last Updated</MetadataLabel>
            <MetadataValue size="sm" weight="medium">
              {new Date(feedback.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </MetadataValue>
          </MetadataItem>
        </MetadataGrid>
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
                  // data-label={tab.label.charAt(0)} // First letter for mobile fallback
                >
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <tab.component
                  feedback={feedback}
                  feedbackId={feedbackId}
                  onRefresh={handleRefresh}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  onAssign={handleAssign}
                />
              </TabsContent>
            ))}
          </Tabs>
        </TabsContainer>
      </ContentArea>

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

export default FeedbackDetails;
