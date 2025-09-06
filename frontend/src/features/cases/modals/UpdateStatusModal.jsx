// Create this file: /frontend/src/features/cases/modals/UpdateStatusModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineCheck,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import { Textarea } from "../../../ui/FormField";
import StatusBadge from "../../../ui/StatusBadge";
import StyledSelect from "../../../ui/StyledSelect";
import { useChangeCaseStatus } from "../useCase";
import { useCaseStatuses } from "../useCaseData";
import { getColorStyles } from "../../../utils/caseUtils";

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

const CaseTitle = styled.div`
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

/**
 * Update Status Modal Component for Cases
 *
 * Allows users to update the status of case entries with optional reasoning.
 *
 * Features:
 * - Current status display with case information
 * - Status selection with descriptions
 * - Optional comments/notes field
 * - Status change preview
 * - Validation and error handling
 * - Loading states
 */
function UpdateStatusModal({
  isOpen = false,
  onClose,
  case: caseItem,
  onSuccess,
}) {
  const [selectedStatusId, setSelectedStatusId] = useState("");
  const [comments, setComments] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch available statuses
  const { data: statusesData, isLoading: statusesLoading } = useCaseStatuses();
  const statuses = statusesData?.data || [];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && caseItem) {
      setSelectedStatusId(caseItem.status?.id?.toString() || "");
      setComments("");
      setErrors({});
    }
  }, [isOpen, caseItem]);

  const updateStatusMutation = useChangeCaseStatus({
    onSuccess: (data) => {
      handleClose();
      if (onSuccess) {
        onSuccess(data, caseItem);
      }
    },
  });

  const handleClose = () => {
    if (!updateStatusMutation.isError) {
      setSelectedStatusId("");
      setComments("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedStatusId) {
      newErrors.status = "Please select a status";
    }

    if (selectedStatusId === caseItem?.status?.id?.toString()) {
      newErrors.status = "Please select a different status";
    }

    // Require comments for certain status changes
    const selectedStatus = statuses.find(
      (s) => s.id?.toString() === selectedStatusId
    );
    const requiresComments = ["resolved", "closed", "rejected"];
    if (
      selectedStatus &&
      requiresComments.includes(selectedStatus.name?.toLowerCase()) &&
      !comments.trim()
    ) {
      newErrors.comments = `A comment is required when changing status to ${selectedStatus.name}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await updateStatusMutation.mutateAsync({
        caseId: caseItem.id,
        statusId: parseInt(selectedStatusId),
        statusOptions: {
          comments: comments.trim() || undefined,
          reason: comments.trim() || undefined,
        },
      });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const selectedStatus = statuses.find(
    (s) => s.id?.toString() === selectedStatusId
  );
  const currentStatus = caseItem?.status;
  const hasChanges =
    selectedStatusId && selectedStatusId !== caseItem?.status?.id?.toString();

  // Prepare status options
  const statusOptions = statusesLoading
    ? [{ value: "loading", label: "Loading statuses...", disabled: true }]
    : statuses.map((status) => ({
        value: status.id.toString(),
        label:
          status.id === currentStatus?.id
            ? `${status.name} (Current)`
            : status.name,
        disabled: status.id === currentStatus?.id,
      }));

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={updateStatusMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={updateStatusMutation.isPending}
        disabled={updateStatusMutation.isPending || !hasChanges}
      >
        <HiOutlineCheck />
        Update Status
      </Button>
    </ModalFooter>
  );

  if (!caseItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Case Status"
      description="Change the status of this case entry"
      size="md"
      footer={footer}
      closeOnOverlayClick={!updateStatusMutation.isPending}
      closeOnEscape={!updateStatusMutation.isPending}
    >
      {/* Current Status Section */}
      <CurrentStatusSection>
        <CaseTitle>
          <Text size="sm" weight="semibold" color="muted">
            Case Entry
          </Text>
          <Text size="md" weight="semibold">
            {caseItem.title}
          </Text>
          <Text size="sm" color="muted">
            {caseItem.caseNumber}
          </Text>
        </CaseTitle>

        <StatusRow>
          <Text size="sm" weight="medium" color="muted">
            Current Status:
          </Text>
          <StatusBadge
            content={currentStatus?.name || "Unknown"}
            size="sm"
            style={getColorStyles(currentStatus?.color || "--color-grey-200")}
          />
        </StatusRow>

        {currentStatus?.description && (
          <Text size="xs" color="muted">
            {currentStatus.description}
          </Text>
        )}
      </CurrentStatusSection>

      {/* Status Selection Form */}
      <FormSection>
        <FormField
          label="New Status"
          required
          error={errors.status}
          helpText="Select the new status for this case"
        >
          <StyledSelect
            value={selectedStatusId}
            onChange={(value) => {
              setSelectedStatusId(value);
              setErrors((prev) => ({ ...prev, status: "" }));
            }}
            $hasError={!!errors.status}
            disabled={updateStatusMutation.isPending || statusesLoading}
            options={[
              { value: "", label: "Select new status..." },
              ...statusOptions.sort((a, b) => a.value - b.value),
            ]}
            placeholder="Select new status..."
          />
        </FormField>

        {selectedStatus && (
          <StatusPreview>
            <HiOutlineClipboardDocumentList />
            <div>
              <Text size="sm" weight="medium">
                {selectedStatus.name}
              </Text>
              <Text size="xs" color="muted">
                {selectedStatus.description || "No description available"}
              </Text>
              {selectedStatus.isFinal && (
                <Text
                  size="xs"
                  color="warning"
                  style={{ marginTop: "var(--spacing-1)" }}
                >
                  Note: This is a final status - the case will be closed
                </Text>
              )}
            </div>
          </StatusPreview>
        )}

        {/* Comments/Notes Section */}
        <CommentsSection>
          <FormField
            label="Comments/Reason for Change"
            error={errors.comments}
            helpText={
              selectedStatus &&
              ["resolved", "closed", "rejected"].includes(
                selectedStatus.name?.toLowerCase()
              )
                ? "A comment is required for this status change"
                : "Optional notes about this status change"
            }
            required={
              selectedStatus &&
              ["resolved", "closed", "rejected"].includes(
                selectedStatus.name?.toLowerCase()
              )
            }
          >
            <Textarea
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setErrors((prev) => ({ ...prev, comments: "" }));
              }}
              placeholder="Explain why you're changing the status..."
              rows={3}
              $variant={errors.comments ? "error" : "default"}
              disabled={updateStatusMutation.isPending}
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

      {updateStatusMutation.isPending && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          Updating case status...
        </Text>
      )}
    </Modal>
  );
}

UpdateStatusModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  case: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
    status: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
      isFinal: PropTypes.bool,
    }),
  }),
  onSuccess: PropTypes.func,
};

export default UpdateStatusModal;
