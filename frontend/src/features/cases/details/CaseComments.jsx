import { useState, useRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineChatBubbleLeft,
  HiOutlineClock,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEllipsisVertical,
  HiOutlineHeart,
  HiOutlinePaperAirplane,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineFlag,
} from "react-icons/hi2";
import { HiOutlineReply } from "react-icons/hi";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import Avatar from "../../../ui/Avatar";
import Textarea from "../../../ui/Textarea";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import ContextMenu from "../../../ui/ContextMenu";
import Heading from "../../../ui/Heading";
import Switch from "../../../ui/Switch";
import DatePicker from "../../../ui/DatePicker";

// Import the comment hooks
import {
  useCaseComments,
  useCreateCaseComment,
  useUpdateCaseComment,
  // useDeleteCaseComment,
  useMarkCommentFollowUpCompleted,
} from "../useCaseComments";

// Import permission hooks
import { useAuth } from "../../../contexts/AuthContext";
import { useCommentPermissions } from "../../../hooks/useRoleBasedAuth";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";
import { getUserDisplayName } from "../../../utils/userUtils";

// Import delete modal
import DeleteCommentModal from "../modals/DeleteCommentModal";

// ... Keep all existing styled components (they're fine) ...
const CommentsContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }

  @media (max-width: 640px) {
    padding: var(--spacing-3);
  }
`;

const CommentsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const CommentsStats = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const CommentForm = styled(Card)`
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-6);
  border: 2px solid var(--color-brand-100);
  background: linear-gradient(
    135deg,
    var(--color-grey-0),
    var(--color-brand-25)
  );

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const FormHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const FormOptions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const OptionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CharacterCount = styled(Text)`
  color: ${(props) =>
    props.$overLimit ? "var(--color-error-500)" : "var(--color-grey-400)"};
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const CommentItem = styled(Card)`
  padding: var(--spacing-5);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-md);
  }

  ${(props) =>
    props.$isInternal &&
    `
    border-left: 4px solid var(--color-info-500);
    background: linear-gradient(135deg, var(--color-info-25), var(--color-info-50));
  `}

  ${(props) =>
    props.$requiresFollowUp &&
    `
    border-left: 4px solid var(--color-warning-500);
    background: linear-gradient(135deg, var(--color-warning-25), var(--color-warning-50));
  `}

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
  gap: var(--spacing-3);
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const CommentContent = styled.div`
  margin-left: 4.4rem;

  @media (max-width: 640px) {
    margin-left: 0;
    margin-top: var(--spacing-3);
  }
`;

const CommentText = styled(Text)`
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-100);

  @media (max-width: 640px) {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
`;

const MetaAction = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  background: none;
  border: none;
  color: var(--color-grey-500);
  cursor: pointer;
  padding: var(--spacing-1);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  transition: color var(--duration-normal) var(--ease-in-out);

  &:hover {
    color: var(--color-grey-700);
    background-color: var(--color-grey-50);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const CommentBadges = styled.div`
  display: flex;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
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

const EmptyState = styled(Card)`
  padding: var(--spacing-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  border: 2px dashed var(--color-grey-200);
`;

const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-400);
  border-radius: 50%;

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
`;

const ErrorState = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-error-200);
  background-color: var(--color-error-25);
  text-align: center;
`;

const EditCommentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-top: var(--spacing-3);
`;

const EditActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
  justify-content: flex-end;
`;

/**
 * Case Comments Component
 *
 * Displays and manages case comments with enhanced features
 * for case management including internal comments, follow-up tracking,
 * and role-based permissions
 */
function CaseComments({ case: caseData, caseId, onRefresh }) {
  const { user: currentUser } = useAuth();
  const {
    canCreateComment,
    canEditComment,
    canDeleteComment,
    // canReadComments,
  } = useCommentPermissions();

  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const textAreaRef = useRef(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    comment: null,
  });

  // Use the case comment hooks
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
    isError,
  } = useCaseComments(caseId);

  const createCommentMutation = useCreateCaseComment({
    onSuccess: () => {
      setNewComment("");
      setRequiresFollowUp(false);
      setFollowUpDate("");
      if (onRefresh) onRefresh();
    },
  });

  const updateCommentMutation = useUpdateCaseComment({
    onSuccess: () => {
      setEditingComment(null);
      setEditText("");
    },
  });

  const markFollowUpMutation = useMarkCommentFollowUpCompleted();

  // FIXED: Updated data structure access
  const comments = commentsData?.data?.data || [];
  const commentCount = commentsData?.data?.pagination?.total || comments.length;

  const handleSubmitComment = async () => {
    if (!newComment.trim() || createCommentMutation.isPending) return;

    try {
      const commentData = {
        comment: newComment.trim(),
        isInternal,
        requiresFollowUp,
        followUpDate: requiresFollowUp && followUpDate ? followUpDate : null,
      };

      await createCommentMutation.mutateAsync({
        caseId: caseId,
        commentData,
      });
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim() || updateCommentMutation.isPending) return;

    try {
      await updateCommentMutation.mutateAsync({
        caseId: caseId,
        commentId: commentId,
        commentData: {
          comment: editText.trim(),
        },
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = (comment) => {
    setDeleteModal({
      isOpen: true,
      comment: comment,
    });
  };

  const handleMarkFollowUpCompleted = async (commentId) => {
    try {
      await markFollowUpMutation.mutateAsync({
        caseId: caseId,
        commentId: commentId,
      });
    } catch (error) {
      console.error("Failed to mark follow-up as completed:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      comment: null,
    });
  };

  const handleDeleteSuccess = (data, originalComment) => {
    console.log("Comment deleted successfully:", { data, originalComment });
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleEditKeyPress = (e, commentId) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleUpdateComment(commentId);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const getContextMenuItems = (comment) => {
    const items = [];

    if (canCreateComment()) {
      items.push({
        key: "reply",
        label: "Reply",
        icon: HiOutlineReply,
        onClick: () => {
          if (textAreaRef.current) {
            textAreaRef.current.focus();
            setNewComment(`@${getUserDisplayName(comment.createdBy)} `);
          }
        },
        group: "primary",
      });
    }

    if (canEditComment(comment)) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: HiOutlinePencil,
        onClick: () => handleEditComment(comment),
        group: "secondary",
      });
    }

    if (comment.requiresFollowUp && !comment.followUpCompletedAt) {
      items.push({
        key: "complete-followup",
        label: "Mark Follow-up Complete",
        icon: HiOutlineCheckCircle,
        onClick: () => handleMarkFollowUpCompleted(comment.id),
        group: "secondary",
      });
    }

    if (canDeleteComment(comment)) {
      items.push({
        key: "delete",
        label: "Delete",
        icon: HiOutlineTrash,
        onClick: () => handleDeleteComment(comment),
        variant: "danger",
        group: "danger",
      });
    }

    return items;
  };

  // Loading state
  if (isLoading) {
    return (
      <CommentsContainer>
        <LoadingState>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading comments...
          </Text>
        </LoadingState>
      </CommentsContainer>
    );
  }

  // Error state
  if (isError) {
    return (
      <CommentsContainer>
        <ErrorState>
          <Text size="lg" weight="semibold" color="error">
            Failed to load comments
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            {error?.message || "Something went wrong while loading comments."}
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={() => refetch()}
            style={{ marginTop: "var(--spacing-3)" }}
          >
            Try Again
          </Button>
        </ErrorState>
      </CommentsContainer>
    );
  }

  const maxLength = 1000;
  const isOverLimit = newComment.length > maxLength;
  const canSubmit =
    newComment.trim().length > 0 &&
    !isOverLimit &&
    !createCommentMutation.isPending;

  return (
    <CommentsContainer>
      {/* Header */}
      <CommentsHeader>
        <HeaderInfo>
          <Text size="lg" weight="semibold">
            Comments & Discussion
          </Text>
          <CommentsStats>
            <Text size="sm" color="muted">
              {commentCount === 0
                ? "No comments yet"
                : `${commentCount} comment${commentCount === 1 ? "" : "s"}`}
            </Text>
            <Text size="sm" color="muted">
              •
            </Text>
            <Text size="sm" color="muted">
              Case #{caseData.caseNumber}
            </Text>
          </CommentsStats>
        </HeaderInfo>
        <Button variant="ghost" size="small" onClick={() => refetch()}>
          <HiOutlineClock />
          Refresh
        </Button>
      </CommentsHeader>

      {/* Add New Comment Form */}
      {canCreateComment() && (
        <CommentForm>
          <FormHeader>
            <Avatar
              src={currentUser?.profilePicture}
              name={getUserDisplayName(currentUser)}
              size="sm"
            />
            <div>
              <Text size="sm" weight="medium">
                Add a comment
              </Text>
              <Text size="xs" color="muted">
                Share updates, questions, or notes about this case
              </Text>
            </div>
          </FormHeader>

          <FormContent>
            <Textarea
              ref={textAreaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write your comment here... Use Ctrl+Enter to submit quickly."
              rows={4}
              disabled={createCommentMutation.isPending}
              style={{
                resize: "vertical",
                minHeight: "10rem",
              }}
            />

            <FormOptions>
              <OptionGroup>
                <Switch
                  checked={isInternal}
                  onChange={setIsInternal}
                  size="sm"
                />
                <Text size="sm">Internal comment</Text>
                <Text size="xs" color="muted">
                  (Only visible to team members)
                </Text>
              </OptionGroup>

              <OptionGroup>
                <Switch
                  checked={requiresFollowUp}
                  onChange={setRequiresFollowUp}
                  size="sm"
                />
                <Text size="sm">Requires follow-up</Text>
                {requiresFollowUp && (
                  <DatePicker
                    value={followUpDate}
                    onChange={setFollowUpDate}
                    placeholder="Follow-up date"
                    size="small"
                  />
                )}
              </OptionGroup>
            </FormOptions>

            <FormActions>
              <div
                style={{
                  display: "flex",
                  gap: "var(--spacing-3)",
                  alignItems: "center",
                }}
              >
                <CharacterCount size="xs" $overLimit={isOverLimit}>
                  {newComment.length}/{maxLength}
                </CharacterCount>
                {isOverLimit && (
                  <Text size="xs" color="error">
                    <HiOutlineExclamationCircle
                      style={{ marginRight: "0.4rem" }}
                    />
                    Comment is too long
                  </Text>
                )}
              </div>

              <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setNewComment("");
                    setRequiresFollowUp(false);
                    setFollowUpDate("");
                  }}
                  disabled={
                    createCommentMutation.isPending || newComment.length === 0
                  }
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSubmitComment}
                  disabled={!canSubmit}
                  loading={createCommentMutation.isPending}
                >
                  <HiOutlinePaperAirplane />
                  Add Comment
                </Button>
              </div>
            </FormActions>
          </FormContent>
        </CommentForm>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <HiOutlineChatBubbleLeft />
          </EmptyIcon>
          <Text size="lg" weight="semibold" color="muted">
            No comments yet
          </Text>
          <Text size="sm" color="muted">
            {canCreateComment()
              ? "Be the first to add a comment or share your thoughts about this case!"
              : "No comments have been added to this case."}
          </Text>
        </EmptyState>
      ) : (
        <CommentsList>
          {comments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((comment) => (
              <CommentItem
                key={comment.id}
                $isInternal={comment.isInternal}
                $requiresFollowUp={
                  comment.requiresFollowUp && !comment.followUpCompletedAt
                }
              >
                <CommentHeader>
                  <CommentAuthor>
                    <Avatar
                      src={comment.createdBy?.profilePicture}
                      name={getUserDisplayName(comment.createdBy)}
                      size="sm"
                    />
                    <AuthorInfo>
                      <Text size="sm" weight="semibold">
                        {getUserDisplayName(comment.createdBy)}
                      </Text>
                      <Text size="xs" color="muted">
                        {formatRelativeTime(comment.createdAt)} •{" "}
                        {formatDate(comment.createdAt, "MMM dd, yyyy HH:mm")}
                        {comment.updatedAt !== comment.createdAt && " (edited)"}
                      </Text>
                    </AuthorInfo>
                  </CommentAuthor>

                  <CommentActions>
                    <ContextMenu
                      items={getContextMenuItems(comment)}
                      trigger={
                        <Button variant="ghost" size="small">
                          <HiOutlineEllipsisVertical />
                        </Button>
                      }
                    />
                  </CommentActions>
                </CommentHeader>

                <CommentContent>
                  {editingComment === comment.id ? (
                    <EditCommentForm>
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, comment.id)}
                        placeholder="Edit your comment..."
                        rows={3}
                        disabled={updateCommentMutation.isPending}
                        autoFocus
                      />
                      <EditActions>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={handleCancelEdit}
                          disabled={updateCommentMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={
                            !editText.trim() || updateCommentMutation.isPending
                          }
                          loading={updateCommentMutation.isPending}
                        >
                          Save Changes
                        </Button>
                      </EditActions>
                    </EditCommentForm>
                  ) : (
                    <>
                      <CommentText size="sm">{comment.comment}</CommentText>

                      <CommentBadges>
                        {comment.isInternal && (
                          <CommentBadge $variant="internal">
                            <HiOutlineFlag size={12} />
                            Internal
                          </CommentBadge>
                        )}
                        {comment.requiresFollowUp &&
                          !comment.followUpCompletedAt && (
                            <CommentBadge $variant="followUp">
                              <HiOutlineClock size={12} />
                              Follow-up Required
                              {comment.followUpDate && (
                                <span>
                                  {" "}
                                  by {formatDate(comment.followUpDate)}
                                </span>
                              )}
                            </CommentBadge>
                          )}
                        {comment.followUpCompletedAt && (
                          <CommentBadge $variant="resolved">
                            <HiOutlineCheckCircle size={12} />
                            Follow-up Completed
                          </CommentBadge>
                        )}
                      </CommentBadges>

                      <CommentMeta>
                        <MetaAction
                          onClick={() => {
                            if (textAreaRef.current) {
                              textAreaRef.current.focus();
                              setNewComment(
                                `@${getUserDisplayName(comment.createdBy)} `
                              );
                            }
                          }}
                        >
                          <HiOutlineReply />
                          Reply
                        </MetaAction>

                        <MetaAction
                          onClick={() => console.log("Like comment")}
                          disabled
                        >
                          <HiOutlineHeart />
                          Like
                        </MetaAction>

                        {comment.requiresFollowUp &&
                          !comment.followUpCompletedAt && (
                            <MetaAction
                              onClick={() =>
                                handleMarkFollowUpCompleted(comment.id)
                              }
                              style={{ color: "var(--color-success-600)" }}
                            >
                              <HiOutlineCheckCircle />
                              Mark Complete
                            </MetaAction>
                          )}
                      </CommentMeta>
                    </>
                  )}
                </CommentContent>
              </CommentItem>
            ))}
        </CommentsList>
      )}

      {/* Helper text */}
      <Text
        size="xs"
        color="muted"
        style={{ textAlign: "center", marginTop: "var(--spacing-6)" }}
      >
        {canCreateComment()
          ? "Comments are automatically saved and create activity timeline entries. Use Ctrl+Enter for quick submission."
          : "You have read-only access to comments. Contact your administrator for comment permissions."}
      </Text>

      {/* Delete Comment Modal */}
      <DeleteCommentModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        comment={deleteModal.comment}
        caseId={caseId}
        onSuccess={handleDeleteSuccess}
      />
    </CommentsContainer>
  );
}

CaseComments.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default CaseComments;
