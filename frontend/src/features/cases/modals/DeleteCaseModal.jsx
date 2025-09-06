// Create this file: /frontend/src/features/cases/modals/DeleteCaseModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import { ConfirmationModal } from "../../../ui/Modal";
import Text from "../../../ui/Text";
import StatusBadge from "../../../ui/StatusBadge";
import { useDeleteCase } from "../useCase";
import { getColorStyles } from "../../../utils/caseUtils";
import { formatDate } from "../../../utils/dateUtils";
import { getUserDisplayName } from "../../../utils/userUtils";

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

const CaseDetails = styled.div`
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

const DetailValue = styled.div`
  text-align: right;
  max-width: 300px;
  word-break: break-word;
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
  margin-top: 2px;
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
 * Delete Case Modal Component
 *
 * Provides a comprehensive confirmation dialog for deleting case entries.
 * Includes safety measures like confirmation checkbox and detailed case info.
 *
 * Features:
 * - Detailed case information display
 * - Safety confirmation checkbox
 * - Warning about permanent deletion
 * - Loading state during deletion
 * - Error handling with user feedback
 */
function DeleteCaseModal({
  isOpen = false,
  onClose,
  case: caseItem,
  onSuccess,
}) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [disabled, setDisabled] = useState(true);

  // Reset confirmation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDisabled(true);
      setConfirmationChecked(false);
    }
  }, [isOpen]);

  const deleteMutation = useDeleteCase({
    onSuccess: (data) => {
      onClose();
      if (onSuccess) {
        onSuccess(data, caseItem);
      }
    },
  });

  const handleConfirm = async () => {
    if (!confirmationChecked || !caseItem?.id) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(caseItem.id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      setConfirmationChecked(false);
      onClose();
    }
  };

  const handleCheckboxChange = (e) => {
    setDisabled(!e.target.checked);
    setConfirmationChecked(e.target.checked);
  };

  if (!caseItem) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Case"
      description="This action cannot be undone"
      confirmText="Delete Case"
      cancelText="Cancel"
      destructive={true}
      isLoading={deleteMutation.isPending}
      closeOnOverlayClick={!deleteMutation.isPending}
      closeOnEscape={!deleteMutation.isPending}
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
            This case entry and all associated data (comments, history,
            attachments) will be permanently deleted. This action cannot be
            undone and the data cannot be recovered.
          </Text>
        </WarningContent>
      </WarningContainer>

      <Text size="sm" color="muted">
        You are about to delete the following case entry:
      </Text>

      <CaseDetails>
        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Title:
          </Text>
          <DetailValue>
            <Text size="sm" weight="semibold">
              {caseItem.title}
            </Text>
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Case Number:
          </Text>
          <DetailValue>
            <Text size="sm">{caseItem.caseNumber || "N/A"}</Text>
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Status:
          </Text>
          <DetailValue>
            <StatusBadge
              content={caseItem.status?.name || "Unknown"}
              size="sm"
              style={getColorStyles(
                caseItem.status?.color || "--color-grey-200"
              )}
            />
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Priority:
          </Text>
          <DetailValue>
            <StatusBadge
              content={caseItem.priority?.name || "Unknown"}
              size="sm"
              style={getColorStyles(
                caseItem.priority?.color || "--color-grey-200"
              )}
            />
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Category:
          </Text>
          <DetailValue>
            <Text size="sm">{caseItem.category?.name || "N/A"}</Text>
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Submitted By:
          </Text>
          <DetailValue>
            <Text size="sm">
              {caseItem.submittedBy
                ? getUserDisplayName(caseItem.submittedBy)
                : "Anonymous"}
            </Text>
          </DetailValue>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Created:
          </Text>
          <DetailValue>
            <Text size="sm">{formatDate(caseItem.createdAt)}</Text>
          </DetailValue>
        </DetailRow>

        {caseItem.assignedTo && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Assigned To:
            </Text>
            <DetailValue>
              <Text size="sm">{getUserDisplayName(caseItem.assignedTo)}</Text>
            </DetailValue>
          </DetailRow>
        )}

        {caseItem.description && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Description:
            </Text>
            <DetailValue>
              <Text size="sm">
                {caseItem.description.length > 100
                  ? `${caseItem.description.substring(0, 100)}...`
                  : caseItem.description}
              </Text>
            </DetailValue>
          </DetailRow>
        )}
      </CaseDetails>

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
            disabled={deleteMutation.isPending}
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
                I confirm that I want to permanently delete this case entry and
                understand that it cannot be recovered.
              </Text>
            </CheckboxLabel>
          </CheckboxContent>
        </CheckboxField>
      </ConfirmationSection>

      {deleteMutation.isPending && (
        <Text
          size="sm"
          color="muted"
          style={{ marginTop: "var(--spacing-3)", textAlign: "center" }}
        >
          <HiOutlineTrash style={{ marginRight: "var(--spacing-1)" }} />
          Deleting case...
        </Text>
      )}
    </ConfirmationModal>
  );
}

DeleteCaseModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  case: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
    description: PropTypes.string,
    createdAt: PropTypes.string,
    status: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    priority: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    submittedBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
    assignedTo: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }),
  onSuccess: PropTypes.func,
};

export default DeleteCaseModal;
