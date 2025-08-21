import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import {
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlinePhone,
  HiOutlineEnvelope,
  HiOutlineMapPin,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import IconButton from "../../ui/IconButton";
import { useUpdateContactInfo } from "./useProfile";

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

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
`;

const FieldLabel = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const FieldValue = styled(Text)`
  color: var(--color-grey-800);
  word-break: break-word;
`;

const EmptyValue = styled(Text)`
  color: var(--color-grey-400);
  font-style: italic;
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

const AddressDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

function ContactInfoEditor({ user, onSuccess }) {
  const [isEditing, setIsEditing] = useState(false);

  const updateMutation = useUpdateContactInfo({
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
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      country: user?.country || "",
      postalCode: user?.postalCode || "",
    },
  });

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
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  // Build address string for display
  const buildFullAddress = () => {
    const parts = [];
    if (user?.address) parts.push(user.address);
    if (user?.city) parts.push(user.city);
    if (user?.state) parts.push(user.state);
    if (user?.country) parts.push(user.country);
    if (user?.postalCode) parts.push(user.postalCode);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const fullAddress = buildFullAddress();

  if (isEditing) {
    return (
      <EditCard>
        <CardHeader>
          <HeaderContent>
            <Heading as="h3" size="h4">
              Edit Contact Information
            </Heading>
            <Text size="sm" color="muted">
              Update your contact details and address
            </Text>
          </HeaderContent>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGrid>
            <Input
              label="Phone Number"
              type="tel"
              {...register("phone", {
                pattern: {
                  value: /^[+]?[1-9][\d]{0,15}$/,
                  message: "Please enter a valid phone number",
                },
              })}
              error={errors.phone?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your phone number"
            />

            <Input
              label="Street Address"
              {...register("address")}
              error={errors.address?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your street address"
            />

            <Input
              label="City"
              {...register("city")}
              error={errors.city?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your city"
            />

            <Input
              label="State/Province"
              {...register("state")}
              error={errors.state?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your state or province"
            />

            <Input
              label="Country"
              {...register("country")}
              error={errors.country?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your country"
            />

            <Input
              label="Postal Code"
              {...register("postalCode")}
              error={errors.postalCode?.message}
              disabled={updateMutation.isLoading}
              placeholder="Enter your postal code"
            />
          </FieldGrid>

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

  return (
    <EditCard>
      <CardHeader>
        <HeaderContent>
          <Heading as="h3" size="h4">
            Contact Information
          </Heading>
          <Text size="sm" color="muted">
            Your contact details and location
          </Text>
        </HeaderContent>
        <EditButton
          variant="ghost"
          size="medium"
          onClick={handleEdit}
          aria-label="Edit contact information"
        >
          <HiOutlinePencil />
        </EditButton>
      </CardHeader>

      <FieldGrid>
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
        </DisplayField>

        <DisplayField>
          <FieldIcon>
            <HiOutlinePhone />
          </FieldIcon>
          <FieldContent>
            <FieldLabel size="sm">Phone Number</FieldLabel>
            {user?.phone ? (
              <FieldValue size="sm" weight="medium">
                {user.phone}
              </FieldValue>
            ) : (
              <EmptyValue size="sm">Not provided</EmptyValue>
            )}
          </FieldContent>
        </DisplayField>

        <DisplayField style={{ gridColumn: "1 / -1" }}>
          <FieldIcon>
            <HiOutlineMapPin />
          </FieldIcon>
          <FieldContent>
            <FieldLabel size="sm">Address</FieldLabel>
            {fullAddress ? (
              <AddressDisplay>
                <FieldValue size="sm" weight="medium">
                  {fullAddress}
                </FieldValue>
              </AddressDisplay>
            ) : (
              <EmptyValue size="sm">No address provided</EmptyValue>
            )}
          </FieldContent>
        </DisplayField>
      </FieldGrid>
    </EditCard>
  );
}

ContactInfoEditor.propTypes = {
  user: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

export default ContactInfoEditor;
