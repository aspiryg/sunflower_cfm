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
import { useCreateFeedbackComment } from "../useFeedbackComments";

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

/**
 * Add Comment Modal Component
 *
 */
function AddCommentModal({ isOpen = false, onClose, feedback, onSuccess }) {
  const [comments, setcomments] = useState("");
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useState(() => {
    if (isOpen && feedback) {
      setcomments("");
      setErrors({});
    }
  }, [isOpen, feedback]);

  const addFeedbackComment = useCreateFeedbackComment({
    onSuccess: (data) => {
      if (onSuccess) {
        // console.log("Comment added successfully:", data);
        handleClose();
        onSuccess(data, feedback);
      }
    },
    showSuccessToast: true,
  });

  const handleClose = () => {
    if (!addFeedbackComment.isError) {
      addFeedbackComment.reset();
      setcomments("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!comments.trim()) {
      newErrors.comments = "A comment is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addFeedbackComment.mutateAsync({
        feedbackId: feedback.id,
        commentData: {
          comment: comments.trim(),
          isInternal: true, // Default to internal comments
        },
      });
    } catch (error) {
      console.error("Add comment failed:", error);
    }
  };

  // check if a comment is present
  const isCommentPresent = comments.trim().length > 0;

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={addFeedbackComment.isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={addFeedbackComment.isPending}
        disabled={addFeedbackComment.isPending || !isCommentPresent}
      >
        <HiOutlineCheck />
        Add Comment
      </Button>
    </ModalFooter>
  );

  if (!feedback) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Comment"
      description="Add a new comment to this feedback entry"
      size="md"
      footer={footer}
      closeOnOverlayClick={!addFeedbackComment.isPending}
      closeOnEscape={!addFeedbackComment.isPending}
    >
      <FormSection>
        {/* comments/Notes Section */}
        <CommentsSection>
          <FormField
            label="Comments"
            error={errors.comments}
            helpText={
              "Add any additional comments or context for this feedback entry."
            }
            required={true}
          >
            <Textarea
              value={comments}
              onChange={(e) => {
                setcomments(e.target.value);
                setErrors((prev) => ({ ...prev, comments: "" }));
              }}
              placeholder="Add your comments here..."
              rows={3}
              $hasError={!!errors.comments}
              disabled={addFeedbackComment.isPending}
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

      {addFeedbackComment.isPending && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          Adding comment...
        </Text>
      )}
    </Modal>
  );
}

AddCommentModal.propTypes = {
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

export default AddCommentModal;
