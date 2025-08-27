import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
import DatePicker from "../../../ui/DatePicker";
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
  grid-template-columns: repeat(auto-fit, minmax(32rem, 1fr));
  gap: var(--spacing-5);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const ImportantNote = styled.div`
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

/**
 * Enhanced Basic Information Tab Component
 * Handles core case information with modern terminology and improved UX
 */
function BasicInfoTab({
  control,
  errors,
  watch,
  formOptions,
  isLoading = false,
}) {
  // Watch for conditional fields
  const caseType = watch("caseType");
  const urgency = watch("urgency");

  // Enhanced case type options
  const caseTypes = [
    { value: "", label: "Select case type...", disabled: true },
    {
      value: "complaint",
      label: "Complaint",
      description: "Issue or problem requiring resolution",
    },
    {
      value: "suggestion",
      label: "Suggestion",
      description: "Improvement or enhancement proposal",
    },
    {
      value: "compliment",
      label: "Compliment",
      description: "Positive feedback or praise",
    },
    {
      value: "inquiry",
      label: "Inquiry",
      description: "Request for information or clarification",
    },
    {
      value: "appeal",
      label: "Appeal",
      description: "Request to review a previous decision",
    },
  ];

  // Enhanced urgency levels
  const urgencyLevels = [
    { value: "", label: "Select urgency...", disabled: true },
    {
      value: "low",
      label: "Low",
      description: "No immediate action required",
      color: "success",
    },
    {
      value: "normal",
      label: "Normal",
      description: "Standard processing timeframe",
      color: "info",
    },
    {
      value: "high",
      label: "High",
      description: "Requires prompt attention",
      color: "warning",
    },
    {
      value: "critical",
      label: "Critical",
      description: "Immediate action required",
      color: "error",
    },
  ];

  return (
    <TabContainer aria-label="Basic Case Information">
      {/* Important Information Notice */}
      <ImportantNote>
        <HiOutlineInformationCircle
          size={20}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <Column gap={1}>
          <Text size="sm" weight="semibold">
            Case Creation Guidelines
          </Text>
          <Text size="sm">
            Provide clear, detailed information to ensure proper case
            classification and timely resolution. All required fields must be
            completed before proceeding to the next step.
          </Text>
        </Column>
      </ImportantNote>

      {/* Essential Case Details */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineDocumentText />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Essential Case Details
            </Heading>
            <Text size="sm" color="muted">
              Core information that identifies and describes this case
            </Text>
          </SectionContent>
        </SectionHeader>

        <Column gap={5}>
          <Controller
            name="title"
            control={control}
            rules={{
              required: "Case title is required",
              minLength: {
                value: 5,
                message: "Title must be at least 5 characters long",
              },
              maxLength: {
                value: 200,
                message: "Title cannot exceed 200 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Case Title"
                required
                error={errors.title?.message}
                helpText="Brief, descriptive title that summarizes the case (5-200 characters)"
              >
                <Input
                  {...field}
                  placeholder="Enter a clear, concise case title..."
                  $variant={errors.title ? "error" : "default"}
                  disabled={isLoading}
                  maxLength={200}
                />
              </FormField>
            )}
          />

          <FieldGroup>
            <Controller
              name="feedbackDate"
              control={control}
              rules={{
                required: "Case date is required",
                validate: (value) => {
                  const selectedDate = new Date(value);
                  const today = new Date();
                  today.setHours(23, 59, 59, 999); // End of today

                  if (selectedDate > today) {
                    return "Case date cannot be in the future";
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormField
                  label="Date Received"
                  required
                  error={errors.feedbackDate?.message}
                  helpText="When was this case initially received?"
                >
                  <DatePicker
                    {...field}
                    max={new Date().toISOString().slice(0, 10)}
                    $hasError={!!errors.feedbackDate}
                    disabled={isLoading}
                    placeholder="Select date received..."
                  />
                </FormField>
              )}
            />

            <Controller
              name="caseType"
              control={control}
              rules={{
                required: "Please select a case type",
              }}
              render={({ field }) => (
                <FormField
                  label="Case Type"
                  required
                  error={errors.caseType?.message}
                  helpText="What type of case is this?"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.caseType}
                    disabled={isLoading}
                    placeholder="Select case type..."
                    options={caseTypes}
                  />
                </FormField>
              )}
            />
          </FieldGroup>

          <Controller
            name="urgency"
            control={control}
            rules={{
              required: "Please select an urgency level",
            }}
            render={({ field }) => (
              <FormField
                label="Urgency Level"
                required
                error={errors.urgency?.message}
                helpText={
                  urgency
                    ? `${
                        urgencyLevels.find((u) => u.value === urgency)
                          ?.description || ""
                      }`
                    : "How urgent is this case?"
                }
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.urgency}
                  disabled={isLoading}
                  placeholder="Select urgency level..."
                  options={urgencyLevels}
                />
              </FormField>
            )}
          />

          <Controller
            name="description"
            control={control}
            rules={{
              required: "Case description is required",
              minLength: {
                value: 20,
                message: "Description must be at least 20 characters long",
              },
              maxLength: {
                value: 2000,
                message: "Description cannot exceed 2000 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Case Description"
                required
                error={errors.description?.message}
                helpText="Detailed description of the case, including all relevant facts and circumstances"
              >
                <Textarea
                  {...field}
                  placeholder="Provide a comprehensive description of the case. Include:
• What happened?
• When did it occur?
• Who was involved?
• What is the desired outcome?"
                  $variant={errors.description ? "error" : "default"}
                  rows={8}
                  disabled={isLoading}
                  maxLength={2000}
                />
                <Text
                  size="xs"
                  color="muted"
                  style={{ marginTop: "var(--spacing-1)" }}
                >
                  {field.value?.length || 0}/2000 characters
                </Text>
              </FormField>
            )}
          />
        </Column>
      </Section>

      {/* Impact Assessment */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineExclamationTriangle />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Impact Assessment
            </Heading>
            <Text size="sm" color="muted">
              Optional details about the impact or consequences of this case
            </Text>
          </SectionContent>
        </SectionHeader>

        <Controller
          name="impactDescription"
          control={control}
          rules={{
            maxLength: {
              value: 1000,
              message: "Impact description cannot exceed 1000 characters",
            },
          }}
          render={({ field }) => (
            <FormField
              label="Impact Description"
              error={errors.impactDescription?.message}
              helpText="Describe how this case affects individuals, operations, or the community"
            >
              <Textarea
                {...field}
                placeholder="Describe the impact or consequences of this case:
• Who is affected?
• What are the immediate effects?
• Are there any ongoing concerns?
• What could happen if not resolved?"
                $variant={errors.impactDescription ? "error" : "default"}
                rows={5}
                disabled={isLoading}
                maxLength={1000}
              />
              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-1)" }}
              >
                {field.value?.length || 0}/1000 characters
              </Text>
            </FormField>
          )}
        />
      </Section>

      {/* Case Type Specific Information */}
      {caseType && (
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineInformationCircle />
            </SectionIcon>
            <SectionContent>
              <Heading as="h3" size="h4">
                {caseTypes.find((t) => t.value === caseType)?.label} Information
              </Heading>
              <Text size="sm" color="muted">
                Additional context specific to{" "}
                {caseTypes
                  .find((t) => t.value === caseType)
                  ?.label.toLowerCase()}{" "}
                cases
              </Text>
            </SectionContent>
          </SectionHeader>

          <ImportantNote>
            <HiOutlineInformationCircle
              size={20}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Column gap={1}>
              <Text size="sm" weight="semibold">
                {caseTypes.find((t) => t.value === caseType)?.label} Processing
                Guidelines
              </Text>
              <Text size="sm">
                {caseType === "complaint" &&
                  "Complaints require investigation and formal response. Expected resolution timeframe: 5-14 business days."}
                {caseType === "suggestion" &&
                  "Suggestions are reviewed for feasibility and potential implementation. Review timeframe: 7-21 business days."}
                {caseType === "compliment" &&
                  "Compliments are shared with relevant teams and may be published (with consent). Processing timeframe: 2-5 business days."}
                {caseType === "inquiry" &&
                  "Inquiries receive informational responses. Expected response timeframe: 1-3 business days."}
                {caseType === "appeal" &&
                  "Appeals require formal review of previous decisions. Review timeframe: 10-30 business days."}
              </Text>
            </Column>
          </ImportantNote>
        </Section>
      )}

      {/* Urgency Warning */}
      {urgency === "critical" && (
        <ImportantNote
          style={{
            background:
              "linear-gradient(135deg, var(--color-error-25), var(--color-error-50))",
            borderColor: "var(--color-error-200)",
            borderLeftColor: "var(--color-error-500)",
            color: "var(--color-error-700)",
          }}
        >
          <HiOutlineExclamationTriangle
            size={20}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <Column gap={1}>
            <Text size="sm" weight="semibold">
              Critical Urgency Alert
            </Text>
            <Text size="sm">
              This case has been marked as critical urgency. It will be
              immediately escalated and requires prompt attention from senior
              staff. Ensure all details are accurate and complete.
            </Text>
          </Column>
        </ImportantNote>
      )}
    </TabContainer>
  );
}

BasicInfoTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    categories: PropTypes.array,
    channels: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
};

export default BasicInfoTab;
