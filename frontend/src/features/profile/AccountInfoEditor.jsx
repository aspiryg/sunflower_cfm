import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import {
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import IconButton from "../../ui/IconButton";
import StatusBadge from "../../ui/StatusBadge";
import { useUpdateUsername, useUpdateEmail } from "./useProfile";

const EditCard = styled(Card)`
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    border-color: var(--color-grey-300);
    box-shadow: var(--shadow-sm);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const EditButton = styled(IconButton)`
  opacity: 0.7;
  transition: opacity var(--duration-normal) var(--ease-in-out);

  ${EditCard}:hover & {
    opacity: 1;
  }
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const DisplayField = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const FieldIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-md);
  flex-shrink: 0;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const FieldContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  flex: 1;
`;

const FieldMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
`;

const FieldLabel = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const FieldValue = styled(Text)`
  color: var(--color-grey-800);
  word-break: break-word;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const WarningBox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: var(--color-warning-25);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-3);

  svg {
    color: var(--color-warning-600);
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }
`;

function AccountInfoEditor({ user, onSuccess }) {
  const [editingField, setEditingField] = useState(null); // 'username' | 'email' | null

  const usernameMutation = useUpdateUsername({
    onSuccess: (data) => {
      setEditingField(null);
      if (onSuccess) onSuccess(data);
    },
  });

  const emailMutation = useUpdateEmail({
    onSuccess: (data) => {
      setEditingField(null);
      if (onSuccess) onSuccess(data);
    },
  });

  const {
    register: registerUsername,
    handleSubmit: handleSubmitUsername,
    reset: resetUsername,
    formState: { errors: usernameErrors, isDirty: isUsernameDirty },
  } = useForm({
    defaultValues: {
      username: user?.username || "",
    },
  });

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    formState: { errors: emailErrors, isDirty: isEmailDirty },
  } = useForm({
    defaultValues: {
      email: user?.email || "",
      password: "",
    },
  });

  const onSubmitUsername = async (data) => {
    try {
      await usernameMutation.mutateAsync(data);
    } catch (error) {
      console.error("Username update failed:", error);
    }
  };

  const onSubmitEmail = async (data) => {
    try {
      await emailMutation.mutateAsync(data);
    } catch (error) {
      console.error("Email update failed:", error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    resetUsername();
    resetEmail();
  };

  const handleEditUsername = () => {
    setEditingField("username");
    resetUsername({ username: user?.username || "" });
  };

  const handleEditEmail = () => {
    setEditingField("email");
    resetEmail({ email: user?.email || "", password: "" });
  };

  if (editingField === "username") {
    return (
      <EditCard>
        <CardHeader>
          <HeaderContent>
            <Heading as="h3" size="h4">
              Edit Username
            </Heading>
            <Text size="sm" color="muted">
              Change your unique username
            </Text>
          </HeaderContent>
        </CardHeader>

        <form onSubmit={handleSubmitUsername(onSubmitUsername)}>
          <Input
            label="Username"
            {...registerUsername("username", {
              required: "Username is required",
              minLength: {
                value: 3,
                message: "Username must be at least 3 characters",
              },
              maxLength: {
                value: 30,
                message: "Username must be less than 30 characters",
              },
              pattern: {
                value: /^[a-zA-Z0-9_-]+$/,
                message:
                  "Username can only contain letters, numbers, hyphens, and underscores",
              },
            })}
            error={usernameErrors.username?.message}
            disabled={usernameMutation.isLoading}
            placeholder="Enter your new username"
          />

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={usernameMutation.isLoading}
            >
              <HiOutlineXMark />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={usernameMutation.isLoading}
              disabled={!isUsernameDirty}
            >
              <HiOutlineCheck />
              Update Username
            </Button>
          </FormActions>
        </form>
      </EditCard>
    );
  }

  if (editingField === "email") {
    return (
      <EditCard>
        <CardHeader>
          <HeaderContent>
            <Heading as="h3" size="h4">
              Change Email Address
            </Heading>
            <Text size="sm" color="muted">
              Update your email address
            </Text>
          </HeaderContent>
        </CardHeader>

        <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
          <FieldContainer>
            <Input
              label="New Email Address"
              type="email"
              {...registerEmail("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
              error={emailErrors.email?.message}
              disabled={emailMutation.isLoading}
              placeholder="Enter your new email address"
            />

            <Input
              label="Current Password"
              type="password"
              {...registerEmail("password", {
                required: "Current password is required for security",
              })}
              error={emailErrors.password?.message}
              disabled={emailMutation.isLoading}
              placeholder="Enter your current password"
            />
          </FieldContainer>

          <WarningBox>
            <HiOutlineExclamationTriangle />
            <Text size="sm">
              After changing your email, you'll need to verify the new address
              before you can log in with it.
            </Text>
          </WarningBox>

          <FormActions>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={emailMutation.isLoading}
            >
              <HiOutlineXMark />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={emailMutation.isLoading}
              disabled={!isEmailDirty}
            >
              <HiOutlineCheck />
              Update Email
            </Button>
          </FormActions>
        </form>
      </EditCard>
    );
  }

  return (
    <EditCard>
      <CardHeader>
        <HeaderContent>
          <Heading as="h3" size="h4">
            Account Information
          </Heading>
          <Text size="sm" color="muted">
            Your login credentials and account details
          </Text>
        </HeaderContent>
        <EditButton
          variant="ghost"
          size="medium"
          onClick={handleEditUsername}
          aria-label="Edit account information"
        >
          <HiOutlinePencil />
        </EditButton>
      </CardHeader>

      <FieldContainer>
        <DisplayField>
          <FieldIcon>
            <HiOutlineUser />
          </FieldIcon>
          <FieldContent>
            <FieldLabel size="sm">Username</FieldLabel>
            <FieldValue size="sm" weight="medium">
              {user?.username || "Not set"}
            </FieldValue>
          </FieldContent>
          <FieldMeta>
            <Button variant="ghost" size="small" onClick={handleEditUsername}>
              Edit
            </Button>
          </FieldMeta>
        </DisplayField>

        <DisplayField>
          <FieldIcon>
            <HiOutlineEnvelope />
          </FieldIcon>
          <FieldContent>
            <FieldLabel size="sm">Email Address</FieldLabel>
            <FieldValue size="sm" weight="medium">
              {user?.email || "Not provided"}
            </FieldValue>
          </FieldContent>
          <FieldMeta>
            <StatusBadge
              content={user?.isEmailVerified ? "Verified" : "Unverified"}
              variant={user?.isEmailVerified ? "success" : "warning"}
              size="sm"
            />
            <Button variant="ghost" size="small" onClick={handleEditEmail}>
              Edit
            </Button>
          </FieldMeta>
        </DisplayField>
      </FieldContainer>
    </EditCard>
  );
}

AccountInfoEditor.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

export default AccountInfoEditor;
