import { Controller } from "react-hook-form";
import { useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import FormField, { Input, Select } from "../../../ui/FormField";
import Text from "../../../ui/Text";

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: 80rem;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-200);
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
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-25);

  &:hover {
    background-color: var(--color-grey-50);
  }
`;

const Checkbox = styled.input`
  width: 1.6rem;
  height: 1.6rem;
  accent-color: var(--color-brand-500);
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-700);
  cursor: pointer;
  flex: 1;
`;

const ConditionalSection = styled.div`
  padding: var(--spacing-4);
  background-color: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  transition: opacity var(--duration-normal) var(--ease-in-out);

  ${(props) =>
    props.$hidden &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

/**
 * Provider Details Tab Component
 * Handles provider information with dynamic fields based on provider type
 */
function ProviderDetailsTab({
  control,
  errors,
  watch,
  setValue,
  isLoading = false,
  formOptions,
}) {
  // Watch provider type to show/hide conditional fields
  const providerType = watch("providerType");
  const isIndividualProvider = providerType === 1;
  const isGroupProvider = providerType === 2;

  // label for provider name fiels
  const providerNameLabel = {
    1: "Full Name",
    2: "Name of the beneficiary group, if any",
    3: "Organization Name",
    4: "Contractor Name",
    5: "Supplier Name",
    6: "Community Name",
    7: "Provider Name",
  };

  // Provider types
  const { providerTypes } = formOptions || [];
  // console.log("Provider Types:", providerTypes);

  // Individual provider options
  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-binary" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
    { value: "other", label: "Other" },
  ];

  const ageGroups = [
    { value: "under_18", label: "Under 18" },
    { value: "18_25", label: "18-25" },
    { value: "26_35", label: "26-35" },
    { value: "36_50", label: "36-50" },
    { value: "51_65", label: "51-65" },
    { value: "over_65", label: "Over 65" },
  ];

  const disabilityStatuses = [
    { value: "none", label: "No disability" },
    { value: "physical", label: "Physical disability" },
    { value: "visual", label: "Visual impairment" },
    { value: "hearing", label: "Hearing impairment" },
    { value: "cognitive", label: "Cognitive disability" },
    { value: "multiple", label: "Multiple disabilities" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ];

  // Group provider options
  const genderCompositions = [
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
      // Reset group provider fields
      setValue("groupProviderNumberOfIndividuals", "");
      setValue("groupProviderGenderComposition", "");
    } else if (providerType === 2) {
      // Reset individual provider fields
      setValue("individualProviderGender", "");
      setValue("individualProviderAgeGroup", "");
      setValue("individualProviderDisabilityStatus", "");
    }
  }, [providerType, setValue]);

  return (
    <TabContainer>
      {/* Provider Type Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Provider Type
          </Text>
          <Text size="sm" color="muted">
            Specify whether this feedback is from an individual or a group
          </Text>
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
              helpText="Choose if the feedback provider is an individual person or a group/organization"
            >
              <Select
                {...field}
                $hasError={!!errors.providerType}
                disabled={isLoading}
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                <option value="">Select provider type...</option>
                {providerTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        />
      </Section>

      {/* Basic Contact Information */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Contact Information
          </Text>
          <Text size="sm" color="muted">
            Basic contact details for the feedback provider
          </Text>
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
                helpText={
                  providerNameLabel[providerType] ||
                  "Enter the name of the provider"
                }
              >
                <Input
                  {...field}
                  placeholder={`Enter ${
                    providerNameLabel[providerType]?.toLowerCase() ||
                    "Provider Name"
                  }...`}
                  $hasError={!!errors.providerName}
                  disabled={isLoading}
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
                helpText="Contact email (optional)"
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
                helpText="Contact phone number (optional)"
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

      {/* Individual Provider Details */}
      {isIndividualProvider && (
        <ConditionalSection>
          <SectionHeader>
            <Text size="lg" weight="semibold">
              Individual Details
            </Text>
            <Text size="sm" color="muted">
              Demographic information for individual providers
            </Text>
          </SectionHeader>

          <FieldGroup>
            <Controller
              name="individualProviderGender"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Gender"
                  error={errors.individualProviderGender?.message}
                  helpText="Gender identity (optional)"
                >
                  <Select
                    {...field}
                    $hasError={!!errors.individualProviderGender}
                    disabled={isLoading}
                  >
                    <option value="">Select gender...</option>
                    {genderOptions.map((gender) => (
                      <option key={gender.value} value={gender.value}>
                        {gender.label}
                      </option>
                    ))}
                  </Select>
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
                  helpText="Age category (optional)"
                >
                  <Select
                    {...field}
                    $hasError={!!errors.individualProviderAgeGroup}
                    disabled={isLoading}
                  >
                    <option value="">Select age group...</option>
                    {ageGroups.map((ageGroup) => (
                      <option key={ageGroup.value} value={ageGroup.value}>
                        {ageGroup.label}
                      </option>
                    ))}
                  </Select>
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
                  helpText="Disability information (optional)"
                >
                  <Select
                    {...field}
                    $hasError={!!errors.individualProviderDisabilityStatus}
                    disabled={isLoading}
                  >
                    <option value="">Select disability status...</option>
                    {disabilityStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
            />
          </FieldGroup>
        </ConditionalSection>
      )}

      {/* Group Provider Details */}
      {isGroupProvider && (
        <ConditionalSection>
          <SectionHeader>
            <Text size="lg" weight="semibold">
              Group Details
            </Text>
            <Text size="sm" color="muted">
              Information about the group or organization
            </Text>
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
                  label="Number of Individuals"
                  error={errors.groupProviderNumberOfIndividuals?.message}
                  helpText="How many people are in this group? (optional)"
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
                  helpText="Gender distribution in the group (optional)"
                >
                  <Select
                    {...field}
                    $hasError={!!errors.groupProviderGenderComposition}
                    disabled={isLoading}
                  >
                    <option value="">Select composition...</option>
                    {genderCompositions.map((composition) => (
                      <option key={composition.value} value={composition.value}>
                        {composition.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
              )}
            />
          </FieldGroup>
        </ConditionalSection>
      )}

      {/* Consent Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Consent & Permissions
          </Text>
          <Text size="sm" color="muted">
            Data sharing and follow-up consent preferences
          </Text>
        </SectionHeader>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-3)",
          }}
        >
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
                    with relevant stakeholders for program improvement purposes
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
                    information or follow-up regarding this feedback
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />
        </div>
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
};

export default ProviderDetailsTab;
