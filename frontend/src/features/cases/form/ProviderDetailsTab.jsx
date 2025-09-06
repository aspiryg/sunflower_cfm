// Create this file: /frontend/src/features/cases/form/ProviderDetailsTab.jsx
import {
  // useState,
  useEffect,
} from "react";
import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineEnvelope,
  HiOutlinePhone,
} from "react-icons/hi2";

import FormField from "../../../ui/FormField";
import Input from "../../../ui/Input";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Row from "../../../ui/Row";
import Column from "../../../ui/Column";
import InfoCard from "../../../ui/InfoCard";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";

const TabContainer = styled.div`
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
  }
`;

const TabHeader = styled.div`
  margin-bottom: var(--spacing-6);
  text-align: center;

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-4);
    text-align: left;
  }
`;

const SectionGrid = styled.div`
  display: grid;
  gap: var(--spacing-6);

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
    align-items: start;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
`;

const SideSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SectionCard = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  background: var(--color-brand-100);
  color: var(--color-brand-600);
  border-radius: var(--border-radius-md);

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  gap: var(--spacing-4);

  &.two-columns {
    grid-template-columns: 1fr 1fr;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &.three-columns {
    grid-template-columns: repeat(3, 1fr);

    @media (max-width: 768px) {
      grid-template-columns: 1fr 1fr;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
`;

const ConditionalSection = styled.div`
  background: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-3);
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) =>
    !props.$visible &&
    `
    opacity: 0.5;
    pointer-events: none;
    transform: translateY(-0.5rem);
  `}
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

/**
 * ProviderDetailsTab Component
 *
 * Handles provider information, demographics, and consent management
 * with user-friendly form organization and conditional fields
 */
function ProviderDetailsTab({
  control,
  watch,
  setValue,
  errors,
  // trigger,
  // isEditing,
  isLoading,
  formOptions = {},
}) {
  // Get form options
  const { providerTypes = [] } = formOptions;
  // console.log("Errors:", errors);

  // Watch form values for conditional rendering
  const watchedValues = watch([
    "providerTypeId",
    "followUpConsent",
    "dataSharingConsent",
  ]);

  const [providerTypeId, followUpConsent /* dataSharingConsent */] =
    watchedValues;

  // Get selected provider type details
  const selectedProviderType = providerTypes.find(
    (type) => type.value === providerTypeId
  );

  // Determine if this is an individual or group provider
  const isIndividualProvider =
    selectedProviderType?.label?.includes("Individual");
  const isGroupProvider = selectedProviderType?.label?.includes("Group");

  // Reset conditional fields when provider type changes
  useEffect(() => {
    if (providerTypeId) {
      if (!isIndividualProvider) {
        setValue("individualProviderGender", "");
        setValue("individualProviderAgeGroup", "");
        setValue("individualProviderDisabilityStatus", "");
      }
      if (!isGroupProvider) {
        setValue("groupProviderSize", "");
        setValue("groupProviderGenderComposition", "");
      }
    }
  }, [providerTypeId, isIndividualProvider, isGroupProvider, setValue]);

  // Reset follow-up method when consent is withdrawn
  useEffect(() => {
    if (!followUpConsent) {
      setValue("followUpContactMethod", "");
    }
  }, [followUpConsent, setValue]);

  // Form options
  const providerTypeOptions = providerTypes.length
    ? [
        { value: "", label: "Select provider type..." },
        ...providerTypes.sort((a, b) => a.value - b.value),
      ]
    : [{ value: "loading", label: "Loading...", disabled: true }];

  const genderOptions = [
    { value: "", label: "Select gender..." },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const ageGroupOptions = [
    { value: "", label: "Select age group..." },
    { value: "under_18", label: "Under 18" },
    { value: "18-25", label: "18-25" },
    { value: "26-35", label: "26-35" },
    { value: "36-50", label: "36-50" },
    { value: "51-65", label: "51-65" },
    { value: "over_65", label: "Over 65" },
  ];

  const disabilityOptions = [
    { value: "", label: "Select disability status..." },
    { value: "none", label: "No disability" },
    { value: "physical", label: "Physical disability" },
    { value: "visual", label: "Visual impairment" },
    { value: "hearing", label: "Hearing impairment" },
    { value: "cognitive", label: "Cognitive disability" },
    { value: "multiple", label: "Multiple disabilities" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const genderCompositionOptions = [
    { value: "", label: "Select composition..." },
    { value: "mixed", label: "Mixed gender" },
    { value: "majority_male", label: "Majority male" },
    { value: "majority_female", label: "Majority female" },
    { value: "all_male", label: "All male" },
    { value: "all_female", label: "All female" },
    { value: "unknown", label: "Unknown" },
  ];

  const contactMethodOptions = [
    { value: "", label: "Select contact method...", disabled: true },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone call" },
    { value: "sms", label: "SMS/Text message" },
    { value: "in_person", label: "In-person meeting" },
    { value: "none", label: "No follow-up needed" },
  ];

  return (
    <TabContainer>
      <TabHeader>
        <Text size="lg" weight="semibold" color="grey-800">
          Provider Details
        </Text>
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
          Information about the person or group providing the feedback
        </Text>
      </TabHeader>

      <SectionGrid>
        {/* Main Content Section */}
        <MainSection>
          {/* Provider Type & Basic Info Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineUser />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Provider Information
                </Text>
                <Text size="xs" color="muted">
                  Basic details about the feedback provider
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Provider Type */}
              <FormField
                label="Provider Type"
                error={errors.providerTypeId?.message}
                required
                helpText={
                  !errors.providerTypeId?.message
                    ? "Who is providing this feedback?"
                    : null
                }
              >
                <Controller
                  name="providerTypeId"
                  control={control}
                  rules={{
                    required: "Please select a provider type",
                  }}
                  render={({ field }) => (
                    <StyledSelect
                      {...field}
                      options={providerTypeOptions}
                      placeholder="Select provider type..."
                      disabled={isLoading}
                      $hasError={!!errors.providerTypeId?.message}
                      size="medium"
                    />
                  )}
                />
              </FormField>

              {/* Provider Name */}
              <FormField
                label="Provider Name"
                error={errors.providerName?.message}
                helpText="Name of the person or organization"
                // required
              >
                <Controller
                  name="providerName"
                  control={control}
                  rules={{
                    // required: "Provider name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 255,
                      message: "Name cannot exceed 255 characters",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter provider name..."
                      disabled={isLoading}
                      variant={
                        errors.providerName?.message ? "error" : "default"
                      }
                    />
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>

          {/* Contact Information Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineEnvelope />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Contact Information
                </Text>
                <Text size="xs" color="muted">
                  Optional contact details for follow-up communication
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="two-columns">
              {/* Email */}
              <FormField
                label="Email Address"
                error={errors.providerEmail?.message}
                // helpText="Email for case updates"
              >
                <Controller
                  name="providerEmail"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      disabled={isLoading}
                      $variant={
                        errors.providerEmail?.message ? "error" : "default"
                      }
                      leftIcon={<HiOutlineEnvelope />}
                    />
                  )}
                />
              </FormField>

              {/* Phone */}
              <FormField
                label="Phone Number"
                error={errors.providerPhone?.message}
                // helpText="Phone for urgent communication"
              >
                <Controller
                  name="providerPhone"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[+]?[\d\s\-()]{10,}$/,
                      message: "Please enter a valid phone number",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      disabled={isLoading}
                      variant={errors.providerPhone ? "error" : "default"}
                      leftIcon={<HiOutlinePhone />}
                    />
                  )}
                />
              </FormField>

              {/* Organization (if applicable) */}
              <FormField
                label="Organization"
                error={errors.providerOrganization?.message}
                helpText="Organization or company name (if applicable)"
              >
                <Controller
                  name="providerOrganization"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Organization name..."
                      disabled={isLoading}
                      variant={
                        errors.providerOrganization ? "error" : "default"
                      }
                    />
                  )}
                />
              </FormField>

              {/* Address */}
              <FormField
                label="Address"
                error={errors.providerAddress?.message}
                helpText="Physical address (optional)"
              >
                <Controller
                  name="providerAddress"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Street address, city, country..."
                      disabled={isLoading}
                      variant={errors.providerAddress ? "error" : "default"}
                    />
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>

          {/* Individual Demographics (conditional) */}
          {isIndividualProvider && (
            <SectionCard>
              <SectionHeader>
                <SectionIcon>
                  <HiOutlineUser />
                </SectionIcon>
                <Column gap={0}>
                  <Text size="md" weight="semibold">
                    Individual Demographics
                  </Text>
                  <Text size="xs" color="muted">
                    Optional demographic information for reporting
                  </Text>
                </Column>
              </SectionHeader>

              <FieldGrid className="three-columns">
                {/* Gender */}
                <FormField
                  label="Gender"
                  error={errors.individualProviderGender?.message}
                  // helpText="Optional"
                >
                  <Controller
                    name="individualProviderGender"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        options={genderOptions}
                        placeholder="Select..."
                        disabled={isLoading}
                        $hasError={!!errors.individualProviderGender?.message}
                        size="medium"
                      />
                    )}
                  />
                </FormField>

                {/* Age Group */}
                <FormField
                  label="Age Group"
                  error={errors.individualProviderAgeGroup?.message}
                  // helpText="Optional"
                >
                  <Controller
                    name="individualProviderAgeGroup"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        options={ageGroupOptions}
                        placeholder="Select..."
                        disabled={isLoading}
                        $hasError={!!errors.individualProviderAgeGroup?.message}
                        size="medium"
                      />
                    )}
                  />
                </FormField>

                {/* Disability Status */}
                <FormField
                  label="Disability Status"
                  error={errors.individualProviderDisabilityStatus?.message}
                  // helpText="Optional"
                >
                  <Controller
                    name="individualProviderDisabilityStatus"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        options={disabilityOptions}
                        placeholder="Select..."
                        disabled={isLoading}
                        $hasError={
                          !!errors.individualProviderDisabilityStatus?.message
                        }
                        size="medium"
                      />
                    )}
                  />
                </FormField>
              </FieldGrid>
            </SectionCard>
          )}

          {/* Group Demographics (conditional) */}
          {isGroupProvider && (
            <SectionCard>
              <SectionHeader>
                <SectionIcon>
                  <HiOutlineUsers />
                </SectionIcon>
                <Column gap={0}>
                  <Text size="md" weight="semibold">
                    Group Demographics
                  </Text>
                  <Text size="xs" color="muted">
                    Information about the group providing feedback
                  </Text>
                </Column>
              </SectionHeader>

              <FieldGrid className="two-columns">
                {/* Group Size */}
                <FormField
                  label="Number of People"
                  error={errors.groupProviderSize?.message}
                  helpText="How many people in this group?"
                >
                  <Controller
                    name="groupProviderSize"
                    control={control}
                    rules={{
                      min: {
                        value: 1,
                        message: "Number must be at least 1",
                      },
                      max: {
                        value: 10000,
                        message: "Please verify this number",
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="10000"
                        placeholder="e.g., 25"
                        disabled={isLoading}
                        variant={
                          errors.groupProviderSize?.message
                            ? "error"
                            : "default"
                        }
                      />
                    )}
                  />
                </FormField>

                {/* Gender Composition */}
                <FormField
                  label="Gender Composition"
                  error={errors.groupProviderGenderComposition?.message}
                  helpText="Gender distribution in the group"
                >
                  <Controller
                    name="groupProviderGenderComposition"
                    control={control}
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        options={genderCompositionOptions}
                        placeholder="Select..."
                        disabled={isLoading}
                        $hasError={
                          !!errors.groupProviderGenderComposition?.message
                        }
                        size="medium"
                      />
                    )}
                  />
                </FormField>
              </FieldGrid>
            </SectionCard>
          )}

          {/* Consent & Privacy Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineShieldCheck />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Consent & Privacy
                </Text>
                <Text size="xs" color="muted">
                  Data sharing and follow-up preferences
                </Text>
              </Column>
            </SectionHeader>

            <CheckboxContainer>
              {/* Data Sharing Consent */}
              <Controller
                name="dataSharingConsent"
                control={control}
                render={({ field }) => (
                  <EnhancedCheckbox
                    {...field}
                    checked={field.value}
                    label="Data Sharing Consent"
                    // helpText="Provider consents to sharing their feedback data with relevant stakeholders for program improvement and reporting purposes."
                    disabled={isLoading}
                  />
                )}
              />

              {/* Follow-up Consent */}
              <Controller
                name="followUpConsent"
                control={control}
                render={({ field }) => (
                  <EnhancedCheckbox
                    {...field}
                    checked={field.value}
                    label="Follow-up Contact Consent"
                    // description="Provider agrees to be contacted for additional information, clarification, or case updates."
                    disabled={isLoading}
                  />
                )}
              />

              {/* Privacy Policy Acceptance */}
              <Controller
                name="privacyPolicyAccepted"
                control={control}
                render={({ field }) => (
                  <EnhancedCheckbox
                    {...field}
                    checked={field.value}
                    label="Privacy Policy Accepted"
                    // description="Provider has read and accepts the organization's privacy policy and data protection practices."
                    disabled={isLoading}
                  />
                )}
              />
            </CheckboxContainer>

            {/* Follow-up Contact Method (conditional) */}
            {followUpConsent && (
              <ConditionalSection $visible={followUpConsent}>
                <FormField
                  label="Preferred Contact Method"
                  error={errors.followUpContactMethod?.message}
                  required={followUpConsent}
                  // helpText="How should we contact you for follow-up?"
                >
                  <Controller
                    name="followUpContactMethod"
                    control={control}
                    rules={
                      followUpConsent
                        ? {
                            required: "Please select a contact method",
                          }
                        : {}
                    }
                    render={({ field }) => (
                      <StyledSelect
                        {...field}
                        options={contactMethodOptions}
                        placeholder="Select contact method..."
                        disabled={isLoading}
                        $hasError={!!errors.followUpContactMethod?.message}
                        size="medium"
                      />
                    )}
                  />
                </FormField>
              </ConditionalSection>
            )}
          </SectionCard>
        </MainSection>

        {/* Side Section - Help and Guidelines */}
        <SideSection>
          {/* Provider Type Help */}
          <InfoCard
            icon={HiOutlineInformationCircle}
            title="Provider Types"
            variant="info"
          >
            <Column gap={2}>
              <Text size="sm">
                <strong>Individual Beneficiary:</strong> A single person
                receiving services
              </Text>
              <Text size="sm">
                <strong>Group of Beneficiaries:</strong> Multiple people
                receiving services together
              </Text>
              <Text size="sm">
                <strong>Community Representative:</strong> Someone speaking for
                their community
              </Text>
              <Text size="sm">
                <strong>Partner Organization:</strong> Partner providing
                feedback on services
              </Text>
            </Column>
          </InfoCard>

          {/* Privacy Guidelines */}
          <InfoCard
            icon={HiOutlineShieldCheck}
            title="Privacy & Consent Guidelines"
            variant="success"
          >
            <Column gap={2}>
              <Text size="sm">
                <strong>Data Protection:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">All personal data is protected</Text>
                </li>
                <li>
                  <Text size="xs">Consent can be withdrawn anytime</Text>
                </li>
                <li>
                  <Text size="xs">Data is used only for case processing</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Follow-up Contact:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">Only when necessary for case resolution</Text>
                </li>
                <li>
                  <Text size="xs">Using the preferred contact method</Text>
                </li>
                <li>
                  <Text size="xs">Respects provider's availability</Text>
                </li>
              </ul>
            </Column>
          </InfoCard>

          {/* Demographics Help */}
          {(isIndividualProvider || isGroupProvider) && (
            <InfoCard
              icon={isIndividualProvider ? HiOutlineUser : HiOutlineUsers}
              title="Demographic Information"
              variant="warning"
            >
              <Column gap={2}>
                <Text size="sm">
                  <strong>Important:</strong> All demographic information is
                  optional and used only for:
                </Text>
                <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                  <li>
                    <Text size="xs">Program impact analysis</Text>
                  </li>
                  <li>
                    <Text size="xs">Ensuring inclusive service delivery</Text>
                  </li>
                  <li>
                    <Text size="xs">Identifying underserved populations</Text>
                  </li>
                  <li>
                    <Text size="xs">
                      Compliance with reporting requirements
                    </Text>
                  </li>
                </ul>
                <Text
                  size="xs"
                  color="muted"
                  style={{ marginTop: "var(--spacing-2)" }}
                >
                  This information will never be used to discriminate or exclude
                  anyone from services.
                </Text>
              </Column>
            </InfoCard>
          )}
        </SideSection>
      </SectionGrid>
    </TabContainer>
  );
}

ProviderDetailsTab.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  trigger: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.object,
};

export default ProviderDetailsTab;
