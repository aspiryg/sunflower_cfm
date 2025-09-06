// Create this file: /frontend/src/features/cases/modals/EscalateCaseModal.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineArrowTrendingUp,
  HiOutlineExclamationTriangle,
  HiOutlineUser,
} from "react-icons/hi2";
import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import { Textarea } from "../../../ui/FormField";
import StyledSelect from "../../../ui/StyledSelect";
import StatusBadge from "../../../ui/StatusBadge";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";
import { useEscalateCase } from "../useCase";
import { useUsers } from "../../user/useUsers";
import {
  getUserDisplayName,
  getUserRole,
  ROLE_DEFINITIONS,
} from "../../../utils/userUtils";
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

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const EscalationAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background-color: var(--color-warning-25);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-4);
`;

const AlertIcon = styled.div`
  color: var(--color-warning-500);
  margin-top: 2px;

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const AlertContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const EscalationPreview = styled.div`
  background-color: var(--color-error-25);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin-top: var(--spacing-3);
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
 * Escalate Case Modal Component
 *
 * Allows users to escalate cases to higher-level staff with detailed reasoning.
 *
 * Features:
 * - Case information display
 * - Escalation reason selection
 * - Target escalation level/user selection
 * - Detailed escalation reasoning
 * - Urgency and notification options
 * - Validation and error handling
 */
function EscalateCaseModal({
  isOpen = false,
  onClose,
  case: caseItem,
  onSuccess,
}) {
  const [escalationReason, setEscalationReason] = useState("");
  const [escalationLevel, setEscalationLevel] = useState("");
  const [escalateToUserId, setEscalateToUserId] = useState("");
  const [detailedReason, setDetailedReason] = useState("");
  const [markAsUrgent, setMarkAsUrgent] = useState(false);
  const [notifyImmediately, setNotifyImmediately] = useState(true);
  const [errors, setErrors] = useState({});

  // Fetch users for escalation targets
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const allUsers = usersData?.data || [];

  // Filter users who can receive escalations (managers and above)
  const escalationTargets = allUsers.filter((user) => {
    const userRole = ROLE_DEFINITIONS[user.role];
    return userRole && userRole.level >= 3; // Manager level and above
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && caseItem) {
      setEscalationReason("");
      setEscalationLevel("");
      setEscalateToUserId("");
      setDetailedReason("");
      setMarkAsUrgent(false);
      setNotifyImmediately(true);
      setErrors({});
    }
  }, [isOpen, caseItem]);

  const escalateMutation = useEscalateCase({
    onSuccess: (data) => {
      handleClose();
      if (onSuccess) {
        onSuccess(data, caseItem);
      }
    },
  });

  const handleClose = () => {
    if (!escalateMutation.isPending) {
      setEscalationReason("");
      setEscalationLevel("");
      setEscalateToUserId("");
      setDetailedReason("");
      setMarkAsUrgent(false);
      setNotifyImmediately(true);
      setErrors({});
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!escalationReason) {
      newErrors.escalationReason = "Please select an escalation reason";
    }

    if (!escalationLevel && !escalateToUserId) {
      newErrors.escalationTarget =
        "Please select either an escalation level or specific user";
    }

    if (!detailedReason.trim()) {
      newErrors.detailedReason =
        "Please provide a detailed reason for escalation";
    }

    if (detailedReason.trim().length < 10) {
      newErrors.detailedReason =
        "Detailed reason must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await escalateMutation.mutateAsync({
        caseId: caseItem.id,
        escalationReason: escalationReason,
        escalationOptions: {
          escalationLevel: escalationLevel || undefined,
          escalateToUserId: escalateToUserId
            ? parseInt(escalateToUserId)
            : undefined,
          detailedReason: detailedReason.trim(),
          markAsUrgent,
          notifyImmediately,
        },
      });
    } catch (error) {
      console.error("Escalation failed:", error);
    }
  };

  const selectedUser = escalationTargets.find(
    (user) => user.id?.toString() === escalateToUserId
  );
  const hasRequiredFields =
    escalationReason &&
    detailedReason.trim() &&
    (escalationLevel || escalateToUserId);

  // Escalation reason options
  const escalationReasonOptions = [
    { value: "", label: "Select escalation reason..." },
    {
      value: "complexity",
      label: "Case complexity beyond current skill level",
    },
    { value: "urgency", label: "Urgent case requiring immediate attention" },
    { value: "authority", label: "Requires higher-level authority to resolve" },
    { value: "resources", label: "Additional resources or expertise needed" },
    { value: "policy", label: "Policy clarification or exception needed" },
    { value: "conflict", label: "Conflict resolution required" },
    { value: "timeline", label: "Case approaching or exceeding SLA timelines" },
    { value: "stakeholder", label: "High-profile stakeholder involvement" },
    { value: "other", label: "Other (explain in detailed reason)" },
  ];

  // Escalation level options
  const escalationLevelOptions = [
    { value: "", label: "Select escalation level..." },
    { value: "manager", label: "Team Manager" },
    { value: "senior_manager", label: "Senior Manager" },
    { value: "director", label: "Director Level" },
    { value: "executive", label: "Executive Level" },
  ];

  // User options for specific escalation
  const userOptions = usersLoading
    ? [{ value: "loading", label: "Loading users...", disabled: true }]
    : escalationTargets.map((user) => ({
        value: user.id.toString(),
        label: `${getUserDisplayName(user)} - ${getUserRole(user)}`,
      }));

  const footer = (
    <ModalFooter>
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={escalateMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={handleSubmit}
        loading={escalateMutation.isPending}
        disabled={escalateMutation.isPending || !hasRequiredFields}
      >
        <HiOutlineArrowTrendingUp />
        Escalate Case
      </Button>
    </ModalFooter>
  );

  if (!caseItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Escalate Case"
      description="Escalate this case to higher-level staff"
      size="md"
      footer={footer}
      closeOnOverlayClick={!escalateMutation.isPending}
      closeOnEscape={!escalateMutation.isPending}
    >
      {/* Escalation Alert */}
      <EscalationAlert>
        <AlertIcon>
          <HiOutlineExclamationTriangle />
        </AlertIcon>
        <AlertContent>
          <Text size="sm" weight="semibold" color="warning">
            Case Escalation
          </Text>
          <Text size="sm" color="warning">
            Escalating a case will move it to higher-level staff and may change
            its priority and handling process. Ensure you have attempted to
            resolve the case at your level before escalating.
          </Text>
        </AlertContent>
      </EscalationAlert>

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
            Current Status:
          </Text>
          <StatusBadge
            content={caseItem.status?.name || "Unknown"}
            size="sm"
            style={getColorStyles(caseItem.status?.color || "--color-grey-200")}
          />
        </CaseRow>

        <CaseRow>
          <Text size="sm" weight="medium" color="muted">
            Current Priority:
          </Text>
          <StatusBadge
            content={caseItem.priority?.name || "Unknown"}
            size="sm"
            style={getColorStyles(
              caseItem.priority?.color || "--color-grey-200"
            )}
          />
        </CaseRow>

        {caseItem.assignedTo && (
          <CaseRow>
            <Text size="sm" weight="medium" color="muted">
              Currently Assigned To:
            </Text>
            <Text size="sm">{getUserDisplayName(caseItem.assignedTo)}</Text>
          </CaseRow>
        )}
      </CaseSection>

      {/* Escalation Form */}
      <FormSection>
        <FormField
          label="Escalation Reason"
          required
          error={errors.escalationReason}
          helpText="Why does this case need to be escalated?"
        >
          <StyledSelect
            value={escalationReason}
            onChange={(value) => {
              setEscalationReason(value);
              setErrors((prev) => ({ ...prev, escalationReason: "" }));
            }}
            $hasError={!!errors.escalationReason}
            disabled={escalateMutation.isPending}
            options={escalationReasonOptions}
            placeholder="Select escalation reason..."
          />
        </FormField>

        <FormField
          label="Escalation Target"
          error={errors.escalationTarget}
          helpText="Choose either an escalation level or specific user"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <StyledSelect
              value={escalationLevel}
              onChange={(value) => {
                setEscalationLevel(value);
                if (value) setEscalateToUserId(""); // Clear specific user if level is selected
                setErrors((prev) => ({ ...prev, escalationTarget: "" }));
              }}
              $hasError={!!errors.escalationTarget}
              disabled={escalateMutation.isPending}
              options={escalationLevelOptions}
              placeholder="Select escalation level..."
            />

            <Text size="xs" color="muted" style={{ textAlign: "center" }}>
              OR
            </Text>

            <StyledSelect
              value={escalateToUserId}
              onChange={(value) => {
                setEscalateToUserId(value);
                if (value) setEscalationLevel(""); // Clear level if specific user is selected
                setErrors((prev) => ({ ...prev, escalationTarget: "" }));
              }}
              $hasError={!!errors.escalationTarget}
              disabled={escalateMutation.isPending || usersLoading}
              options={[
                { value: "", label: "Select specific user..." },
                ...userOptions,
              ]}
              placeholder="Select specific user..."
            />
          </div>
        </FormField>

        {selectedUser && (
          <EscalationPreview>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
              }}
            >
              <HiOutlineUser />
              <div>
                <Text size="sm" weight="medium">
                  Escalating to: {getUserDisplayName(selectedUser)}
                </Text>
                <Text size="xs" color="muted">
                  {getUserRole(selectedUser)} •{" "}
                  {selectedUser.department || "Sunflower"}
                </Text>
              </div>
            </div>
          </EscalationPreview>
        )}

        <FormField
          label="Detailed Reason"
          required
          error={errors.detailedReason}
          helpText="Provide a detailed explanation for the escalation"
        >
          <Textarea
            value={detailedReason}
            onChange={(e) => {
              setDetailedReason(e.target.value);
              setErrors((prev) => ({ ...prev, detailedReason: "" }));
            }}
            placeholder="Explain in detail why this case needs to be escalated, what you have already tried, and what specific help or authority is needed..."
            rows={4}
            $variant={errors.detailedReason ? "error" : "default"}
            disabled={escalateMutation.isPending}
            maxLength={1000}
          />
          <Text
            size="xs"
            color="muted"
            style={{ marginTop: "var(--spacing-1)" }}
          >
            {detailedReason.length}/1000 characters
          </Text>
        </FormField>

        {/* Escalation Options */}
        <CheckboxContainer>
          <EnhancedCheckbox
            checked={markAsUrgent}
            onChange={setMarkAsUrgent}
            label="Mark as Urgent"
            // description="Flag this escalation as urgent requiring immediate attention"
            disabled={escalateMutation.isPending}
          />

          <EnhancedCheckbox
            checked={notifyImmediately}
            onChange={setNotifyImmediately}
            label="Immediate Notification"
            // description="Send immediate notification to escalation target(s)"
            disabled={escalateMutation.isPending}
          />
        </CheckboxContainer>
      </FormSection>

      {escalateMutation.isPending && (
        <Text size="sm" color="muted" style={{ textAlign: "center" }}>
          <HiOutlineArrowTrendingUp
            style={{ marginRight: "var(--spacing-1)" }}
          />
          Escalating case...
        </Text>
      )}
    </Modal>
  );
}

EscalateCaseModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  case: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    caseNumber: PropTypes.string,
    status: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    priority: PropTypes.shape({
      name: PropTypes.string,
      color: PropTypes.string,
    }),
    assignedTo: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      role: PropTypes.string,
      department: PropTypes.string,
    }),
  }),
  onSuccess: PropTypes.func,
};

export default EscalateCaseModal;
