import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

import Heading from "../ui/Heading";
import Text from "../ui/Text";
import IconButton from "../ui/IconButton";
import Breadcrumb from "../ui/Breadcrumb";
import FeedbackForm from "../features/feedback/FeedbackForm";

import { useFeedback } from "../features/feedback/useFeedback";

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

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-3);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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

/**
 * AddFeedback Page Component
 *
 * Clean page component that handles both creating and editing feedback
 * All form logic is delegated to the FeedbackForm component
 */
function AddFeedback() {
  const navigate = useNavigate();
  const { id: feedbackId } = useParams();
  const isEditing = !!feedbackId;

  // Fetch existing feedback data if editing
  const { data: existingFeedback } = useFeedback(feedbackId);

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      label: "Cases",
      to: "/feedback",
      icon: HiOutlineChatBubbleLeftRight,
    },
    {
      label: isEditing
        ? `Edit Case ${existingFeedback?.feedbackNumber || "#" + feedbackId}`
        : "Create New Case",
      icon: HiOutlineDocumentText,
    },
  ];

  // Handle successful form submission
  const handleFormSuccess = (data, action) => {
    console.log(`Case ${action}d successfully:`, data);
    // Navigate back to feedback list
    navigate("/feedback");
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    navigate("/feedback");
  };

  // Handle back navigation
  // const handleBack = () => {
  //   navigate("/feedback");
  // };

  return (
    <PageContainer>
      <PageHeader>
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Title and Description */}
        <HeaderTop>
          {/* <IconButton
            variant="ghost"
            size="medium"
            onClick={handleBack}
            aria-label="Go back to cases list"
          >
            <HiOutlineArrowLeft />
          </IconButton> */}

          <CaseIcon>
            <HiOutlineDocumentText />
          </CaseIcon>

          <HeaderContent>
            <Heading as="h2" size="h1">
              {isEditing ? "Edit Case" : "Create New Case"}
            </Heading>
            <Text size="md" color="muted">
              {isEditing
                ? `Editing case ${
                    existingFeedback?.feedbackNumber || "#" + feedbackId
                  } - Update information and processing details`
                : "Create a new case for tracking, investigation, and resolution"}
            </Text>
            {isEditing && existingFeedback?.feedbackNumber && (
              <Text size="sm" weight="medium" color="brand">
                Case Number: {existingFeedback.feedbackNumber}
              </Text>
            )}
          </HeaderContent>
        </HeaderTop>
      </PageHeader>

      {/* Case Form */}
      <FeedbackForm
        feedbackId={feedbackId}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </PageContainer>
  );
}

export default AddFeedback;
