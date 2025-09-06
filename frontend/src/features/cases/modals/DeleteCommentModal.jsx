import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineExclamationTriangle, HiOutlineTrash } from "react-icons/hi2";
import { ConfirmationModal } from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Avatar from "../../../ui/Avatar";
import { useDeleteCaseComment } from "../useCaseComments";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";
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

const BadgeContainer = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
`;

const CommentBadge = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);

  ${(props) => {
    switch (props.$variant) {
      case "internal":
        return `
          background: var(--color-info-100);
          color: var(--color-info-700);
        `;
      case "followUp":
        return `
          background: var(--color-warning-100);
          color: var(--color-warning-700);
        `;
      case "resolved":
        return `
          background: var(--color-success-100);
          color: var(--color-success-700);
        `;
      default:
        return `
          background: var(--color-grey-100);
          color: var(--color-grey-700);
        `;
    }
  }}
`;

/**
 * Delete Case Comment Modal Component
 *
 * Provides a comprehensive confirmation dialog for deleting case comments.
 * Includes safety measures like confirmation checkbox and detailed comment info.
 *
 * Features:
 * - Detailed comment information display with user avatars
 * - Safety confirmation checkbox
 * - Warning about permanent deletion
 * - Loading state during deletion
 * - Error handling with user feedback
 */
function DeleteCommentModal({
  isOpen = false,
  onClose,
  comment,
  caseId,
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

  const deleteMutation = useDeleteCaseComment({
    onSuccess: (data) => {
      onClose();
      if (onSuccess) {
        onSuccess(data, comment);
      }
    },
  });

  const handleConfirm = async () => {
    if (!confirmationChecked || !comment?.id || !caseId) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        caseId: caseId,
        commentId: comment.id,
      });
    } catch (error) {
      console.error("Delete comment failed:", error);
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
            <Avatar
              src={comment.createdBy?.profilePicture}
              name={getUserDisplayName(comment.createdBy)}
              size="sm"
            />
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
            Case:
          </Text>
          <div style={{ textAlign: "right" }}>
            <Text size="sm" weight="medium">
              {comment.case?.title || "Unknown Case"}
            </Text>
            <Text size="xs" color="muted">
              #{comment.case?.number || "Unknown"}
            </Text>
          </div>
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
            Type & Visibility:
          </Text>
          <BadgeContainer>
            {comment.isInternal && (
              <CommentBadge $variant="internal">Internal Comment</CommentBadge>
            )}
            {comment.requiresFollowUp && !comment.followUpCompletedAt && (
              <CommentBadge $variant="followUp">
                Requires Follow-up
              </CommentBadge>
            )}
            {comment.followUpCompletedAt && (
              <CommentBadge $variant="resolved">
                Follow-up Completed
              </CommentBadge>
            )}
            {!comment.isInternal && (
              <CommentBadge $variant="default">Public Comment</CommentBadge>
            )}
          </BadgeContainer>
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

        {comment.followUpDate && (
          <DetailRow>
            <Text size="sm" weight="medium" color="muted">
              Follow-up Date:
            </Text>
            <Text size="sm">
              {formatDate(comment.followUpDate, "MMM dd, yyyy")}
            </Text>
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
            disabled={deleteMutation.isPending}
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

      {deleteMutation.isPending && (
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
    commentType: PropTypes.string,
    isInternal: PropTypes.bool,
    requiresFollowUp: PropTypes.bool,
    followUpDate: PropTypes.string,
    followUpCompletedAt: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    createdBy: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      profilePicture: PropTypes.string,
    }),
    case: PropTypes.shape({
      title: PropTypes.string,
      number: PropTypes.string,
    }),
  }),
  caseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSuccess: PropTypes.func,
};

export default DeleteCommentModal;
