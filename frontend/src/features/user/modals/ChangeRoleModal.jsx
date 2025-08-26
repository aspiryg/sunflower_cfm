import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  HiOutlineExclamationTriangle,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowUpCircle,
  HiOutlineArrowDownCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import StyledSelect from "../../../ui/StyledSelect";
import FormField, { Textarea } from "../../../ui/FormField";
import StatusBadge from "../../../ui/StatusBadge2";
import Avatar from "../../../ui/Avatar";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import { useChangeUserRole } from "../useUsers";
import { useAuth } from "../../../contexts/AuthContext";
import { getUserDisplayName } from "../../../utils/userUtils";
import { ROLES_HIERARCHY } from "../../../services/permissionService";

const UserInfoSection = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const RoleChangeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const RoleComparisonContainer = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-brand-25),
    var(--color-brand-50)
  );
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin: var(--spacing-3) 0;
`;

const RoleComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--spacing-4);
  align-items: center;
  margin-bottom: var(--spacing-3);
`;

const RoleBox = styled.div`
  text-align: center;
  padding: var(--spacing-3);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
`;

const ChangeTypeIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  border-radius: var(--border-radius-md);
  background-color: ${(props) => {
    if (props.$type === "elevation") return "var(--color-success-100)";
    if (props.$type === "demotion") return "var(--color-warning-100)";
    return "var(--color-grey-100)";
  }};
  color: ${(props) => {
    if (props.$type === "elevation") return "var(--color-success-700)";
    if (props.$type === "demotion") return "var(--color-warning-700)";
    return "var(--color-grey-700)";
  }};
`;

const PermissionsPreview = styled.div`
  background-color: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
`;

const PermissionsList = styled.ul`
  margin: 0;
  padding-left: var(--spacing-5);
  list-style: none;
`;

const PermissionItem = styled.li`
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
  position: relative;

  &::before {
    content: "•";
    color: var(--color-brand-500);
    font-weight: bold;
    position: absolute;
    left: calc(-1.5 * var(--spacing-3));
  }
`;

const WarningSection = styled.div`
  background-color: ${(props) => {
    if (props.$type === "elevation") return "var(--color-error-50)";
    if (props.$type === "demotion") return "var(--color-warning-50)";
    return "var(--color-grey-50)";
  }};
  border: 1px solid
    ${(props) => {
      if (props.$type === "elevation") return "var(--color-error-200)";
      if (props.$type === "demotion") return "var(--color-warning-200)";
      return "var(--color-grey-200)";
    }};
  border-left: 4px solid
    ${(props) => {
      if (props.$type === "elevation") return "var(--color-error-500)";
      if (props.$type === "demotion") return "var(--color-warning-500)";
      return "var(--color-grey-500)";
    }};
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
`;

const WarningHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`;

const WarningList = styled.ul`
  margin: 0;
  padding-left: var(--spacing-5);
  color: ${(props) => {
    if (props.$type === "elevation") return "var(--color-error-700)";
    if (props.$type === "demotion") return "var(--color-warning-700)";
    return "var(--color-grey-700)";
  }};
`;

const WarningItem = styled.li`
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
`;

const ProcessingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-grey-100);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  border-radius: var(--border-radius-lg);
  z-index: 10;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--spacing-2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    width: 100%;

    & > * {
      flex: 1;
    }
  }
`;

// Enhanced role configurations with hierarchy and permissions
const ROLE_DEFINITIONS = {
  user: {
    label: "User",
    level: 1,
    color: "green",
    description: "Standard user with basic feedback submission rights",
    permissions: [
      "Submit feedback entries",
      "View own feedback history",
      "Update personal profile",
      "Add comments to own feedback",
    ],
  },
  staff: {
    label: "Staff Member",
    level: 2,
    color: "blue",
    description: "Staff member with assigned feedback management capabilities",
    permissions: [
      "All User permissions",
      "View and manage assigned feedback",
      "Update feedback status",
      "Add comments to any feedback",
      "Access team collaboration tools",
    ],
  },
  manager: {
    label: "Manager",
    level: 3,
    color: "orange",
    description:
      "Manager with comprehensive feedback oversight and team management",
    permissions: [
      "All Staff permissions",
      "View and manage all feedback entries",
      "Assign feedback to team members",
      "Generate reports and analytics",
      "Manage staff assignments",
      "Access advanced filtering options",
    ],
  },
  admin: {
    label: "Administrator",
    level: 4,
    color: "red",
    description: "Administrator with full system access and user management",
    permissions: [
      "All Manager permissions",
      "Manage user accounts and roles",
      "Access system configuration",
      "View audit logs and system reports",
      "Manage system categories and settings",
      "Bulk operations on feedback and users",
    ],
  },
};

function ChangeRoleModal({ isOpen = false, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role || "");
      setReason("");
      setErrors({});
      setIsProcessing(false);
    }
  }, [isOpen, user]);

  const changeRoleMutation = useChangeUserRole({
    onSuccess: (data) => {
      setIsProcessing(false);
      handleClose();
      if (onSuccess) {
        onSuccess(data, user);
      }
    },
    onError: (error, variables) => {
      console.error("Role change failed:", error, variables);
      setIsProcessing(false);
    },
  });

  const handleClose = () => {
    if (!changeRoleMutation.isError) {
      onClose();
    }
  };

  const getAvailableRoles = () => {
    if (!currentUser) return [];

    // Get roles that current user can assign
    return Object.entries(ROLE_DEFINITIONS)
      .filter(([roleKey, roleConfig]) => {
        // Super admin can assign any role (if it exists)
        if (currentUser.role === "super_admin") return true;

        // Use permission service to check if current user can assign this role
        const currentUserLevel = ROLES_HIERARCHY[currentUser.role] || 0;
        return roleConfig.level <= currentUserLevel && roleKey !== user?.role;
      })
      .map(([value, config]) => ({
        value,
        label: config.label,
        disabled: value === user?.role,
      }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRole || selectedRole === user?.role) {
      newErrors.role = "Please select a different role";
    }

    if (!reason.trim()) {
      newErrors.reason = "Please provide a reason for this role change";
    }

    if (reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await changeRoleMutation.mutateAsync({
        userId: user.id,
        role: selectedRole,
        reason: reason.trim(),
      });
    } catch (error) {
      console.error("Role change failed:", error);
      setIsProcessing(false);
    }
  };

  const getCurrentRoleConfig = () => ROLE_DEFINITIONS[user?.role] || {};
  const getSelectedRoleConfig = () => ROLE_DEFINITIONS[selectedRole] || {};

  const hasRoleChange = selectedRole && selectedRole !== user?.role;

  // Determine if this is elevation, demotion, or lateral change
  const getChangeType = () => {
    if (!hasRoleChange) return null;

    const currentLevel = getCurrentRoleConfig().level || 0;
    const newLevel = getSelectedRoleConfig().level || 0;

    if (newLevel > currentLevel) return "elevation";
    if (newLevel < currentLevel) return "demotion";
    return "lateral";
  };

  const changeType = getChangeType();
  const roleOptions = getAvailableRoles();
  const currentRoleConfig = getCurrentRoleConfig();
  const selectedRoleConfig = getSelectedRoleConfig();

  if (!user) return null;

  const footer = (
    <ModalFooter>
      <Text size="sm" color="muted">
        {isProcessing || changeRoleMutation.isPending
          ? "Processing role change..."
          : "Review all information carefully"}
      </Text>

      <ActionButtons>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isProcessing || changeRoleMutation.isPending}
        >
          <HiOutlineXMark />
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isProcessing || changeRoleMutation.isPending}
          disabled={
            isProcessing || changeRoleMutation.isPending || !hasRoleChange
          }
        >
          <HiOutlineCheck />
          {changeType === "elevation"
            ? "Elevate Role"
            : changeType === "demotion"
            ? "Demote Role"
            : "Update Role"}
        </Button>
      </ActionButtons>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${
        changeType === "elevation"
          ? "Elevate"
          : changeType === "demotion"
          ? "Demote"
          : "Change"
      } User Role`}
      description="Modify user role and access permissions with careful consideration"
      size="lg"
      footer={footer}
      closeOnOverlayClick={!isProcessing && !changeRoleMutation.isPending}
      closeOnEscape={!isProcessing && !changeRoleMutation.isPending}
    >
      <div style={{ position: "relative" }}>
        {/* Processing Overlay */}
        {(isProcessing || changeRoleMutation.isPending) && (
          <ProcessingOverlay>
            <LoadingSpinner size="large" />
            <Text size="lg" weight="semibold">
              Processing Role Change
            </Text>
            <Text size="sm" color="muted">
              Updating user permissions and notifying relevant parties...
            </Text>
          </ProcessingOverlay>
        )}

        {/* User Information */}
        <UserInfoSection>
          <UserHeader>
            <Avatar
              src={user.profilePicture}
              name={getUserDisplayName(user)}
              size="md"
            />
            <UserDetails>
              <Text size="lg" weight="semibold">
                {getUserDisplayName(user)}
              </Text>
              <Text size="sm" color="muted">
                {user.email}
              </Text>
              <StatusBadge
                content={currentRoleConfig.label || user.role}
                variant={currentRoleConfig.color || "secondary"}
                size="sm"
              />
            </UserDetails>
          </UserHeader>
        </UserInfoSection>

        {/* Role Selection */}
        <RoleChangeSection>
          <FormField
            label="Select New Role"
            required
            error={errors.role}
            helpText="Choose the new role level for this user"
          >
            <StyledSelect
              value={selectedRole}
              onChange={(value) => {
                setSelectedRole(value);
                setErrors((prev) => ({ ...prev, role: "" }));
              }}
              options={[
                { value: "", label: "Select new role...", disabled: true },
                ...roleOptions,
              ]}
              disabled={isProcessing || changeRoleMutation.isPending}
              placeholder="Select new role..."
            />
          </FormField>

          {hasRoleChange && (
            <RoleComparisonContainer>
              <RoleComparison>
                <RoleBox>
                  <Text size="xs" weight="medium" color="muted">
                    Current Role
                  </Text>
                  <StatusBadge
                    content={currentRoleConfig.label}
                    variant={currentRoleConfig.color}
                    size="sm"
                  />
                  <Text
                    size="xs"
                    color="muted"
                    style={{ marginTop: "var(--spacing-2)" }}
                  >
                    Level {currentRoleConfig.level}
                  </Text>
                </RoleBox>

                <ChangeTypeIndicator $type={changeType}>
                  {changeType === "elevation" && (
                    <HiOutlineArrowUpCircle size={24} />
                  )}
                  {changeType === "demotion" && (
                    <HiOutlineArrowDownCircle size={24} />
                  )}
                  {changeType === "lateral" && (
                    <HiOutlineInformationCircle size={24} />
                  )}
                  <Text size="xs" weight="semibold">
                    {changeType === "elevation" && "Role Elevation"}
                    {changeType === "demotion" && "Role Demotion"}
                    {changeType === "lateral" && "Role Change"}
                  </Text>
                </ChangeTypeIndicator>

                <RoleBox>
                  <Text size="xs" weight="medium" color="muted">
                    New Role
                  </Text>
                  <StatusBadge
                    content={selectedRoleConfig.label}
                    variant={selectedRoleConfig.color}
                    size="sm"
                  />
                  <Text
                    size="xs"
                    color="muted"
                    style={{ marginTop: "var(--spacing-2)" }}
                  >
                    Level {selectedRoleConfig.level}
                  </Text>
                </RoleBox>
              </RoleComparison>

              {/* New Role Description */}
              <Text
                size="sm"
                color="muted"
                style={{
                  textAlign: "center",
                  marginBottom: "var(--spacing-3)",
                }}
              >
                {selectedRoleConfig.description}
              </Text>

              {/* Permissions Preview */}
              <PermissionsPreview>
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ marginBottom: "var(--spacing-2)" }}
                >
                  New Role Permissions:
                </Text>
                <PermissionsList>
                  {selectedRoleConfig.permissions?.map((permission, index) => (
                    <PermissionItem key={index}>
                      <Text size="sm">{permission}</Text>
                    </PermissionItem>
                  ))}
                </PermissionsList>
              </PermissionsPreview>
            </RoleComparisonContainer>
          )}

          <FormField
            label="Justification for Role Change"
            required
            error={errors.reason}
            helpText="Provide a detailed explanation for this role modification"
          >
            <Textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => ({ ...prev, reason: "" }));
              }}
              placeholder={`Explain why this user's role should be ${
                changeType === "elevation"
                  ? "elevated"
                  : changeType === "demotion"
                  ? "demoted"
                  : "changed"
              }...`}
              rows={3}
              disabled={isProcessing || changeRoleMutation.isPending}
              maxLength={500}
            />
            <Text
              size="xs"
              color="muted"
              style={{ marginTop: "var(--spacing-1)" }}
            >
              {reason.length}/500 characters
            </Text>
          </FormField>
        </RoleChangeSection>

        {/* Enhanced Warning Section */}
        {hasRoleChange && (
          <WarningSection $type={changeType}>
            <WarningHeader>
              <HiOutlineExclamationTriangle
                size={20}
                style={{
                  color:
                    changeType === "elevation"
                      ? "var(--color-error-600)"
                      : "var(--color-warning-600)",
                }}
              />
              <Text
                size="md"
                weight="semibold"
                color={changeType === "elevation" ? "error" : "warning"}
              >
                {changeType === "elevation" && "Role Elevation Warning"}
                {changeType === "demotion" && "Role Demotion Warning"}
                {changeType === "lateral" && "Role Change Notice"}
              </Text>
            </WarningHeader>

            <WarningList $type={changeType}>
              {changeType === "elevation" && (
                <>
                  <WarningItem>
                    User will gain elevated privileges and expanded system
                    access
                  </WarningItem>
                  <WarningItem>
                    Higher-level operations and sensitive data will become
                    accessible
                  </WarningItem>
                  <WarningItem>
                    This change may significantly impact system security posture
                  </WarningItem>
                  <WarningItem>
                    Additional responsibilities and accountability will be
                    assigned
                  </WarningItem>
                </>
              )}
              {changeType === "demotion" && (
                <>
                  <WarningItem>
                    User will lose current privileges and access rights
                  </WarningItem>
                  <WarningItem>
                    Previously accessible features and data may become
                    restricted
                  </WarningItem>
                  <WarningItem>
                    Active sessions with elevated permissions will be terminated
                  </WarningItem>
                  <WarningItem>
                    User may need retraining on new role limitations
                  </WarningItem>
                </>
              )}
              {changeType === "lateral" && (
                <>
                  <WarningItem>
                    User permissions will be modified to match new role
                  </WarningItem>
                  <WarningItem>
                    Some features may become available while others are
                    restricted
                  </WarningItem>
                </>
              )}
              <WarningItem>
                User will be automatically notified of this role change
              </WarningItem>
              <WarningItem>
                All role modifications are logged for compliance and audit
                purposes
              </WarningItem>
              <WarningItem>
                This action requires administrative approval and cannot be
                easily reversed
              </WarningItem>
            </WarningList>
          </WarningSection>
        )}
      </div>
    </Modal>
  );
}

ChangeRoleModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    email: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string.isRequired,
    profilePicture: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

export default ChangeRoleModal;
