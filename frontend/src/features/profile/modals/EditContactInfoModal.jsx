import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import Input from "../../../ui/Input";
import Text from "../../../ui/Text";
import Column from "../../../ui/Column";
import { useUpdateContactInfo } from "../useProfile";

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
 * Contact Information Edit Modal
 * Allows editing of contact details including email, phone, and address
 */
function EditContactInfoModal({ isOpen, onClose, user, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateContactMutation = useUpdateContactInfo();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      reset({
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
        state: user?.state || "",
        country: user?.country || "",
        postalCode: user?.postalCode || "",
      });
    }
  }, [isOpen, user, reset]);

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      // Clean up the data - remove empty strings
      const cleanData = {
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        address: data.address.trim() || null,
        city: data.city.trim() || null,
        state: data.state.trim() || null,
        country: data.country.trim() || null,
        postalCode: data.postalCode.trim() || null,
      };

      await updateContactMutation.mutateAsync(cleanData);

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Failed to update contact information:", error);
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
        form="contact-info-form"
      >
        <HiOutlineEnvelope />
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Contact Information"
      description="Update your contact details and address"
      size="lg"
      footer={footer}
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      <form id="contact-info-form" onSubmit={handleSubmit(onSubmit)}>
        {/* Important Notice */}
        <InfoNote>
          <HiOutlineExclamationTriangle
            size={20}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <Column gap={1}>
            <Text size="sm" weight="semibold">
              Contact Information Guidelines
            </Text>
            <Text size="sm">
              Ensure your contact information is up-to-date for important
              account communications and notifications. Your email address will
              require verification if changed.
            </Text>
          </Column>
        </InfoNote>

        {/* Email Information */}
        <FormSection>
          <SectionTitle>Email & Communication</SectionTitle>

          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email address is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email address",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Email Address"
                required
                error={errors.email?.message}
                helpText="Your primary email for account communications and login"
              >
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter your email address"
                  $hasError={!!errors.email}
                  disabled={isSubmitting}
                  leftIcon={<HiOutlineEnvelope />}
                />
              </FormField>
            )}
          />

          <Controller
            name="phone"
            control={control}
            rules={{
              pattern: {
                value: /^[+]?[\d\s\-()]{10,}$/,
                message: "Please enter a valid phone number",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Phone Number"
                error={errors.phone?.message}
                helpText="Contact phone number for urgent communications"
              >
                <Input
                  {...field}
                  type="tel"
                  placeholder="Enter your phone number"
                  $hasError={!!errors.phone}
                  disabled={isSubmitting}
                  leftIcon={<HiOutlinePhone />}
                />
              </FormField>
            )}
          />
        </FormSection>

        {/* Address Information */}
        <FormSection>
          <SectionTitle>Address Information</SectionTitle>

          <Controller
            name="address"
            control={control}
            rules={{
              maxLength: {
                value: 255,
                message: "Address cannot exceed 255 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Street Address"
                error={errors.address?.message}
                helpText="Your street address or mailing address"
              >
                <Input
                  {...field}
                  placeholder="Enter your street address"
                  $hasError={!!errors.address}
                  disabled={isSubmitting}
                  maxLength={255}
                  leftIcon={<HiOutlineMapPin />}
                />
              </FormField>
            )}
          />

          <FieldGrid>
            <Controller
              name="city"
              control={control}
              rules={{
                maxLength: {
                  value: 100,
                  message: "City name cannot exceed 100 characters",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="City"
                  error={errors.city?.message}
                  helpText="Your city or municipality"
                >
                  <Input
                    {...field}
                    placeholder="Enter your city"
                    $hasError={!!errors.city}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </FormField>
              )}
            />

            <Controller
              name="state"
              control={control}
              rules={{
                maxLength: {
                  value: 100,
                  message: "State/Province cannot exceed 100 characters",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="State/Province"
                  error={errors.state?.message}
                  helpText="Your state, province, or region"
                >
                  <Input
                    {...field}
                    placeholder="Enter your state/province"
                    $hasError={!!errors.state}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </FormField>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="country"
              control={control}
              rules={{
                maxLength: {
                  value: 100,
                  message: "Country name cannot exceed 100 characters",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="Country"
                  error={errors.country?.message}
                  helpText="Your country of residence"
                >
                  <Input
                    {...field}
                    placeholder="Enter your country"
                    $hasError={!!errors.country}
                    disabled={isSubmitting}
                    maxLength={100}
                  />
                </FormField>
              )}
            />

            <Controller
              name="postalCode"
              control={control}
              rules={{
                maxLength: {
                  value: 20,
                  message: "Postal code cannot exceed 20 characters",
                },
                pattern: {
                  value: /^[A-Za-z0-9\s-]*$/,
                  message: "Please enter a valid postal code",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="Postal Code"
                  error={errors.postalCode?.message}
                  helpText="Your ZIP or postal code"
                >
                  <Input
                    {...field}
                    placeholder="Enter postal code"
                    $hasError={!!errors.postalCode}
                    disabled={isSubmitting}
                    maxLength={20}
                  />
                </FormField>
              )}
            />
          </FieldGrid>
        </FormSection>

        {isSubmitting && (
          <Text size="sm" color="muted" style={{ textAlign: "center" }}>
            Updating your contact information...
          </Text>
        )}
      </form>
    </Modal>
  );
}

EditContactInfoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default EditContactInfoModal;
