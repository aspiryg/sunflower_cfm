import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineUser, HiOutlineExclamationTriangle } from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
import DatePicker from "../../../ui/DatePicker";
import Text from "../../../ui/Text";
import Column from "../../../ui/Column";
import { useUpdateProfile } from "../useProfile";

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-info-25),
    var(--color-info-50)
  );
  border: 1px solid var(--color-info-200);
  border-left: 4px solid var(--color-info-500);
  border-radius: var(--border-radius-md);
  color: var(--color-info-700);
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

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const CharacterCount = styled(Text)`
  margin-top: var(--spacing-1);
  text-align: right;
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

/**
 * Personal Information Edit Modal
 * Allows editing of basic personal details including name, bio, organization, and date of birth
 */
function EditPersonalInfoModal({ isOpen, onClose, user, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      organization: "",
      dateOfBirth: "",
      bio: "",
    },
  });

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        organization: user?.organization || "",
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
        bio: user?.bio || "",
      });
    }
  }, [isOpen, user, reset]);

  // Watch bio length for character count
  const bioValue = watch("bio");
  const bioLength = bioValue?.length || 0;

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Clean up the data - remove empty strings and format date
      const cleanData = {
        firstName: data.firstName.trim() || null,
        lastName: data.lastName.trim() || null,
        organization: data.organization.trim() || null,
        dateOfBirth: data.dateOfBirth || null,
        bio: data.bio.trim() || null,
      };

      await updateProfileMutation.mutateAsync(cleanData);

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Failed to update personal information:", error);
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <ModalFooter>
      <Button
        type="button"
        variant="secondary"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={isSubmitting || !isDirty}
        loading={isSubmitting}
        form="personal-info-form"
      >
        <HiOutlineUser />
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Personal Information"
      description="Update your basic personal details and bio"
      size="lg"
      footer={footer}
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form id="personal-info-form" onSubmit={handleSubmit(onSubmit)}>
        {/* Important Notice */}
        <InfoNote>
          <HiOutlineExclamationTriangle
            size={20}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <Column gap={1}>
            <Text size="sm" weight="semibold">
              Profile Information Guidelines
            </Text>
            <Text size="sm">
              Your profile information helps colleagues identify and connect
              with you. All fields are optional, but a complete profile improves
              team collaboration.
            </Text>
          </Column>
        </InfoNote>

        {/* Basic Information */}
        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>

          <FieldGrid>
            <Controller
              name="firstName"
              control={control}
              rules={{
                maxLength: {
                  value: 50,
                  message: "First name cannot exceed 50 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\s\-']*$/,
                  message:
                    "First name can only contain letters, spaces, hyphens, and apostrophes",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="First Name"
                  error={errors.firstName?.message}
                  helpText="Your given name or first name"
                >
                  <Input
                    {...field}
                    placeholder="Enter your first name"
                    $hasError={!!errors.firstName}
                    disabled={isSubmitting}
                    maxLength={50}
                  />
                </FormField>
              )}
            />

            <Controller
              name="lastName"
              control={control}
              rules={{
                maxLength: {
                  value: 50,
                  message: "Last name cannot exceed 50 characters",
                },
                pattern: {
                  value: /^[a-zA-Z\s\-']*$/,
                  message:
                    "Last name can only contain letters, spaces, hyphens, and apostrophes",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="Last Name"
                  error={errors.lastName?.message}
                  helpText="Your family name or surname"
                >
                  <Input
                    {...field}
                    placeholder="Enter your last name"
                    $hasError={!!errors.lastName}
                    disabled={isSubmitting}
                    maxLength={50}
                  />
                </FormField>
              )}
            />
          </FieldGrid>

          <Controller
            name="dateOfBirth"
            control={control}
            rules={{
              validate: (value) => {
                if (!value) return true; // Optional field

                const date = new Date(value);
                const today = new Date();
                const hundredYearsAgo = new Date();
                hundredYearsAgo.setFullYear(today.getFullYear() - 100);

                if (date > today) {
                  return "Date of birth cannot be in the future";
                }

                if (date < hundredYearsAgo) {
                  return "Please enter a valid date of birth";
                }

                return true;
              },
            }}
            render={({ field }) => (
              <FormField
                label="Date of Birth"
                error={errors.dateOfBirth?.message}
                helpText="Optional - used for age-related features and birthday notifications"
              >
                <DatePicker
                  {...field}
                  hasError={!!errors.dateOfBirth}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split("T")[0]} // Today's date
                  placeholder="Select your date of birth"
                />
              </FormField>
            )}
          />
        </FormSection>

        {/* Professional Information */}
        <FormSection>
          <SectionTitle>Professional Information</SectionTitle>

          <Controller
            name="organization"
            control={control}
            rules={{
              maxLength: {
                value: 100,
                message: "Organization name cannot exceed 100 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Organization"
                error={errors.organization?.message}
                helpText="Your employer, company, or organization name"
              >
                <Input
                  {...field}
                  placeholder="Enter your organization name"
                  $hasError={!!errors.organization}
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </FormField>
            )}
          />
        </FormSection>

        {/* Personal Bio */}
        <FormSection>
          <SectionTitle>About You</SectionTitle>

          <Controller
            name="bio"
            control={control}
            rules={{
              maxLength: {
                value: 500,
                message: "Bio cannot exceed 500 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Bio"
                error={errors.bio?.message}
                helpText="Tell others about yourself, your role, or your interests (optional)"
              >
                <Textarea
                  {...field}
                  placeholder="Write a brief bio about yourself, your role, or what you do..."
                  $hasError={!!errors.bio}
                  disabled={isSubmitting}
                  rows={4}
                  maxLength={500}
                />
                <CharacterCount size="xs" color="muted">
                  {bioLength}/500 characters
                </CharacterCount>
              </FormField>
            )}
          />
        </FormSection>

        {isSubmitting && (
          <Text size="sm" color="muted" style={{ textAlign: "center" }}>
            Saving your information...
          </Text>
        )}
      </form>
    </Modal>
  );
}

EditPersonalInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default EditPersonalInfoModal;
