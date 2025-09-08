// Update this file: /frontend/src/features/cases/form/BasicInfoTab.jsx
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineInformationCircle,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineExclamationTriangle,
  HiOutlineSparkles,
} from "react-icons/hi2";

import FormField from "../../../ui/FormField";
import Input from "../../../ui/Input";
import { Textarea } from "../../../ui/FormField";
import DatePicker from "../../../ui/DatePicker";
import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Row from "../../../ui/Row";
import Column from "../../../ui/Column";
import InfoCard from "../../../ui/InfoCard";

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
`;

const CharacterCounter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-1);
`;

const CounterText = styled(Text)`
  color: ${(props) =>
    props.$isNearLimit
      ? "var(--color-warning-600)"
      : props.$isOverLimit
      ? "var(--color-error-600)"
      : "var(--color-grey-500)"};
`;

const HelpText = styled(Text)`
  color: var(--color-grey-500);
  line-height: 1.5;
`;

const SmartSuggestion = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-blue-50),
    var(--color-indigo-50)
  );
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
`;

/**
 * BasicInfoTab Component
 *
 * Handles the essential case information including title, description,
 * dates, and impact assessment with smart validation and UX enhancements
 */
function BasicInfoTab({
  control,
  watch,
  setValue,
  errors,
  trigger,
  // isEditing,
  isLoading,
  // formOptions = {},
}) {
  const [titleCharCount, setTitleCharCount] = useState(0);
  const [descCharCount, setDescCharCount] = useState(0);
  const [impactCharCount, setImpactCharCount] = useState(0);
  // const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  // Watch form values for smart suggestions and validations
  const watchedValues = watch([
    "title",
    "description",
    "caseDate",
    "dueDate",
    "impactDescription",
    "affectedBeneficiaries",
  ]);

  const [
    title,
    description,
    caseDate,
    dueDate,
    impactDescription,
    affectedBeneficiaries,
  ] = watchedValues;

  // Character limits
  const TITLE_LIMIT = 255;
  const DESCRIPTION_LIMIT = 2000;
  const IMPACT_LIMIT = 1000;

  // Update character counts
  useEffect(() => {
    setTitleCharCount(title?.length || 0);
    setDescCharCount(description?.length || 0);
    setImpactCharCount(impactDescription?.length || 0);
  }, [title, description, impactDescription]);

  // Smart validation for date logic
  useEffect(() => {
    if (caseDate && dueDate) {
      const caseDateObj = new Date(caseDate);
      const dueDateObj = new Date(dueDate);

      if (dueDateObj <= caseDateObj) {
        // Trigger validation for due date
        trigger("dueDate");
      }
    }
  }, [caseDate, dueDate, trigger]);

  // Smart suggestions based on input
  const getSmartSuggestions = () => {
    const suggestions = [];

    if (title && title.length < 10) {
      suggestions.push({
        type: "title",
        message:
          "Consider adding more detail to the title for better case identification",
        action: "Add location, nature, or urgency level",
      });
    }

    if (description && description.length < 50) {
      suggestions.push({
        type: "description",
        message: "A more detailed description helps with case processing",
        action: "Include what happened, when, and who was affected",
      });
    }

    if (affectedBeneficiaries && Number(affectedBeneficiaries) > 100) {
      suggestions.push({
        type: "escalation",
        message: "High number of affected beneficiaries detected",
        action:
          "Consider escalating this case or involving additional resources",
      });
    }

    return suggestions;
  };

  const suggestions = getSmartSuggestions();

  // Auto-generate due date based on case date (7 days by default)
  const handleCaseDateChange = (date, onChange) => {
    onChange(date);

    // Auto-set due date if not already set
    if (date && !dueDate) {
      const suggestedDueDate = new Date(date);
      suggestedDueDate.setDate(suggestedDueDate.getDate() + 7);
      setValue("dueDate", suggestedDueDate.toISOString().slice(0, 10));
    }
  };

  // console.log("Case Date: ", caseDate);
  // console.log("Due Date: ", dueDate);
  // console.log("Case Date (new Date): ", new Date(caseDate));

  return (
    <TabContainer>
      <TabHeader>
        <Text size="lg" weight="semibold" color="grey-800">
          Basic Case Information
        </Text>
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
          Essential details about the case including title, description,
          timeline, and impact assessment
        </Text>
      </TabHeader>

      <SectionGrid>
        {/* Main Content Section */}
        <MainSection>
          {/* Case Identification Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineInformationCircle />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Case Identification
                </Text>
                <Text size="xs" color="muted">
                  Primary case details and description
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Case Title */}
              <FormField
                label="Case Title"
                error={errors.title?.message}
                required
                // helpText="Clear, descriptive title that summarizes the case"
              >
                <Controller
                  name="title"
                  control={control}
                  rules={{
                    required: "Case title is required",
                    minLength: {
                      value: 5,
                      message: "Title must be at least 5 characters",
                    },
                    maxLength: {
                      value: TITLE_LIMIT,
                      message: `Title cannot exceed ${TITLE_LIMIT} characters`,
                    },
                  }}
                  render={({ field }) => (
                    <>
                      <Input
                        {...field}
                        placeholder="Enter a clear, descriptive case title..."
                        disabled={isLoading}
                        variant={errors.title?.message ? "error" : "default"}
                        autoComplete="off"
                      />
                      <CharacterCounter>
                        <HelpText size="xs">
                          Be specific and include key details like location or
                          nature
                        </HelpText>
                        <CounterText
                          size="xs"
                          $isNearLimit={titleCharCount > TITLE_LIMIT * 0.9}
                          $isOverLimit={titleCharCount > TITLE_LIMIT}
                        >
                          {titleCharCount}/{TITLE_LIMIT}
                        </CounterText>
                      </CharacterCounter>
                    </>
                  )}
                />
              </FormField>

              {/* Case Description */}
              <FormField
                label="Case Description"
                error={errors.description?.message}
                required
                // helpText="Detailed description of the case, including context and specifics"
              >
                <Controller
                  name="description"
                  control={control}
                  rules={{
                    required: "Case description is required",
                    minLength: {
                      value: 20,
                      message: "Description must be at least 20 characters",
                    },
                    maxLength: {
                      value: DESCRIPTION_LIMIT,
                      message: `Description cannot exceed ${DESCRIPTION_LIMIT} characters`,
                    },
                  }}
                  render={({ field }) => (
                    <>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Provide a comprehensive description of the case including:&#10;• What happened (the incident or issue)&#10;• When it occurred&#10;• Who was involved or affected&#10;• Where it took place&#10;• Any immediate actions taken"
                        disabled={isLoading}
                        $hasError={!!errors.description?.message}
                      />
                      <CharacterCounter>
                        <HelpText size="xs">
                          Include who, what, when, where, and any immediate
                          actions taken
                        </HelpText>
                        <CounterText
                          size="xs"
                          $isNearLimit={descCharCount > DESCRIPTION_LIMIT * 0.9}
                          $isOverLimit={descCharCount > DESCRIPTION_LIMIT}
                        >
                          {descCharCount}/{DESCRIPTION_LIMIT}
                        </CounterText>
                      </CharacterCounter>
                    </>
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>

          {/* Timeline Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineCalendar />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Case Timeline
                </Text>
                <Text size="xs" color="muted">
                  Important dates for case tracking and resolution
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="two-columns">
              {/* Case Date */}
              <FormField
                label="Case Date"
                error={errors.caseDate?.message}
                required
                helpText="When the case/incident occurred"
              >
                <Controller
                  name="caseDate"
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
                  render={({ field: { onChange, ...field } }) => (
                    <DatePicker
                      {...field}
                      onChange={(date) => handleCaseDateChange(date, onChange)}
                      disabled={isLoading}
                      error={!!errors.caseDate?.message}
                      // Max is Today + 1 day to allow timezone differences
                      max={new Date(Date.now() + 4 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 10)}
                      placeholder="Select case date"
                    />
                  )}
                />
              </FormField>

              {/* Due Date */}
              <FormField
                label="Due Date"
                error={errors.dueDate?.message}
                helpText="Target resolution date (auto-calculated if empty)"
              >
                <Controller
                  name="dueDate"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (value && caseDate) {
                        const dueDateObj = new Date(value);
                        const caseDateObj = new Date(caseDate);

                        if (dueDateObj <= caseDateObj) {
                          return "Due date must be after the case date";
                        }
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      disabled={isLoading}
                      error={!!errors.dueDate?.message}
                      min={
                        caseDate
                          ? new Date(
                              new Date(caseDate).getTime() + 24 * 60 * 60 * 1000
                            )
                              .toISOString()
                              .slice(0, 10)
                          : undefined
                      }
                      placeholder="Select due date"
                    />
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>

          {/* Impact Assessment Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineUsers />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Impact Assessment
                </Text>
                <Text size="xs" color="muted">
                  Assess the scope and impact of this case
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Impact Description */}
              <FormField
                label="Impact Description"
                error={errors.impactDescription?.message}
                // helpText="Describe the impact or consequences of this case"
              >
                <Controller
                  name="impactDescription"
                  control={control}
                  rules={{
                    maxLength: {
                      value: IMPACT_LIMIT,
                      message: `Impact description cannot exceed ${IMPACT_LIMIT} characters`,
                    },
                  }}
                  render={({ field }) => (
                    <>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Describe the impact or consequences:&#10;• Who is affected and how&#10;• Service disruptions or delays&#10;• Financial or operational impact&#10;• Community or individual consequences"
                        disabled={isLoading}
                        $hasError={!!errors.impactDescription?.message}
                      />
                      <CharacterCounter>
                        <HelpText size="xs">
                          Focus on measurable impacts and affected populations
                        </HelpText>
                        <CounterText
                          size="xs"
                          $isNearLimit={impactCharCount > IMPACT_LIMIT * 0.9}
                          $isOverLimit={impactCharCount > IMPACT_LIMIT}
                        >
                          {impactCharCount}/{IMPACT_LIMIT}
                        </CounterText>
                      </CharacterCounter>
                    </>
                  )}
                />
              </FormField>

              {/* Affected Beneficiaries Count */}
              <FieldGrid className="two-columns">
                <FormField
                  label="Affected Beneficiaries"
                  error={errors.affectedBeneficiaries?.message}
                  helpText="Estimated number of people affected"
                >
                  <Controller
                    name="affectedBeneficiaries"
                    control={control}
                    rules={{
                      min: {
                        value: 0,
                        message: "Number cannot be negative",
                      },
                      max: {
                        value: 100000,
                        message:
                          "Please verify this number - it seems unusually high",
                      },
                      validate: (value) => {
                        if (value && !Number.isInteger(Number(value))) {
                          return "Please enter a whole number";
                        }
                        return true;
                      },
                    }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g., 25"
                        disabled={isLoading}
                        variant={
                          errors.affectedBeneficiaries?.message
                            ? "error"
                            : "default"
                        }
                      />
                    )}
                  />
                </FormField>
              </FieldGrid>
            </FieldGrid>
          </SectionCard>
        </MainSection>

        {/* Side Section - Help and Suggestions */}
        <SideSection>
          {/* Help Card */}
          <InfoCard
            icon={HiOutlineInformationCircle}
            title="Case Information Guidelines"
            variant="info"
          >
            <Column gap={3}>
              <Text size="sm">
                <strong>Title Best Practices:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">Be specific and descriptive</Text>
                </li>
                <li>
                  <Text size="xs">Include location if relevant</Text>
                </li>
                <li>
                  <Text size="xs">Mention urgency level if critical</Text>
                </li>
                <li>
                  <Text size="xs">Avoid technical jargon</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Description Should Include:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">What happened (facts only)</Text>
                </li>
                <li>
                  <Text size="xs">When it occurred</Text>
                </li>
                <li>
                  <Text size="xs">Who was involved/affected</Text>
                </li>
                <li>
                  <Text size="xs">Where it took place</Text>
                </li>
                <li>
                  <Text size="xs">Any immediate actions taken</Text>
                </li>
              </ul>
            </Column>
          </InfoCard>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <InfoCard
              icon={HiOutlineSparkles}
              title="Smart Suggestions"
              variant="warning"
            >
              <Column gap={2}>
                {suggestions.map((suggestion, index) => (
                  <SmartSuggestion key={index}>
                    <HiOutlineExclamationTriangle
                      style={{
                        color: "var(--color-warning-600)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <Column gap={1}>
                      <Text size="xs" weight="medium">
                        {suggestion.message}
                      </Text>
                      <Text size="xs" color="muted">
                        {suggestion.action}
                      </Text>
                    </Column>
                  </SmartSuggestion>
                ))}
              </Column>
            </InfoCard>
          )}

          {/* Impact Assessment Help */}
          {affectedBeneficiaries && Number(affectedBeneficiaries) > 50 && (
            <InfoCard
              icon={HiOutlineUsers}
              title="High Impact Case"
              variant="error"
            >
              <Text size="sm">
                This case affects a significant number of beneficiaries.
                Consider:
              </Text>
              <ul
                style={{
                  margin: "var(--spacing-2) 0 0",
                  paddingLeft: "var(--spacing-4)",
                }}
              >
                <li>
                  <Text size="xs">Escalating to management</Text>
                </li>
                <li>
                  <Text size="xs">Involving additional resources</Text>
                </li>
                <li>
                  <Text size="xs">Implementing immediate mitigation</Text>
                </li>
                <li>
                  <Text size="xs">Communicating with stakeholders</Text>
                </li>
              </ul>
            </InfoCard>
          )}
        </SideSection>
      </SectionGrid>
    </TabContainer>
  );
}

BasicInfoTab.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  trigger: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.object,
};

export default BasicInfoTab;
