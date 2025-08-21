import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import { ConfirmationModal } from "../../../ui/Modal";
import Text from "../../../ui/Text";
import { useDeleteFeedbackComment } from "../useFeedbackComments";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";

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

const CommentDetails = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-2) 0;
  gap: var(--spacing-3);

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-200);
  }
`;

const CommentText = styled.div`
  background-color: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
  word-wrap: break-word;
  white-space: pre-wrap;
  max-height: 12rem;
  overflow-y: auto;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const UserAvatar = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
  flex-shrink: 0;
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

// Helper functions
const getUserInitials = (user) => {
  if (!user) return "?";
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  if (user.username) {
    return user.username.substring(0, 2).toUpperCase();
  }
  return "U";
};

const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.username) {
    return user.username;
  }
  return "Unknown User";
};

/**
 * Delete Comment Modal Component
 *
 * Provides a comprehensive confirmation dialog for deleting comments.
 * Includes safety measures like confirmation checkbox and detailed comment info.
 *
 * Features:
 * - Detailed comment information display
 * - Safety confirmation checkbox
 * - Warning about permanent deletion
 * - Loading state during deletion
 * - Error handling with user feedback
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {Object} comment - The comment object to delete
 * @param {string|number} feedbackId - The feedback ID the comment belongs to
 * @param {function} onSuccess - Optional callback when deletion succeeds
 */
function DeleteCommentModal({
  isOpen = false,
  onClose,
  comment,
  feedbackId,
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

  const deleteMutation = useDeleteFeedbackComment({
    onSuccess: (data) => {
      onClose();
      if (onSuccess) {
        onSuccess(data, comment);
      }
    },
    showSuccessToast: true,
  });

  const handleConfirm = async () => {
    if (!confirmationChecked || !comment?.id || !feedbackId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        feedbackId: feedbackId,
        commentId: comment.id,
      });
    } catch (error) {
      console.error("Delete comment failed:", error);
    }
  };

  const handleClose = () => {
    if (!deleteMutation.isLoading) {
      setConfirmationChecked(false);
      onClose();
    }
  };

  const handleCheckboxChange = (e) => {
    setDisabled(!e.target.checked);
    setConfirmationChecked(e.target.checked);
  };

  if (!comment) return null;

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title="Delete Comment"
      description="This action cannot be undone"
      confirmText="Delete Comment"
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
            This comment will be permanently deleted. This action cannot be
            undone and the comment cannot be recovered.
          </Text>
        </WarningContent>
      </WarningContainer>

      <Text size="sm" color="muted">
        You are about to delete the following comment:
      </Text>

      <CommentDetails>
        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Author:
          </Text>
          <UserInfo>
            <UserAvatar>{getUserInitials(comment.createdBy)}</UserAvatar>
            <div>
              <Text size="sm" weight="semibold">
                {getUserDisplayName(comment.createdBy)}
              </Text>
              <Text size="xs" color="muted">
                {comment.createdBy?.email || "No email"}
              </Text>
            </div>
          </UserInfo>
        </DetailRow>

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Posted:
          </Text>
          <div style={{ textAlign: "right" }}>
            <Text size="sm">{formatRelativeTime(comment.createdAt)}</Text>
            <Text size="xs" color="muted">
              {formatDate(comment.createdAt, "MMM dd, yyyy HH:mm")}
            </Text>
          </div>
        </DetailRow>

        {comment.updatedAt !== comment.createdAt && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Last edited:
            </Text>
            <div style={{ textAlign: "right" }}>
              <Text size="sm">{formatRelativeTime(comment.updatedAt)}</Text>
              <Text size="xs" color="muted">
                {formatDate(comment.updatedAt, "MMM dd, yyyy HH:mm")}
              </Text>
            </div>
          </DetailRow>
        )}

        <DetailRow>
          <Text size="sm" weight="medium" color="muted">
            Type:
          </Text>
          <Text size="sm">
            {comment.isInternal ? "Internal Comment" : "Public Comment"}
          </Text>
        </DetailRow>

        {comment.comment && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Content:
            </Text>
            <div style={{ flex: 1 }}>
              <CommentText>
                <Text size="sm" style={{ lineHeight: 1.5 }}>
                  {comment.comment}
                </Text>
              </CommentText>
              {comment.comment.length > 200 && (
                <Text
                  size="xs"
                  color="muted"
                  style={{ marginTop: "var(--spacing-2)" }}
                >
                  {comment.comment.length} characters
                </Text>
              )}
            </div>
          </DetailRow>
        )}
      </CommentDetails>

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
            id="delete-comment-confirmation"
            checked={confirmationChecked}
            onChange={handleCheckboxChange}
            disabled={deleteMutation.isLoading}
          />
          <CheckboxContent>
            <CheckboxLabel htmlFor="delete-comment-confirmation">
              <Text size="sm" weight="medium">
                I understand that this action is permanent
              </Text>
              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-1)" }}
              >
                I confirm that I want to permanently delete this comment and
                understand that it cannot be recovered.
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
          Deleting comment...
        </Text>
      )}
    </ConfirmationModal>
  );
}

DeleteCommentModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  comment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    comment: PropTypes.string.isRequired,
    isInternal: PropTypes.bool,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    createdBy: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
    }),
  }),
  feedbackId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onSuccess: PropTypes.func,
};

export default DeleteCommentModal;
