import { useState, useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import {
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineXMark,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import TextArea from "../../ui/Textarea";
import { useUpdateProfile } from "./useProfile";

const EditCard = styled(Card)`
  padding: var(--spacing-5);
  margin-bottom: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const EditHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const EditActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
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

function EditProfileForm({ user, onSuccess, onCancel }) {
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateProfile({
    onSuccess: (data) => {
      setIsEditing(false);
      if (onSuccess) onSuccess(data);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      organization: user?.organization || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      organization: user?.organization || "",
    });
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await updateMutation.mutateAsync(data);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
    if (onCancel) onCancel();
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (!isEditing) {
    return (
      <EditCard>
        <EditHeader>
          <div>
            <Heading as="h3" size="h4">
              Personal Information
            </Heading>
            <Text size="sm" color="muted">
              Your basic personal details
            </Text>
          </div>
          <EditActions>
            <Button variant="secondary" size="small" onClick={handleEdit}>
              <HiOutlinePencil />
              Edit
            </Button>
          </EditActions>
        </EditHeader>

        <FormGrid>
          <FormField>
            <Text size="sm" weight="medium" color="muted">
              First Name
            </Text>
            <Text size="sm">{user?.firstName || "Not provided"}</Text>
          </FormField>

          <FormField>
            <Text size="sm" weight="medium" color="muted">
              Last Name
            </Text>
            <Text size="sm">{user?.lastName || "Not provided"}</Text>
          </FormField>

          <FormField>
            <Text size="sm" weight="medium" color="muted">
              Date of Birth
            </Text>
            <Text size="sm">
              {user?.dateOfBirth
                ? new Date(user.dateOfBirth).toLocaleDateString()
                : "Not provided"}
            </Text>
          </FormField>

          <FormField>
            <Text size="sm" weight="medium" color="muted">
              Organization
            </Text>
            <Text size="sm">{user?.organization || "Not provided"}</Text>
          </FormField>
        </FormGrid>

        {user?.bio && (
          <FormField style={{ marginTop: "var(--spacing-4)" }}>
            <Text size="sm" weight="medium" color="muted">
              About
            </Text>
            <Text size="sm" style={{ lineHeight: 1.6 }}>
              {user.bio}
            </Text>
          </FormField>
        )}
      </EditCard>
    );
  }

  return (
    <EditCard>
      <EditHeader>
        <div>
          <Heading as="h3" size="h4">
            Edit Personal Information
          </Heading>
          <Text size="sm" color="muted">
            Update your basic personal details
          </Text>
        </div>
      </EditHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormGrid>
          <FormField>
            <Input
              label="First Name"
              {...register("firstName", {
                required: "First name is required",
                minLength: {
                  value: 2,
                  message: "First name must be at least 2 characters",
                },
              })}
              error={errors.firstName?.message}
              disabled={updateMutation.isLoading}
            />
          </FormField>

          <FormField>
            <Input
              label="Last Name"
              {...register("lastName", {
                required: "Last name is required",
                minLength: {
                  value: 2,
                  message: "Last name must be at least 2 characters",
                },
              })}
              error={errors.lastName?.message}
              disabled={updateMutation.isLoading}
            />
          </FormField>

          <FormField>
            <Input
              type="date"
              label="Date of Birth"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
              disabled={updateMutation.isLoading}
            />
          </FormField>

          <FormField>
            <Input
              label="Organization"
              {...register("organization")}
              error={errors.organization?.message}
              disabled={updateMutation.isLoading}
              placeholder="Your company or organization"
            />
          </FormField>
        </FormGrid>

        <FormField style={{ marginTop: "var(--spacing-4)" }}>
          <TextArea
            label="About"
            {...register("bio", {
              maxLength: {
                value: 500,
                message: "Bio must be less than 500 characters",
              },
            })}
            error={errors.bio?.message}
            disabled={updateMutation.isLoading}
            placeholder="Tell us about yourself..."
            rows={4}
          />
        </FormField>

        <FormActions>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={updateMutation.isLoading}
          >
            <HiOutlineXMark />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={updateMutation.isLoading}
            disabled={!isDirty}
          >
            <HiOutlineCheck />
            Save Changes
          </Button>
        </FormActions>
      </form>
    </EditCard>
  );
}

EditProfileForm.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default EditProfileForm;
