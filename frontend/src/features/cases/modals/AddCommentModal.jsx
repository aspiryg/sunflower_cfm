// Create this file: /frontend/src/features/cases/modals/AddCommentModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { HiOutlineCheck, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import { Textarea } from "../../../ui/FormField";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";
import { useCreateCaseComment } from "../useCaseComments";

const CaseSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const CaseHeader = styled.div`
  margin-bottom: var(--spacing-2);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  margin-top: var(--spacing-3);
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
 * Add Comment Modal Component for Cases
 *
 * Allows users to add comments to case entries with various options.
 *
 * Features:
 * - Case information display
 * - Comment text input with character limit
 * - Internal/external comment toggle
 * - Follow-up requirement option
 * - Validation and error handling
 * - Loading states
 */
function AddCommentModal({
  isOpen = false,
  onClose,
  case: caseItem,
  onSuccess,
}) {
  const [comment, setComment] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && caseItem) {
      setComment("");
      setIsInternal(true);
      setRequiresFollowUp(false);
      setErrors({});
    }
  }, [isOpen, caseItem]);

  const addCommentMutation = useCreateCaseComment({
    onSuccess: () => {
      handleClose();
    },
  });

  const handleClose = () => {
    if (!addCommentMutation.isError) {
      setComment("");
      setIsInternal(true);
      setRequiresFollowUp(false);
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!comment.trim()) {
      newErrors.comment = "A comment is required";
    }

    if (comment.trim().length < 3) {
      newErrors.comment = "Comment must be at least 3 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await addCommentMutation.mutateAsync({
        caseId: caseItem.id,
        commentData: {
          comment: comment.trim(),
          isInternal,
          requiresFollowUp,
        },
      });
    } catch (error) {
      console.error("Add comment failed:", error);
    }
  };

  const isCommentPresent = comment.trim().length > 0;

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={addCommentMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={addCommentMutation.isPending}
        disabled={addCommentMutation.isPending || !isCommentPresent}
      >
        <HiOutlineCheck />
        Add Comment
      </Button>
    </ModalFooter>
  );

  if (!caseItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Comment"
      description="Add a new comment to this case entry"
      size="md"
      footer={footer}
      closeOnOverlayClick={!addCommentMutation.isPending}
      closeOnEscape={!addCommentMutation.isPending}
    >
      {/* Case Information */}
      <CaseSection>
        <CaseHeader>
          <Text size="sm" weight="semibold" color="muted">
            Case Entry
          </Text>
          <Text size="md" weight="semibold">
            {caseItem.title}
          </Text>
          <Text size="sm" color="muted">
            {caseItem.caseNumber}
          </Text>
        </CaseHeader>
      </CaseSection>

      {/* Comment Form */}
      <FormSection>
        <FormField
          label="Comment"
          error={errors.comment}
          required
          helpText="Add your comment or note about this case"
        >
          <Textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setErrors((prev) => ({ ...prev, comment: "" }));
            }}
            placeholder="Enter your comment here..."
            rows={4}
            $variant={errors.comment ? "error" : "default"}
            disabled={addCommentMutation.isPending}
            maxLength={1000}
          />
          <Text
            size="xs"
            color="muted"
            style={{ marginTop: "var(--spacing-1)" }}
          >
            {comment.length}/1000 characters
          </Text>
        </FormField>

        {/* Comment Options */}
        <CheckboxContainer>
          <EnhancedCheckbox
            checked={isInternal}
            onChange={setIsInternal}
            label="Internal Comment"
            // description="This comment will only be visible to team members and not to external stakeholders"
            disabled={addCommentMutation.isPending}
          />

          <EnhancedCheckbox
            checked={requiresFollowUp}
            onChange={setRequiresFollowUp}
            label="Requires Follow-up"
            // description="Mark this comment as requiring follow-up action or response"
            disabled={addCommentMutation.isPending}
          />
        </CheckboxContainer>
      </FormSection>

      {addCommentMutation.isPending && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          <HiOutlineChatBubbleLeftRight
            style={{ marginRight: "var(--spacing-1)" }}
          />
          Adding comment...
        </Text>
      )}
    </Modal>
  );
}

AddCommentModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  case: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

export default AddCommentModal;
