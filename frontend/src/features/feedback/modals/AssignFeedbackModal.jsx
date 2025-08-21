import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineUserPlus,
  HiOutlineUser,
  HiOutlineCheck,
} from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField, { Select, Textarea } from "../../../ui/FormField";
import StatusBadge from "../../../ui/StatusBadge";
import Avatar from "../../../ui/Avatar";
import StyledSelect from "../../../ui/StyledSelect";
import { useAssignFeedback } from "../useFeedback";
import { useFeedbackUsers } from "../useFeedbackUsers";
import { getUserDisplayName } from "../../../utils/userUtils";

const FeedbackSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const FeedbackHeader = styled.div`
  margin-bottom: var(--spacing-3);
`;

const FeedbackRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);

  &:last-child {
    margin-bottom: 0;
  }
`;

const CurrentAssignmentSection = styled.div`
  background-color: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const UserPreview = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-brand-25);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-3);
`;

const UserAvatar = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-brand-600);
  font-weight: var(--font-weight-semibold);
`;

const UserInfo = styled.div`
  flex: 1;
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
 * Assign Feedback Modal Component
 *
 * Allows users to assign feedback entries to team members with optional comments.
 *
 * Features:
 * - Current assignment display
 * - User selection with search/filter
 * - Assignment comments
 * - User preview with details
 * - Validation and error handling
 * - Loading states
 *
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback when modal is closed
 * @param {Object} feedback - The feedback object to assign
 * @param {function} onSuccess - Optional callback when assignment succeeds
 */
function AssignFeedbackModal({ isOpen = false, onClose, feedback, onSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [comments, setcomments] = useState("");
  const [errors, setErrors] = useState({});
  const defaultOrganizationName = "Sunflower";

  // Fetch assignable users
  const { data: assignableUsers = [], isLoading: usersLoading } =
    useFeedbackUsers();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
      setcomments("");
      setErrors({});
    }
  }, [isOpen]);

  const assignMutation = useAssignFeedback({
    onSuccess: (data) => {
      handleClose();
      if (onSuccess) {
        onSuccess(data, feedback);
      }
    },
    showSuccessToast: true,
  });

  const handleClose = () => {
    if (!assignMutation.isLoading) {
      setSelectedUserId("");
      setcomments("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedUserId) {
      newErrors.user = "Please select a user to assign";
    }

    if (selectedUserId === feedback?.assignedTo?.id?.toString()) {
      newErrors.user = "This feedback is already assigned to this user";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await assignMutation.mutateAsync({
        id: feedback.id,
        assignedTo: parseInt(selectedUserId),
        assignedBy: 1, // TODO: Get current user ID from auth context
        comments: comments.trim() || undefined,
      });
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const findUserById = (userId) => {
    return assignableUsers.find((user) => user.id?.toString() === userId);
  };

  const findUserByEmail = (email) => {
    return assignableUsers.find((user) => user.email === email);
  };

  const selectedUser = findUserById(selectedUserId);
  const hasChanges =
    selectedUserId && selectedUserId !== feedback?.assignedTo?.id?.toString();

  const selectedUserDisplayName = getUserDisplayName(selectedUser);

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={assignMutation.isLoading}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={assignMutation.isLoading}
        disabled={assignMutation.isLoading || !hasChanges}
      >
        <HiOutlineUserPlus />
        Assign Feedback
      </Button>
    </ModalFooter>
  );

  if (!feedback) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Feedback"
      description="Assign this feedback to a team member"
      size="md"
      footer={footer}
      closeOnOverlayClick={!assignMutation.isLoading}
      closeOnEscape={!assignMutation.isLoading}
    >
      {/* Feedback Information */}
      <FeedbackSection>
        <FeedbackHeader>
          <Text size="sm" weight="semibold" color="muted">
            Feedback Entry
          </Text>
          <Text size="md" weight="semibold">
            {feedback.title}
          </Text>
          <Text size="sm" color="muted">
            {feedback.feedbackNumber}
          </Text>
        </FeedbackHeader>

        <FeedbackRow>
          <Text size="sm" weight="medium" color="muted">
            Status:
          </Text>
          <StatusBadge content={feedback.status} size="sm" />
        </FeedbackRow>

        <FeedbackRow>
          <Text size="sm" weight="medium" color="muted">
            Priority:
          </Text>
          <StatusBadge content={feedback.priority} size="sm" />
        </FeedbackRow>

        <FeedbackRow>
          <Text size="sm" weight="medium" color="muted">
            Category:
          </Text>
          <Text size="sm">{feedback.category?.name || "N/A"}</Text>
        </FeedbackRow>
      </FeedbackSection>

      {/* Current Assignment */}
      {feedback.assignedTo && (
        <CurrentAssignmentSection>
          <HiOutlineUser />
          <div>
            <Text size="sm" weight="medium">
              Currently assigned to:{" "}
              {getUserDisplayName(findUserByEmail(feedback.assignedTo.email))}
            </Text>
            <Text size="xs" color="muted">
              {findUserByEmail(feedback.assignedTo.email)?.role} •{" "}
              {findUserByEmail(feedback.assignedTo.email)?.department ||
                defaultOrganizationName}
            </Text>
          </div>
        </CurrentAssignmentSection>
      )}

      {/* Assignment Form */}
      <FormSection>
        {/* <FormField
          label="Assign To"
          required
          error={errors.user}
          helpText="Select a team member to assign this feedback"
        >
          <Select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setErrors((prev) => ({ ...prev, user: "" }));
            }}
            $hasError={!!errors.user}
            disabled={assignMutation.isLoading || usersLoading}
          >
            <option value="">
              {usersLoading ? "Loading users..." : "Select a user..."}
            </option>
            {assignableUsers.map((user) => (
              <option
                key={user.id}
                value={user.id}
                disabled={user.id === feedback.assignedTo?.id}
              >
                {user.firstName} {user.lastName} - {user.role}
                {user.id === feedback.assignedTo?.id
                  ? " (Currently Assigned)"
                  : ""}
              </option>
            ))}
          </Select>
        </FormField> */}
        <FormField
          label="Assign To"
          required
          error={errors.user}
          helpText="Select a team member to assign this feedback"
        >
          <StyledSelect
            value={selectedUserId}
            onChange={(value) => {
              setSelectedUserId(value);
              setErrors((prev) => ({ ...prev, user: "" }));
            }}
            $hasError={!!errors.user}
            disabled={assignMutation.isLoading || usersLoading}
            options={[
              {
                value: "",
                label: usersLoading ? "Loading users..." : "Select a user...",
                isDisabled: true,
              },
              ...assignableUsers.map((user) => ({
                value: user.id.toString(),
                label: `${getUserDisplayName(user)} - ${user?.role}${
                  user.id === feedback.assignedTo?.id
                    ? " (Currently Assigned)"
                    : ""
                }`,
                disabled: user.id === feedback.assignedTo?.id,
              })),
            ]}
          ></StyledSelect>
        </FormField>
        {selectedUser && (
          <UserPreview>
            <Avatar
              src={selectedUser?.profilePicture}
              name={selectedUserDisplayName}
            />
            {/* <UserAvatar>
              {selectedUser.firstName?.[0]}
              {selectedUser.lastName?.[0]}
            </UserAvatar> */}
            <UserInfo>
              <Text size="sm" weight="semibold">
                {selectedUserDisplayName}
              </Text>
              <Text size="xs" color="muted">
                {selectedUser.role} •{" "}
                {selectedUser?.department || defaultOrganizationName}
              </Text>
              {selectedUser.email && (
                <Text size="xs" color="muted">
                  {selectedUser.email}
                </Text>
              )}
            </UserInfo>
          </UserPreview>
        )}

        <FormField
          label="Assignment comments"
          error={errors.comments}
          helpText="Optional comments about this assignment"
        >
          <Textarea
            value={comments}
            onChange={(e) => {
              setcomments(e.target.value);
              setErrors((prev) => ({ ...prev, comments: "" }));
            }}
            placeholder="Add any specific instructions or context for the assignee..."
            rows={3}
            $hasError={!!errors.comments}
            disabled={assignMutation.isLoading}
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
      </FormSection>

      {assignMutation.isLoading && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          Assigning feedback...
        </Text>
      )}
    </Modal>
  );
}

AssignFeedbackModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  feedback: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    feedbackNumber: PropTypes.string,
    status: PropTypes.string,
    priority: PropTypes.string,
    category: PropTypes.shape({
      name: PropTypes.string,
    }),
    assignedTo: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      role: PropTypes.string,
      department: PropTypes.string,
    }),
  }),
  onSuccess: PropTypes.func,
};

export default AssignFeedbackModal;
