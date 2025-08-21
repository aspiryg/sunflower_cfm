import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { HiOutlineArrowLeft } from "react-icons/hi2";

import Heading from "../ui/Heading";
import Text from "../ui/Text";
import IconButton from "../ui/IconButton";
import FeedbackForm from "../features/feedback/FeedbackForm";

import { useFeedback } from "../features/feedback/useFeedback";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-xl);
  margin: 0 auto;
  min-height: 100vh;
  padding: var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: var(--spacing-2);
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6) 0 var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    padding: var(--spacing-4) 0;
    gap: var(--spacing-3);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
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
  // console.log("Feedback ID:", feedbackId);
  const isEditing = !!feedbackId;

  // Fetch existing feedback data if editing
  const { data: existingFeedback } = useFeedback(feedbackId);

  // Handle successful form submission
  const handleFormSuccess = (data, action) => {
    console.log(`Feedback ${action}d successfully:`, data);

    // Navigate back to feedback list or to the detail view
    navigate("/feedback");
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    navigate("/feedback");
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/feedback");
  };

  return (
    <PageContainer>
      <PageHeader>
        <IconButton
          variant="ghost"
          size="medium"
          onClick={handleBack}
          aria-label="Go back to feedback list"
        >
          <HiOutlineArrowLeft />
        </IconButton>

        <HeaderContent>
          <Heading as="h1" size="h2">
            {isEditing ? "Edit Feedback" : "Add New Feedback"}
          </Heading>
          <Text size="sm" color="muted">
            {isEditing
              ? `Editing feedback entry #${existingFeedback?.feedbackNumber}`
              : "Create a new feedback entry for the Sunflower organization"}
          </Text>
        </HeaderContent>
      </PageHeader>

      <FeedbackForm
        feedbackId={feedbackId}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </PageContainer>
  );
}

export default AddFeedback;
