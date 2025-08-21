import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import { ConfirmationModal } from "../../../ui/Modal";
import Text from "../../../ui/Text";
import { useDeleteFeedback } from "../useFeedback";

const WarningContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-error-25);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-4);
`;

const WarningIcon = styled.div`
  color: var(--color-error-500);
  margin-top: 2px;

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const WarningContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const FeedbackDetails = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }
`;

const ConfirmationSection = styled.div`
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-25);

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const Checkbox = styled.input`
  width: 1.6rem;
  height: 1.6rem;
  accent-color: var(--color-brand-500);
  cursor: pointer;
  margin-top: 2px; /* Align with text */
`;

const CheckboxContent = styled.div`
  flex: 1;
`;

const CheckboxLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
  cursor: pointer;
  display: block;
`;

/**
 * Delete Feedback Modal Component
 *
 * Provides a comprehensive confirmation dialog for deleting feedback entries.
 * Includes safety measures like confirmation checkbox and detailed feedback info.
 *
 * Features:
 * - Detailed feedback information display
 * - Safety confirmation checkbox
 * - Warning about permanent deletion
 * - Loading state during deletion
 * - Error handling with user feedback
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {Object} feedback - The feedback object to delete
 * @param {function} onSuccess - Optional callback when deletion succeeds
 */
function DeleteFeedbackModal({ isOpen = false, onClose, feedback, onSuccess }) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [disabled, setDisabled] = useState(true);

  // Reset confirmation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset state
      setDisabled(true);
      setConfirmationChecked(false);
    }
  }, [isOpen]);

  const deleteMutation = useDeleteFeedback({
    onSuccess: (data) => {
      onClose();
      if (onSuccess) {
        onSuccess(data, feedback);
      }
    },
    showSuccessToast: true, // Will show success toast automatically
  });

  const handleConfirm = async () => {
    if (!confirmationChecked || !feedback?.id) {
      // console.log("Confirmation not checked or no feedback ID:", {
      //   confirmationChecked,
      //   feedbackId: feedback?.id,
      // });
      return;
    }

    try {
      // console.log("Attempting to delete feedback:", feedback.id);
      await deleteMutation.mutateAsync(feedback.id);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error("Delete failed:", error);
    }
  };

  const handleClose = () => {
    if (!deleteMutation.isLoading) {
      setConfirmationChecked(false);
      onClose();
    }
  };

  const handleCheckboxChange = (e) => {
    console.log("Checkbox changed:", e.target.checked);
    setDisabled(!disabled);
    setConfirmationChecked(e.target.checked);
  };

  if (!feedback) return null;

  // console.log("DeleteFeedbackModal render:", {
  //   isOpen,
  //   confirmationChecked,
  //   isLoading: deleteMutation.isLoading,
  //   feedback: feedback?.title,
  // });

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Feedback"
      description="This action cannot be undone"
      confirmText="Delete Feedback"
      cancelText="Cancel"
      destructive={true}
      isLoading={deleteMutation.isLoading}
      closeOnOverlayClick={!deleteMutation.isLoading}
      closeOnEscape={!deleteMutation.isLoading}
      disabled={disabled}
    >
      <WarningContainer>
        <WarningIcon>
          <HiOutlineExclamationTriangle />
        </WarningIcon>
        <WarningContent>
          <Text size="sm" weight="semibold" color="error">
            Permanent Deletion Warning
          </Text>
          <Text size="sm" color="error">
            This feedback entry and all associated data will be permanently
            deleted. This action cannot be undone and the data cannot be
            recovered.
          </Text>
        </WarningContent>
      </WarningContainer>

      <Text size="sm" color="muted">
        You are about to delete the following feedback entry:
      </Text>

      <FeedbackDetails>
        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Title:
          </Text>
          <Text size="sm" weight="semibold">
            {feedback.title}
          </Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Feedback Number:
          </Text>
          <Text size="sm">{feedback.feedbackNumber || "N/A"}</Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Status:
          </Text>
          <Text size="sm" weight="medium">
            {feedback.status}
          </Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Priority:
          </Text>
          <Text size="sm" weight="medium">
            {feedback.priority}
          </Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Category:
          </Text>
          <Text size="sm">{feedback.category?.name || "N/A"}</Text>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Submitted By:
          </Text>
          <Text size="sm">
            {feedback.submittedBy?.firstName
              ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
              : "Anonymous"}
          </Text>
        </DetailRow>

        {feedback.description && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Description:
            </Text>
            <Text
              size="sm"
              style={{ maxWidth: "300px", wordBreak: "break-word" }}
            >
              {feedback.description.length > 100
                ? `${feedback.description.substring(0, 100)}...`
                : feedback.description}
            </Text>
          </DetailRow>
        )}
      </FeedbackDetails>

      <ConfirmationSection>
        <Text
          size="sm"
          weight="semibold"
          color="muted"
          style={{ marginBottom: "var(--spacing-3)" }}
        >
          Deletion Confirmation
        </Text>

        <CheckboxField>
          <Checkbox
            type="checkbox"
            id="delete-confirmation"
            checked={confirmationChecked}
            onChange={handleCheckboxChange}
            disabled={deleteMutation.isLoading}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="delete-confirmation">
              <Text size="sm" weight="medium">
                I understand that this action is permanent
              </Text>
              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-1)" }}
              >
                I confirm that I want to permanently delete this feedback entry
                and understand that it cannot be recovered.
              </Text>
            </CheckboxLabel>
          </CheckboxContent>
        </CheckboxField>
      </ConfirmationSection>

      {deleteMutation.isLoading && (
        <Text
          size="sm"
          color="muted"
          style={{ marginTop: "var(--spacing-3)", textAlign: "center" }}
        >
          <HiOutlineTrash style={{ marginRight: "var(--spacing-1)" }} />
          Deleting feedback...
        </Text>
      )}
    </ConfirmationModal>
  );
}

DeleteFeedbackModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  feedback: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    feedbackNumber: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.string,
    description: PropTypes.string,
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    submittedBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }),
  onSuccess: PropTypes.func,
};

export default DeleteFeedbackModal;
