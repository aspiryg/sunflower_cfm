// Create this file: /frontend/src/features/cases/modals/AssignCaseModal.jsx
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
import FormField from "../../../ui/FormField";
import { Textarea } from "../../../ui/FormField";
import StatusBadge from "../../../ui/StatusBadge";
import Avatar from "../../../ui/Avatar";
import StyledSelect from "../../../ui/StyledSelect";
import DatePicker from "../../../ui/DatePicker";
import { useAssignCase } from "../useCase";
import { useUsers } from "../../user/useUsers";
import { getUserDisplayName, getUserRole } from "../../../utils/userUtils";
import { getColorStyles } from "../../../utils/caseUtils";

const CaseSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const CaseHeader = styled.div`
  margin-bottom: var(--spacing-3);
`;

const CaseRow = styled.div`
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
 * Assign Case Modal Component
 *
 * Allows users to assign case entries to team members with optional comments.
 *
 * Features:
 * - Current assignment display
 * - User selection with search/filter
 * - Assignment comments
 * - User preview with details
 * - Validation and error handling
 * - Loading states
 */
function AssignCaseModal({
  isOpen = false,
  onClose,
  case: caseItem,
  onSuccess,
}) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [comments, setComments] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch assignable users
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const assignableUsers = usersData?.data || [];

  // console.log("Due Date: ", caseItem?.dueDate);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
      setComments("");
      setExpectedCompletionDate(caseItem?.dueDate?.split("T")[0] || "");
      setErrors({});
    }
  }, [isOpen]);

  const assignMutation = useAssignCase({
    onSuccess: (data) => {
      handleClose();
      if (onSuccess) {
        onSuccess(data, caseItem);
      }
    },
  });

  const handleClose = () => {
    if (!assignMutation.isError) {
      setSelectedUserId("");
      setComments("");
      setExpectedCompletionDate("");
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedUserId) {
      newErrors.user = "Please select a user to assign";
    }

    if (selectedUserId === caseItem?.assignedTo?.id?.toString()) {
      newErrors.user = "This case is already assigned to this user";
    }

    if (expectedCompletionDate) {
      const selectedDate = new Date(expectedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.expectedCompletionDate =
          "Expected completion date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await assignMutation.mutateAsync({
        caseId: caseItem.id,
        assignedTo: parseInt(selectedUserId),
        comments: comments.trim() || undefined,
        expectedCompletionDate: expectedCompletionDate || undefined,
      });
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  const findUserById = (userId) => {
    return assignableUsers.find((user) => user.id?.toString() === userId);
  };

  const selectedUser = findUserById(selectedUserId);
  const hasChanges =
    selectedUserId && selectedUserId !== caseItem?.assignedTo?.id?.toString();
  const selectedUserDisplayName = getUserDisplayName(selectedUser);

  // Prepare user options
  const userOptions = usersLoading
    ? [{ value: "loading", label: "Loading users...", disabled: true }]
    : assignableUsers.map((user) => ({
        value: user.id.toString(),
        label: `${getUserDisplayName(user)} - ${getUserRole(user)}${
          user.id === caseItem?.assignedTo?.id ? " (Currently Assigned)" : ""
        }`,
        disabled: user.id === caseItem?.assignedTo?.id,
      }));

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={assignMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        loading={assignMutation.isPending}
        disabled={assignMutation.isPending || !hasChanges}
      >
        <HiOutlineUserPlus />
        Assign Case
      </Button>
    </ModalFooter>
  );

  if (!caseItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Case"
      description="Assign this case to a team member"
      size="md"
      footer={footer}
      closeOnOverlayClick={!assignMutation.isPending}
      closeOnEscape={!assignMutation.isPending}
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

        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Status:
          </Text>
          <StatusBadge
            content={caseItem.status?.name || "Unknown"}
            size="sm"
            style={getColorStyles(caseItem.status?.color || "--color-grey-200")}
          />
        </CaseRow>

        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Priority:
          </Text>
          <StatusBadge
            content={caseItem.priority?.name || "Unknown"}
            size="sm"
            style={getColorStyles(
              caseItem.priority?.color || "--color-grey-200"
            )}
          />
        </CaseRow>

        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Category:
          </Text>
          <Text size="sm">{caseItem.category?.name || "N/A"}</Text>
        </CaseRow>
        {caseItem?.dueDate && (
          <CaseRow>
            <Text size="sm" weight="medium" color="muted">
              Due Date:
            </Text>
            <Text size="sm">
              {caseItem.dueDate
                ? new Date(caseItem.dueDate).toLocaleDateString()
                : "N/A"}
            </Text>
          </CaseRow>
        )}
      </CaseSection>

      {/* Current Assignment */}
      {caseItem.assignedTo && (
        <CurrentAssignmentSection>
          <HiOutlineUser />
          <div>
            <Text size="sm" weight="medium">
              Currently assigned to: {getUserDisplayName(caseItem.assignedTo)}
            </Text>
            <Text size="xs" color="muted">
              {getUserRole(caseItem.assignedTo)} •{" "}
              {caseItem.assignedTo.department || "Sunflower"}
            </Text>
          </div>
        </CurrentAssignmentSection>
      )}

      {/* Assignment Form */}
      <FormSection>
        <FormField
          label="Assign To"
          required
          error={errors.user}
          helpText="Select a team member to assign this case"
        >
          <StyledSelect
            value={selectedUserId}
            onChange={(value) => {
              setSelectedUserId(value);
              setErrors((prev) => ({ ...prev, user: "" }));
            }}
            $hasError={!!errors.user}
            disabled={assignMutation.isPending || usersLoading}
            options={[
              {
                value: "",
                label: usersLoading ? "Loading users..." : "Select a user...",
                disabled: true,
              },
              ...userOptions,
            ]}
            placeholder="Select a user..."
          />
        </FormField>

        {selectedUser && (
          <UserPreview>
            <Avatar
              src={selectedUser?.profilePicture}
              name={selectedUserDisplayName}
            />
            <UserInfo>
              <Text size="sm" weight="semibold">
                {selectedUserDisplayName}
              </Text>
              <Text size="xs" color="muted">
                {getUserRole(selectedUser)} •{" "}
                {selectedUser?.department || "Sunflower"}
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
          label="Expected Completion Date"
          error={errors.expectedCompletionDate}
          helpText="Optional target date for case completion"
        >
          <DatePicker
            value={expectedCompletionDate}
            onChange={(date) => {
              setExpectedCompletionDate(date);
              setErrors((prev) => ({ ...prev, expectedCompletionDate: "" }));
            }}
            disabled={assignMutation.isPending}
            min={new Date().toISOString().split("T")[0]}
            error={errors.expectedCompletionDate}
          />
        </FormField>

        <FormField
          label="Assignment Comments"
          error={errors.comments}
          helpText="Optional comments about this assignment"
        >
          <Textarea
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              setErrors((prev) => ({ ...prev, comments: "" }));
            }}
            placeholder="Add any specific instructions or context for the assignee..."
            rows={3}
            $variant={errors.comments ? "error" : "default"}
            disabled={assignMutation.isPending}
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

      {assignMutation.isPending && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          Assigning case...
        </Text>
      )}
    </Modal>
  );
}

AssignCaseModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  case: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
    status: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    priority: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
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

export default AssignCaseModal;
