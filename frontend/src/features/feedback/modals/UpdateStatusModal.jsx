import { useState } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineCheck,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField, { Select, Textarea } from "../../../ui/FormField";
import StatusBadge from "../../../ui/StatusBadge";
import StyledSelect from "../../../ui/StyledSelect";
import { useUpdateFeedbackStatus } from "../useFeedback";

const CurrentStatusSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
`;

const FeedbackTitle = styled.div`
  margin-bottom: var(--spacing-2);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const StatusPreview = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-brand-25);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-3);
`;

const CommentsSection = styled.div`
  margin-top: var(--spacing-4);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: var(--spacing-2);

    & > * {
      width: 100%;
      justify-content: center;
    }
  }
`;

// Status options configuration
const STATUS_OPTIONS = [
  {
    value: "open",
    label: "Open",
    description: "Feedback received and waiting for action",
  },
  {
    value: "in_progress",
    label: "In Progress",
    description: "Currently being reviewed or addressed",
  },
  {
    value: "pending_response",
    label: "Pending Response",
    description: "Waiting for information from submitter",
  },
  {
    value: "resolved",
    label: "Resolved",
    description: "Issue has been resolved or addressed",
  },
  {
    value: "closed",
    label: "Closed",
    description: "Feedback has been completed and closed",
  },
  {
    value: "archived",
    label: "Archived",
    description: "Moved to archive for record keeping",
  },
];

/**
 * Update Status Modal Component
 *
 * Allows users to update the status of feedback entries with optional commentsing.
 *
 * Features:
 * - Current status display
 * - Status selection with descriptions
 * - Optional comments/notes field
 * - Status change preview
 * - Validation and error handling
 * - Loading states
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {Object} feedback - The feedback object to update
 * @param {function} onSuccess - Optional callback when update succeeds
 */
function UpdateStatusModal({ isOpen = false, onClose, feedback, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [comments, setcomments] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useState(() => {
    if (isOpen && feedback) {
      setSelectedStatus(feedback.status || "");
      setcomments("");
      setErrors({});
    }
  }, [isOpen, feedback]);

  const updateStatusMutation = useUpdateFeedbackStatus({
    onSuccess: (data) => {
      handleClose();
      if (onSuccess) {
        onSuccess(data, feedback);
      }
    },
    showSuccessToast: true,
  });

  const handleClose = () => {
    if (!updateStatusMutation.isLoading) {
      setSelectedStatus("");
      setcomments("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedStatus) {
      newErrors.status = "Please select a status";
    }

    if (selectedStatus === feedback?.status) {
      newErrors.status = "Please select a different status";
    }

    // Require comments for certain status changes
    const requirescomments = ["closed", "archived", "resolved"];
    if (requirescomments.includes(selectedStatus) && !comments.trim()) {
      newErrors.comments = `A comments is required when changing status to ${selectedStatus}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: feedback.id,
        status: selectedStatus,
        comments: comments.trim() || undefined,
      });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const selectedStatusOption = STATUS_OPTIONS.find(
    (option) => option.value === selectedStatus
  );
  const currentStatusOption = STATUS_OPTIONS.find(
    (option) => option.value === feedback?.status
  );
  const hasChanges = selectedStatus && selectedStatus !== feedback?.status;

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={updateStatusMutation.isLoading}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={updateStatusMutation.isLoading}
        disabled={updateStatusMutation.isLoading || !hasChanges}
      >
        <HiOutlineCheck />
        Update Status
      </Button>
    </ModalFooter>
  );

  if (!feedback) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Feedback Status"
      description="Change the status of this feedback entry"
      size="md"
      footer={footer}
      closeOnOverlayClick={!updateStatusMutation.isLoading}
      closeOnEscape={!updateStatusMutation.isLoading}
    >
      {/* Current Status Section */}
      <CurrentStatusSection>
        <FeedbackTitle>
          <Text size="sm" weight="semibold" color="muted">
            Feedback Entry
          </Text>
          <Text size="md" weight="semibold">
            {feedback.title}
          </Text>
          <Text size="sm" color="muted">
            {feedback.feedbackNumber}
          </Text>
        </FeedbackTitle>

        <StatusRow>
          <Text size="sm" weight="medium" color="muted">
            Current Status:
          </Text>
          <StatusBadge content={feedback.status} size="sm" />
        </StatusRow>

        {currentStatusOption && (
          <Text size="xs" color="muted">
            {currentStatusOption.description}
          </Text>
        )}
      </CurrentStatusSection>

      {/* Status Selection Form */}
      <FormSection>
        {/* <FormField
          label="New Status"
          required
          error={errors.status}
          helpText="Select the new status for this feedback"
        >
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setErrors((prev) => ({ ...prev, status: "" }));
            }}
            $hasError={!!errors.status}
            disabled={updateStatusMutation.isLoading}
          >
            <option value="">Select new status...</option>
            {STATUS_OPTIONS.map((status) => (
              <option
                key={status.value}
                value={status.value}
                disabled={status.value === feedback.status}
              >
                {status.label}
                {status.value === feedback.status ? " (Current)" : ""}
              </option>
            ))}
          </Select>
        </FormField> */}
        <FormField
          label="New Status"
          required
          error={errors.status}
          helpText="Select the new status for this feedback"
        >
          <StyledSelect
            value={selectedStatus}
            onChange={(selectedStatus) => {
              setSelectedStatus(selectedStatus);
              setErrors((prev) => ({ ...prev, status: "" }));
            }}
            $hasError={!!errors.status}
            disabled={updateStatusMutation.isLoading}
            options={STATUS_OPTIONS.map((status) => ({
              value: status.value,
              label:
                status.value === feedback.status
                  ? `${status.label} - (Current)`
                  : status.label,
              disabled: status.value === feedback.status,
            }))}
          ></StyledSelect>
        </FormField>
        {selectedStatusOption && (
          <StatusPreview>
            <HiOutlineClipboardDocumentList />
            <div>
              <Text size="sm" weight="medium">
                {selectedStatusOption.label}
              </Text>
              <Text size="xs" color="muted">
                {selectedStatusOption.description}
              </Text>
            </div>
          </StatusPreview>
        )}

        {/* comments/Notes Section */}
        <CommentsSection>
          <FormField
            label="Comments/Reason for this Change"
            error={errors.comments}
            helpText={
              ["closed", "archived", "resolved"].includes(selectedStatus)
                ? "A comments is required for this status change"
                : "Optional notes about this status change"
            }
            required={["closed", "archived", "resolved"].includes(
              selectedStatus
            )}
          >
            <Textarea
              value={comments}
              onChange={(e) => {
                setcomments(e.target.value);
                setErrors((prev) => ({ ...prev, comments: "" }));
              }}
              placeholder="Explain why you're changing the status..."
              rows={3}
              $hasError={!!errors.comments}
              disabled={updateStatusMutation.isLoading}
              maxLength={500}
            />
            <Text
              size="xs"
              color="muted"
              style={{ marginTop: "var(--spacing-1)" }}
            >
              {comments.length}/500 characters
            </Text>
          </FormField>
        </CommentsSection>
      </FormSection>

      {updateStatusMutation.isLoading && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          Updating status...
        </Text>
      )}
    </Modal>
  );
}

UpdateStatusModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  feedback: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    feedbackNumber: PropTypes.string,
    status: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

export default UpdateStatusModal;
