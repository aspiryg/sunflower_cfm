import { Controller } from "react-hook-form";
import { useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import FormField, { Input, Select } from "../../../ui/FormField";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Column from "../../../ui/Column";

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  max-width: 90rem;
  padding: var(--spacing-8);

  @media (max-width: 768px) {
    padding: var(--spacing-6);
    gap: var(--spacing-6);
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid var(--color-grey-200);
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  border-radius: var(--border-radius-md);
  color: var(--color-grey-0);
  flex-shrink: 0;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
`;

const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-25);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-50);
    border-color: var(--color-grey-300);
  }

  &:has(input:checked) {
    background-color: var(--color-brand-25);
    border-color: var(--color-brand-200);
  }
`;

const Checkbox = styled.input`
  width: 1.8rem;
  height: 1.8rem;
  accent-color: var(--color-brand-500);
  cursor: pointer;
  margin-top: 0.2rem;
`;

const CheckboxLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
  cursor: pointer;
  flex: 1;
  line-height: 1.5;
`;

const ConditionalSection = styled.div`
  padding: var(--spacing-4);
  background-color: var(--color-brand-25);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) =>
    props.$hidden &&
    `
    opacity: 0.3;
    pointer-events: none;
  `}
`;

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  background: linear-gradient(
    135deg,
    var(--color-info-25),
    var(--color-info-50)
  );
  border: 1px solid var(--color-info-200);
  border-left: 4px solid var(--color-info-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  color: var(--color-info-700);
`;

function ProviderDetailsTab({
  control,
  errors,
  watch,
  setValue,
  isLoading = false,
  formOptions,
}) {
  // Watch fields for conditional rendering
  const providerType = watch("providerType");
  const consentToFollowUp = watch("consentToFollowUp");
  const isIndividualProvider = providerType === 1;
  const isGroupProvider = providerType === 2;

  // Provider name labels based on type
  const providerNameLabel = {
    1: "Full Name",
    2: "Group/Organization Name",
    3: "Organization Name",
    4: "Contractor Name",
    5: "Supplier Name",
    6: "Community Name",
    7: "Provider Name",
  };

  // Provider types from formOptions
  const { providerTypes = [] } = formOptions || {};

  // Contact method options (shown when consent to follow-up is given)
  const contactMethods = [
    { value: "", label: "Select preferred contact method...", disabled: true },
    {
      value: "phone",
      label: "Phone Call",
      description: "Direct phone contact",
    },
    { value: "email", label: "Email", description: "Email communication" },
    {
      value: "sms",
      label: "SMS/Text Message",
      description: "Text message updates",
    },
    {
      value: "in_person",
      label: "In-Person Meeting",
      description: "Face-to-face meeting",
    },
    {
      value: "letter",
      label: "Written Letter",
      description: "Postal correspondence",
    },
    {
      value: "any",
      label: "Any Method",
      description: "No preference for contact method",
    },
  ];

  // Demographic options
  const genderOptions = [
    { value: "", label: "Select gender...", disabled: true },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-binary" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
    { value: "other", label: "Other" },
  ];

  const ageGroups = [
    { value: "", label: "Select age group...", disabled: true },
    { value: "under_18", label: "Under 18" },
    { value: "18_25", label: "18-25" },
    { value: "26_35", label: "26-35" },
    { value: "36_50", label: "36-50" },
    { value: "51_65", label: "51-65" },
    { value: "over_65", label: "Over 65" },
  ];

  const disabilityStatuses = [
    { value: "", label: "Select disability status...", disabled: true },
    { value: "none", label: "No disability" },
    { value: "physical", label: "Physical disability" },
    { value: "visual", label: "Visual impairment" },
    { value: "hearing", label: "Hearing impairment" },
    { value: "cognitive", label: "Cognitive disability" },
    { value: "multiple", label: "Multiple disabilities" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  const genderCompositions = [
    { value: "", label: "Select composition...", disabled: true },
    { value: "mixed", label: "Mixed gender" },
    { value: "majority_male", label: "Majority male" },
    { value: "majority_female", label: "Majority female" },
    { value: "all_male", label: "All male" },
    { value: "all_female", label: "All female" },
    { value: "unknown", label: "Unknown" },
  ];

  // Reset fields when provider type changes
  useEffect(() => {
    if (providerType === 1) {
      setValue("groupProviderNumberOfIndividuals", "");
      setValue("groupProviderGenderComposition", "");
    } else if (providerType === 2) {
      setValue("individualProviderGender", "");
      setValue("individualProviderAgeGroup", "");
      setValue("individualProviderDisabilityStatus", "");
    }
  }, [providerType, setValue]);

  // Reset follow-up contact method when consent is withdrawn
  useEffect(() => {
    if (!consentToFollowUp) {
      setValue("followUpContactMethod", "");
    }
  }, [consentToFollowUp, setValue]);

  return (
    <TabContainer aria-label="Provider Details">
      {/* Provider Information Note */}
      <InfoNote>
        <HiOutlineInformationCircle
          size={20}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <Column gap={1}>
          <Text size="sm" weight="semibold">
            Provider Information Guidelines
          </Text>
          <Text size="sm">
            Collect only necessary information for case processing and
            follow-up. All demographic information is optional and should be
            provided with consent. Respect privacy preferences and data
            protection requirements.
          </Text>
        </Column>
      </InfoNote>

      {/* Provider Type Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineUser />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Provider Type
            </Heading>
            <Text size="sm" color="muted">
              Identify whether the feedback comes from an individual or group
            </Text>
          </SectionContent>
        </SectionHeader>

        <Controller
          name="providerType"
          control={control}
          rules={{
            required: "Please select a provider type",
          }}
          render={({ field }) => (
            <FormField
              label="Provider Type"
              required
              error={errors.providerType?.message}
              helpText="Choose the category that best describes the feedback provider"
            >
              <StyledSelect
                {...field}
                $hasError={!!errors.providerType}
                disabled={isLoading}
                placeholder="Select provider type..."
                options={[
                  {
                    value: "",
                    label: "Select provider type...",
                    disabled: true,
                  },
                  ...providerTypes.map((type) => ({
                    value: type.id,
                    label: type.name,
                    description: type.description,
                  })),
                ]}
                onChange={(value) => field.onChange(parseInt(value) || "")}
              />
            </FormField>
          )}
        />
      </Section>

      {/* Basic Contact Information */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineUser />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Contact Information
            </Heading>
            <Text size="sm" color="muted">
              Basic contact details for case communication and follow-up
            </Text>
          </SectionContent>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="providerName"
            control={control}
            rules={{
              required: "Provider name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters long",
              },
              maxLength: {
                value: 100,
                message: "Name cannot exceed 100 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label={providerNameLabel[providerType] || "Provider Name"}
                required
                error={errors.providerName?.message}
                helpText="Enter the full name or organization name"
              >
                <Input
                  {...field}
                  placeholder={`Enter ${
                    providerNameLabel[providerType]?.toLowerCase() ||
                    "provider name"
                  }...`}
                  $hasError={!!errors.providerName}
                  disabled={isLoading}
                  maxLength={100}
                />
              </FormField>
            )}
          />

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
              <FormField
                label="Email Address"
                error={errors.providerEmail?.message}
                helpText="Contact email for case updates and communication"
              >
                <Input
                  {...field}
                  type="email"
                  placeholder="Enter email address..."
                  $hasError={!!errors.providerEmail}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />

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
              <FormField
                label="Phone Number"
                error={errors.providerPhone?.message}
                helpText="Contact phone number for urgent communication"
              >
                <Input
                  {...field}
                  type="tel"
                  placeholder="Enter phone number..."
                  $hasError={!!errors.providerPhone}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />
        </FieldGroup>
      </Section>

      {/* Individual Provider Demographics */}
      {isIndividualProvider && (
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineUser />
            </SectionIcon>
            <SectionContent>
              <Heading as="h3" size="h4">
                Individual Demographics
              </Heading>
              <Text size="sm" color="muted">
                Optional demographic information for reporting and analysis
              </Text>
            </SectionContent>
          </SectionHeader>

          <FieldGroup>
            <Controller
              name="individualProviderGender"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Gender Identity"
                  error={errors.individualProviderGender?.message}
                  helpText="Optional demographic information"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.individualProviderGender}
                    disabled={isLoading}
                    placeholder="Select gender..."
                    options={genderOptions}
                  />
                </FormField>
              )}
            />

            <Controller
              name="individualProviderAgeGroup"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Age Group"
                  error={errors.individualProviderAgeGroup?.message}
                  helpText="Age category for demographic analysis"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.individualProviderAgeGroup}
                    disabled={isLoading}
                    placeholder="Select age group..."
                    options={ageGroups}
                  />
                </FormField>
              )}
            />

            <Controller
              name="individualProviderDisabilityStatus"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Disability Status"
                  error={errors.individualProviderDisabilityStatus?.message}
                  helpText="Accessibility and accommodation information"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.individualProviderDisabilityStatus}
                    disabled={isLoading}
                    placeholder="Select disability status..."
                    options={disabilityStatuses}
                  />
                </FormField>
              )}
            />
          </FieldGroup>
        </Section>
      )}

      {/* Group Provider Information */}
      {isGroupProvider && (
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineUsers />
            </SectionIcon>
            <SectionContent>
              <Heading as="h3" size="h4">
                Group Demographics
              </Heading>
              <Text size="sm" color="muted">
                Information about the group or organization providing feedback
              </Text>
            </SectionContent>
          </SectionHeader>

          <FieldGroup>
            <Controller
              name="groupProviderNumberOfIndividuals"
              control={control}
              rules={{
                min: {
                  value: 1,
                  message: "Number must be at least 1",
                },
                max: {
                  value: 10000,
                  message: "Number cannot exceed 10,000",
                },
              }}
              render={({ field }) => (
                <FormField
                  label="Number of People"
                  error={errors.groupProviderNumberOfIndividuals?.message}
                  helpText="How many individuals are represented by this group?"
                >
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="10000"
                    placeholder="Enter number of people..."
                    $hasError={!!errors.groupProviderNumberOfIndividuals}
                    disabled={isLoading}
                  />
                </FormField>
              )}
            />

            <Controller
              name="groupProviderGenderComposition"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Gender Composition"
                  error={errors.groupProviderGenderComposition?.message}
                  helpText="Gender distribution within the group"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.groupProviderGenderComposition}
                    disabled={isLoading}
                    placeholder="Select composition..."
                    options={genderCompositions}
                  />
                </FormField>
              )}
            />
          </FieldGroup>
        </Section>
      )}

      {/* Consent & Follow-up Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineShieldCheck />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Consent & Follow-up Preferences
            </Heading>
            <Text size="sm" color="muted">
              Data sharing permissions and follow-up communication preferences
            </Text>
          </SectionContent>
        </SectionHeader>

        <Column gap={4}>
          <Controller
            name="dataSharingConsent"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <Checkbox
                  {...field}
                  type="checkbox"
                  id="dataSharingConsent"
                  checked={field.value}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="dataSharingConsent">
                  <strong>Data Sharing Consent</strong>
                  <br />
                  <Text size="sm" color="muted">
                    The provider consents to having their feedback data shared
                    with relevant stakeholders and partners for program
                    improvement and reporting purposes. Personal identifying
                    information will be protected according to privacy policies.
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />

          <Controller
            name="consentToFollowUp"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <Checkbox
                  {...field}
                  type="checkbox"
                  id="consentToFollowUp"
                  checked={field.value}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="consentToFollowUp">
                  <strong>Follow-up Contact Consent</strong>
                  <br />
                  <Text size="sm" color="muted">
                    The provider agrees to be contacted for additional
                    information, clarification, or updates regarding this case.
                    They may withdraw this consent at any time.
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />

          {/* Follow-up Contact Method - Conditional Field */}
          {consentToFollowUp && (
            <ConditionalSection>
              <Column gap={3}>
                <Text size="sm" weight="semibold" color="brand">
                  Follow-up Contact Preferences
                </Text>

                <Controller
                  name="followUpContactMethod"
                  control={control}
                  rules={
                    consentToFollowUp
                      ? {
                          required:
                            "Please select a preferred contact method for follow-up",
                        }
                      : {}
                  }
                  render={({ field }) => (
                    <FormField
                      label="Preferred Contact Method"
                      required={consentToFollowUp}
                      error={errors.followUpContactMethod?.message}
                      helpText="How would you prefer to be contacted for follow-up communication?"
                    >
                      <StyledSelect
                        {...field}
                        $hasError={!!errors.followUpContactMethod}
                        disabled={isLoading}
                        placeholder="Select contact method..."
                        options={contactMethods}
                      />
                    </FormField>
                  )}
                />

                <InfoNote style={{ marginTop: "var(--spacing-2)" }}>
                  <HiOutlineInformationCircle
                    size={16}
                    style={{ marginTop: "1px", flexShrink: 0 }}
                  />
                  <Text size="xs">
                    Follow-up contact will only be made when necessary for case
                    resolution or to provide updates. The provider can request
                    to change their contact preferences or withdraw consent at
                    any time.
                  </Text>
                </InfoNote>
              </Column>
            </ConditionalSection>
          )}
        </Column>
      </Section>
    </TabContainer>
  );
}

ProviderDetailsTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.shape({
    providerTypes: PropTypes.array,
  }),
};

export default ProviderDetailsTab;
