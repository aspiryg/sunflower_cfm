import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineUser,
} from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import Input from "../../../ui/Input";
import PasswordInput from "../../../ui/PasswordInput";
import Text from "../../../ui/Text";
import Column from "../../../ui/Column";
import {
  useUpdateProfile,
  useChangePassword,
  useUpdateUsername,
} from "../useProfile";

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-warning-25),
    var(--color-warning-50)
  );
  border: 1px solid var(--color-warning-200);
  border-left: 4px solid var(--color-warning-500);
  border-radius: var(--border-radius-md);
  color: var(--color-warning-700);
  margin-bottom: var(--spacing-4);
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
`;

const SectionTitle = styled.h3`
  color: var(--color-grey-700);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-100);
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);

  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: var(--spacing-2);

    & > * {
      width: 100%;
      justify-content: center;
    }
  }
`;

const TabSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-4);
`;

const TabButton = styled.button`
  background: none;
  border: none;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: ${(props) =>
    props.$active ? "var(--color-brand-600)" : "var(--color-grey-600)"};
  border-bottom: 2px solid
    ${(props) => (props.$active ? "var(--color-brand-600)" : "transparent")};
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-grey-25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PasswordRequirements = styled.div`
  background-color: var(--color-info-50);
  border: 1px solid var(--color-info-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-top: var(--spacing-3);
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: ${(props) =>
    props.$met ? "var(--color-success-600)" : "var(--color-grey-600)"};
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-1);

  &::before {
    content: ${(props) => (props.$met ? '"✓"' : '"○"')};
    font-weight: var(--font-weight-bold);
    width: 1.6rem;
    display: inline-block;
    color: ${(props) =>
      props.$met ? "var(--color-success-600)" : "var(--color-grey-400)"};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Security Settings Edit Modal
 * Allows editing of username and password using existing auth functionality
 */
function EditSecurityModal({ isOpen, onClose, user, onSuccess }) {
  const [activeTab, setActiveTab] = useState("username");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use existing auth hooks
  const { mutate: changePassword, isPending: isChangingPassword } =
    useChangePassword();
  const updateProfileMutation = useUpdateUsername();

  const usernameForm = useForm({
    defaultValues: {
      username: "",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Watch new password for requirements validation
  const newPassword = passwordForm.watch("newPassword");

  // Reset forms when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      usernameForm.reset({
        username: user?.username || "",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setActiveTab("username");
    }
  }, [isOpen, user, usernameForm, passwordForm]);

  const handleClose = () => {
    if (!isSubmitting && !isChangingPassword) {
      usernameForm.reset();
      passwordForm.reset();
      setActiveTab("username");
      onClose();
    }
  };

  const onUsernameSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Use the existing profile update mutation
      await updateProfileMutation.mutateAsync({
        username: data.username.trim(),
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Failed to update username:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Use the existing changePassword mutation from auth
      changePassword(
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        {
          onSuccess: () => {
            if (onSuccess) {
              onSuccess();
            }
            handleClose();
          },
          onError: (error) => {
            console.error("Failed to change password:", error);
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to change password:", error);
      setIsSubmitting(false);
    }
  };

  // Password strength validation
  const validatePassword = (password) => {
    if (!password) return [];

    return [
      { text: "At least 8 characters", met: password.length >= 8 },
      { text: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { text: "Contains number", met: /\d/.test(password) },
      { text: "Contains special character", met: /[@$!%*?&]/.test(password) },
    ];
  };

  const passwordRequirements = validatePassword(newPassword);
  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const isUsernameDirty = usernameForm.formState.isDirty;
  const isPasswordDirty = passwordForm.formState.isDirty;
  const isDirty = activeTab === "username" ? isUsernameDirty : isPasswordDirty;
  const isLoading = isSubmitting || isChangingPassword;

  const footer = (
    <ModalFooter>
      <Button
        type="button"
        variant="secondary"
        onClick={handleClose}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading || !isDirty}
        loading={isLoading}
        form={activeTab === "username" ? "username-form" : "password-form"}
      >
        <HiOutlineShieldCheck />
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Security Settings"
      description="Update your username and password"
      size="lg"
      footer={footer}
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      {/* Security Warning */}
      <InfoNote>
        <HiOutlineExclamationTriangle
          size={20}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <Column gap={1}>
          <Text size="sm" weight="semibold">
            Security Settings Warning
          </Text>
          <Text size="sm">
            Changing your username or password will affect how you log into your
            account. Make sure to remember your new credentials and store them
            securely. Changing your password will log you out of all other
            devices.
          </Text>
        </Column>
      </InfoNote>

      {/* Tab Navigation - Keep existing implementation */}
      <TabSection>
        <TabButtons>
          <TabButton
            type="button"
            $active={activeTab === "username"}
            onClick={() => setActiveTab("username")}
            disabled={isLoading}
          >
            <HiOutlineUser />
            Username
          </TabButton>
          <TabButton
            type="button"
            $active={activeTab === "password"}
            onClick={() => setActiveTab("password")}
            disabled={isLoading}
          >
            <HiOutlineLockClosed />
            Password
          </TabButton>
        </TabButtons>

        {/* Username Form */}
        {activeTab === "username" && (
          <form
            id="username-form"
            onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}
          >
            <FormSection>
              <SectionTitle>Username Settings</SectionTitle>

              <Controller
                name="username"
                control={usernameForm.control}
                rules={{
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters long",
                  },
                  maxLength: {
                    value: 50,
                    message: "Username cannot exceed 50 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_.-]+$/,
                    message:
                      "Username can only contain letters, numbers, dots, hyphens, and underscores",
                  },
                }}
                render={({ field }) => (
                  <FormField
                    label="Username"
                    required
                    error={usernameForm.formState.errors.username?.message}
                    helpText="Your unique username for logging in. Must be 3-50 characters long."
                  >
                    <Input
                      {...field}
                      placeholder="Enter your username"
                      $hasError={!!usernameForm.formState.errors.username}
                      disabled={isLoading}
                      maxLength={50}
                      leftIcon={<HiOutlineUser />}
                      autoComplete="username"
                    />
                  </FormField>
                )}
              />
            </FormSection>
          </form>
        )}

        {/* Password Form - Using PasswordInput component */}
        {activeTab === "password" && (
          <form
            id="password-form"
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          >
            <FormSection>
              <SectionTitle>Change Password</SectionTitle>

              <Controller
                name="currentPassword"
                control={passwordForm.control}
                rules={{
                  required: "Current password is required",
                }}
                render={({ field }) => (
                  <FormField
                    label="Current Password"
                    required
                    error={
                      passwordForm.formState.errors.currentPassword?.message
                    }
                    helpText="Enter your current password to confirm your identity"
                  >
                    <PasswordInput
                      {...field}
                      placeholder="Enter your current password"
                      variant={
                        passwordForm.formState.errors.currentPassword
                          ? "error"
                          : "default"
                      }
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </FormField>
                )}
              />

              <Controller
                name="newPassword"
                control={passwordForm.control}
                rules={{
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  validate: {
                    hasLowercase: (value) =>
                      /[a-z]/.test(value) ||
                      "Password must contain at least one lowercase letter",
                    hasUppercase: (value) =>
                      /[A-Z]/.test(value) ||
                      "Password must contain at least one uppercase letter",
                    hasNumber: (value) =>
                      /\d/.test(value) ||
                      "Password must contain at least one number",
                    hasSpecialChar: (value) =>
                      /[@$!%*?&]/.test(value) ||
                      "Password must contain at least one special character",
                  },
                }}
                render={({ field }) => (
                  <FormField
                    label="New Password"
                    required
                    error={passwordForm.formState.errors.newPassword?.message}
                    helpText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                  >
                    <PasswordInput
                      {...field}
                      placeholder="Enter your new password"
                      variant={
                        passwordForm.formState.errors.newPassword
                          ? "error"
                          : "default"
                      }
                      disabled={isLoading}
                      autoComplete="new-password"
                    />

                    {newPassword && (
                      <PasswordRequirements>
                        <Text
                          size="sm"
                          weight="medium"
                          color="info"
                          style={{ marginBottom: "var(--spacing-2)" }}
                        >
                          Password Requirements:
                        </Text>
                        <Column gap={1}>
                          {passwordRequirements.map((req, index) => (
                            <RequirementItem key={index} $met={req.met}>
                              {req.text}
                            </RequirementItem>
                          ))}
                        </Column>
                      </PasswordRequirements>
                    )}
                  </FormField>
                )}
              />

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                rules={{
                  required: "Please confirm your new password",
                  validate: (value) => {
                    const newPassword = passwordForm.watch("newPassword");
                    return value === newPassword || "Passwords do not match";
                  },
                }}
                render={({ field }) => (
                  <FormField
                    label="Confirm New Password"
                    required
                    error={
                      passwordForm.formState.errors.confirmPassword?.message
                    }
                    helpText="Re-enter your new password to confirm"
                  >
                    <PasswordInput
                      {...field}
                      placeholder="Confirm your new password"
                      variant={
                        passwordForm.formState.errors.confirmPassword
                          ? "error"
                          : "default"
                      }
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </FormField>
                )}
              />
            </FormSection>
          </form>
        )}

        {isLoading && (
          <Text size="sm" color="muted" style={{ textAlign: "center" }}>
            {activeTab === "username"
              ? "Updating username..."
              : "Changing password..."}
          </Text>
        )}
      </TabSection>
    </Modal>
  );
}

EditSecurityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default EditSecurityModal;
