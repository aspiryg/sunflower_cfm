import { useState, useRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineChatBubbleLeft,
  HiOutlinePaperAirplane,
  HiOutlineUser,
  HiOutlineEllipsisVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineHeart,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineEye,
} from "react-icons/hi2";

import { HiOutlineReply } from "react-icons/hi";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Button from "../../../ui/Button";
import TextArea from "../../../ui/Textarea";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import ContextMenu from "../../../ui/ContextMenu";
import { useAuth } from "../../../contexts/AuthContext";
import { useCommentPermissions } from "../../../hooks/useRoleBasedAuth";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";
import Avatar from "../../../ui/Avatar";

// Import the new comment hooks
import {
  useFeedbackComments,
  useCreateFeedbackComment,
  useUpdateFeedbackComment,
} from "../useFeedbackComments";

// Import the delete comment modal
import DeleteCommentModal from "../modals/DeleteCommentModal";

const CommentsContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 90rem;
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

const UserAvatar = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 2.8rem;
    height: 2.8rem;
  }
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
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

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-md);
  }

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

// Helper functions
// const getUserInitials = (user) => {
//   if (!user) return "?";
//   if (user.firstName && user.lastName) {
//     return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
//   }
//   if (user.username) {
//     return user.username.substring(0, 2).toUpperCase();
//   }
//   return "U";
// };

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
 * Feedback Comments Component
 *
 * Displays and manages feedback comments using the new comment system
 * Provides full CRUD functionality for comments
 */
function FeedbackComments({ feedback, feedbackId, onRefresh }) {
  const { user: currentUser } = useAuth();
  const {
    canCreateComment,
    canEditComment,
    canDeleteComment,
    canReadComments,
  } = useCommentPermissions();

  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const textAreaRef = useRef(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    comment: null,
  });

  // Use the new comment hooks
  const {
    data: commentsData,
    isLoading,
    error,
    refetch,
    isError,
  } = useFeedbackComments(feedbackId);

  const createCommentMutation = useCreateFeedbackComment({
    onSuccess: () => {
      setNewComment("");
      if (onRefresh) onRefresh();
    },
  });

  const updateCommentMutation = useUpdateFeedbackComment({
    onSuccess: () => {
      setEditingComment(null);
      setEditText("");
    },
  });

  const comments = commentsData?.data || [];
  const commentCount = commentsData?.count || comments.length;

  const handleSubmitComment = async () => {
    if (!newComment.trim() || createCommentMutation.isLoading) return;

    try {
      await createCommentMutation.mutateAsync({
        feedbackId: feedbackId,
        commentData: {
          comment: newComment.trim(),
          isInternal: true, // Default to internal comments
        },
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
    if (!editText.trim() || updateCommentMutation.isLoading) return;

    try {
      await updateCommentMutation.mutateAsync({
        feedbackId: feedbackId,
        commentId: commentId,
        commentData: {
          comment: editText.trim(),
        },
      });
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  // Updated delete handler to open modal instead of direct deletion
  const handleDeleteComment = (comment) => {
    setDeleteModal({
      isOpen: true,
      comment: comment,
    });
  };

  // Modal close handler
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      comment: null,
    });
  };

  // Success handler for modal
  const handleDeleteSuccess = (data, originalComment) => {
    console.log("Comment deleted successfully:", { data, originalComment });
    // Data will be automatically updated via React Query cache invalidation
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

  // Permission-based checks
  const canUserCreateComments = canCreateComment();
  // console.log("User can create comments:", canUserCreateComments);
  const canUserReadComments = canReadComments();

  const getCommentContextMenuItems = (comment) => {
    const items = [];
    if (canUserCreateComments) {
      items.push({
        key: "reply",
        label: "Reply",
        icon: HiOutlineReply,
        onClick: () => {
          // Focus the new comment form and add mention
          if (textAreaRef.current) {
            const mention = `@${getUserDisplayName(comment.createdBy)} `;
            setNewComment((prev) => prev + mention);
            textAreaRef.current.focus();
          }
        },
        group: "primary",
      });
    }
    // Edit action (permission-based)
    if (canEditComment(comment)) {
      items.push({
        key: "edit",
        label: "Edit",
        icon: HiOutlinePencil,
        onClick: () => handleEditComment(comment),
        group: "secondary",
      });
    }
    // Delete action (permission-based)
    if (canDeleteComment(comment)) {
      items.push({
        key: "delete",
        label: "Delete",
        icon: HiOutlineTrash,
        onClick: () => handleDeleteComment(comment), // Now opens modal
        variant: "danger",
        group: "danger",
      });
    }
    // If no actions available, show view-only message
    if (items.length === 0) {
      items.push({
        key: "view-only",
        label: "View Only",
        icon: HiOutlineEye,
        disabled: true,
        group: "info",
      });
    }
    return items;
  };

  // Guard against users who cannot read comments
  if (!canUserReadComments) {
    return (
      <CommentsContainer>
        <Card style={{ padding: "var(--spacing-6)", textAlign: "center" }}>
          <Text size="lg" color="error">
            Access Denied
          </Text>
          <Text size="sm" color="muted">
            You don't have permission to view comments for this feedback.
          </Text>
        </Card>
      </CommentsContainer>
    );
  }

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
    !createCommentMutation.isLoading;

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
              Feedback #{feedback.feedbackNumber}
            </Text>
          </CommentsStats>
        </HeaderInfo>
        <Button variant="ghost" size="small" onClick={() => refetch()}>
          <HiOutlineClock />
          Refresh
        </Button>
      </CommentsHeader>

      {/* Add New Comment Form - Only show if user can create comments */}
      {canUserCreateComments && (
        <CommentForm>
          <FormHeader>
            <Avatar
              src={currentUser?.profilePicture}
              name={currentUser?.fullName || currentUser?.username}
              size="sm"
            />
            <div>
              <Text size="sm" weight="medium">
                Add a comment
              </Text>
              <Text size="xs" color="muted">
                {currentUser?.role === "admin" ||
                currentUser?.role === "super_admin"
                  ? "You can comment as an administrator"
                  : "Share your thoughts, updates, or questions about this feedback"}
              </Text>
            </div>
          </FormHeader>

          <FormContent>
            <TextArea
              ref={textAreaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Write your comment here... Use Ctrl+Enter to submit quickly."
              rows={4}
              disabled={createCommentMutation.isLoading}
              style={{
                resize: "vertical",
                minHeight: "10rem",
              }}
            />

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
                  onClick={() => setNewComment("")}
                  disabled={
                    createCommentMutation.isLoading || newComment.length === 0
                  }
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSubmitComment}
                  disabled={!canSubmit}
                  loading={createCommentMutation.isLoading}
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
            {canUserCreateComments
              ? "Be the first to add a comment or share your thoughts about this feedback!"
              : "No comments have been added to this feedback."}
          </Text>
        </EmptyState>
      ) : (
        <CommentsList>
          {comments
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((comment) => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>
                    <Avatar
                      src={comment.createdBy?.profilePicture}
                      name={getUserDisplayName(comment.createdBy)}
                      size="sm"
                    />
                    {/* <UserAvatar>
                      {getUserInitials(comment.createdBy)}
                    </UserAvatar> */}
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
                      items={getCommentContextMenuItems(comment)}
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
                      <TextArea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyPress(e, comment.id)}
                        placeholder="Edit your comment..."
                        rows={3}
                        disabled={updateCommentMutation.isLoading}
                        autoFocus
                      />
                      <EditActions>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={handleCancelEdit}
                          disabled={updateCommentMutation.isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={
                            !editText.trim() || updateCommentMutation.isLoading
                          }
                          loading={updateCommentMutation.isLoading}
                        >
                          Save Changes
                        </Button>
                      </EditActions>
                    </EditCommentForm>
                  ) : (
                    <>
                      <CommentText size="sm">{comment.comment}</CommentText>

                      <CommentMeta>
                        <MetaAction
                          onClick={() => {
                            if (textAreaRef.current) {
                              const mention = `@${getUserDisplayName(
                                comment.createdBy
                              )} `;
                              setNewComment((prev) => prev + mention);
                              textAreaRef.current.focus();
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

                        {comment.isInternal && (
                          <Text size="xs" color="muted">
                            Internal comment
                          </Text>
                        )}
                      </CommentMeta>
                    </>
                  )}
                </CommentContent>
              </CommentItem>
            ))}
        </CommentsList>
      )}

      {/* Permission-based helper text */}
      <Text
        size="xs"
        color="muted"
        style={{ textAlign: "center", marginTop: "var(--spacing-6)" }}
      >
        {canUserCreateComments
          ? "Comments are automatically saved and visible to all team members with access to this feedback. Use Ctrl+Enter for quick submission."
          : "You have read-only access to comments. Contact your administrator to request comment permissions."}
      </Text>

      {/* Delete Comment Modal */}
      <DeleteCommentModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        comment={deleteModal.comment}
        feedbackId={feedbackId}
        onSuccess={handleDeleteSuccess}
      />
    </CommentsContainer>
  );
}

FeedbackComments.propTypes = {
  feedback: PropTypes.object.isRequired,
  feedbackId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default FeedbackComments;
