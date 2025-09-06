// Create this file: /frontend/src/features/cases/form/ClassificationTab.jsx
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineRectangleStack,
  HiOutlineExclamationTriangle,
  HiOutlineClock,
  HiOutlineInformationCircle,
  HiOutlineSpeakerWave,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineSparkles,
  HiOutlineLightBulb,
} from "react-icons/hi2";

import FormField from "../../../ui/FormField";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Row from "../../../ui/Row";
import Column from "../../../ui/Column";
import InfoCard from "../../../ui/InfoCard";
import Badge from "../../../ui/Badge";

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

const PriorityPreview = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-top: var(--spacing-3);
`;

const PriorityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const TimelineInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--spacing-3);
  margin-top: var(--spacing-3);
`;

const TimelineItem = styled.div`
  background: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  text-align: center;
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

const CategoryPreview = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
`;

const ChannelIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
`;

/**
 * ClassificationTab Component
 *
 * Handles case classification including category, priority, status, and channel
 * with smart suggestions, visual previews, and timeline information
 */
function ClassificationTab({
  control,
  watch,
  setValue,
  errors,
  trigger,
  // isEditing,
  isLoading,
  formOptions = {},
}) {
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [priorityTimeline, setPriorityTimeline] = useState(null);

  // console.log("Errors:", errors);

  // Get form options
  const {
    categories = [],
    statuses = [],
    priorities = [],
    channels = [],
  } = formOptions;

  // Watch form values for smart suggestions
  const watchedValues = watch([
    "categoryId",
    "priorityId",
    "statusId",
    "channelId",
    "title",
    "description",
    "affectedBeneficiaries",
  ]);

  const [
    categoryId,
    priorityId,
    statusId,
    channelId,
    title,
    description,
    affectedBeneficiaries,
  ] = watchedValues;

  // Get selected option details
  const selectedCategory = categories.find((cat) => cat.value === categoryId);
  const selectedPriority = priorities.find((pri) => pri.value === priorityId);
  const selectedStatus = statuses.find((stat) => stat.value === statusId);
  const selectedChannel = channels.find((chan) => chan.value === channelId);

  // Smart category suggestions based on title and description
  useEffect(() => {
    const suggestions = [];

    if (title || description) {
      const content = `${title} ${description}`.toLowerCase();

      // Service Quality keywords
      if (
        content.includes("quality") ||
        content.includes("poor") ||
        content.includes("bad") ||
        content.includes("unsatisfied") ||
        content.includes("disappointed")
      ) {
        suggestions.push({
          type: "category",
          category: "Service Quality",
          reason: "Content suggests service quality issues",
          confidence: "high",
        });
      }

      // Access & Availability keywords
      if (
        content.includes("access") ||
        content.includes("closed") ||
        content.includes("unavailable") ||
        content.includes("delayed") ||
        content.includes("wait")
      ) {
        suggestions.push({
          type: "category",
          category: "Access & Availability",
          reason: "Content suggests access or availability issues",
          confidence: "high",
        });
      }

      // Staff Conduct keywords
      if (
        content.includes("staff") ||
        content.includes("rude") ||
        content.includes("unprofessional") ||
        content.includes("behavior") ||
        content.includes("attitude")
      ) {
        suggestions.push({
          type: "category",
          category: "Staff Conduct",
          reason: "Content mentions staff behavior issues",
          confidence: "medium",
        });
      }

      // Safety & Security keywords
      if (
        content.includes("safety") ||
        content.includes("security") ||
        content.includes("danger") ||
        content.includes("unsafe") ||
        content.includes("threat")
      ) {
        suggestions.push({
          type: "category",
          category: "Safety & Security",
          reason: "Content suggests safety or security concerns",
          confidence: "high",
        });
      }

      // Positive Feedback keywords
      if (
        content.includes("good") ||
        content.includes("excellent") ||
        content.includes("satisfied") ||
        content.includes("thank") ||
        content.includes("appreciate")
      ) {
        suggestions.push({
          type: "category",
          category: "Positive Feedback",
          reason: "Content suggests positive feedback",
          confidence: "medium",
        });
      }

      // Suggestion keywords
      if (
        content.includes("suggest") ||
        content.includes("recommend") ||
        content.includes("improve") ||
        content.includes("better") ||
        content.includes("idea")
      ) {
        suggestions.push({
          type: "category",
          category: "Suggestion",
          reason: "Content contains suggestions for improvement",
          confidence: "high",
        });
      }
    }

    // Priority suggestions based on affected beneficiaries
    if (affectedBeneficiaries) {
      const count = Number(affectedBeneficiaries);
      if (count > 100) {
        suggestions.push({
          type: "priority",
          priority: "Critical",
          reason: `High impact: ${count} beneficiaries affected`,
          confidence: "high",
        });
      } else if (count > 50) {
        suggestions.push({
          type: "priority",
          priority: "High",
          reason: `Significant impact: ${count} beneficiaries affected`,
          confidence: "medium",
        });
      } else if (count > 10) {
        suggestions.push({
          type: "priority",
          priority: "Medium",
          reason: `Moderate impact: ${count} beneficiaries affected`,
          confidence: "medium",
        });
      }
    }

    // Urgency suggestions based on keywords
    if (title || description) {
      const content = `${title} ${description}`.toLowerCase();
      if (
        content.includes("urgent") ||
        content.includes("emergency") ||
        content.includes("critical") ||
        content.includes("immediate")
      ) {
        suggestions.push({
          type: "priority",
          priority: "Critical",
          reason: "Content indicates urgency",
          confidence: "high",
        });
      }
    }

    setSmartSuggestions(suggestions);
  }, [title, description, affectedBeneficiaries]);

  // Update priority timeline when priority changes
  useEffect(() => {
    if (selectedPriority) {
      const timeline = {
        response: selectedPriority.responseTimeHours || 24,
        resolution: selectedPriority.resolutionTimeHours || 168,
        escalation: selectedPriority.escalationTimeHours || 72,
      };
      setPriorityTimeline(timeline);
    } else {
      setPriorityTimeline(null);
    }
  }, [selectedPriority]);

  // Auto-apply smart suggestions
  const applySuggestion = (suggestion) => {
    if (suggestion.type === "category") {
      const categoryOption = categories.find(
        (cat) => cat.label === suggestion.category
      );
      if (categoryOption) {
        setValue("categoryId", categoryOption.value);
        trigger("categoryId");
      }
    } else if (suggestion.type === "priority") {
      const priorityOption = priorities.find(
        (pri) => pri.label === suggestion.priority
      );
      if (priorityOption) {
        setValue("priorityId", priorityOption.value);
        trigger("priorityId");
      }
    }
  };

  // Format time duration
  const formatDuration = (hours) => {
    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""}`;
  };

  // Default form options if not provided
  const categoryOptions = categories.length
    ? [
        { value: "", label: "Select category..." },
        ...categories.sort((a, b) => a.value - b.value),
      ]
    : [{ value: "loading", label: "Loading categories...", disabled: true }];

  const priorityOptions = priorities.length
    ? [
        { value: "", label: "Select priority..." },
        ...priorities.sort((a, b) => a.value - b.value),
      ]
    : [{ value: "loading", label: "Loading priorities...", disabled: true }];

  const statusOptions = statuses.length
    ? [
        { value: "", label: "Select status..." },
        ...statuses.sort((a, b) => a.value - b.value),
      ]
    : [{ value: "loading", label: "Loading statuses...", disabled: true }];

  const channelOptions = channels.length
    ? [
        { value: "", label: "Select channel..." },
        ...channels.sort((a, b) => a.value - b.value),
      ]
    : [{ value: "loading", label: "Loading channels...", disabled: true }];

  return (
    <TabContainer>
      <TabHeader>
        <Text size="lg" weight="semibold" color="grey-800">
          Case Classification
        </Text>
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
          Categorize and prioritize the case for proper routing and processing
        </Text>
      </TabHeader>

      <SectionGrid>
        {/* Main Content Section */}
        <MainSection>
          {/* Primary Classification Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineRectangleStack />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Primary Classification
                </Text>
                <Text size="xs" color="muted">
                  Essential categorization for case routing
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="two-columns">
              {/* Category Selection */}
              <FormField
                label="Category"
                error={errors.categoryId?.message}
                required
                helpText={
                  !selectedCategory && !errors.categoryId?.message
                    ? "What type of case is this?"
                    : null
                }
              >
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{
                    required: "Please select a category",
                  }}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={categoryOptions}
                        placeholder="Select category..."
                        disabled={isLoading}
                        $hasError={!!errors.categoryId?.message}
                        size="medium"
                      />
                      {selectedCategory && (
                        <CategoryPreview>
                          <Text size="xs" color="muted">
                            {selectedCategory.description}
                          </Text>
                        </CategoryPreview>
                      )}
                    </>
                  )}
                />
              </FormField>

              {/* Priority Selection */}
              <FormField
                label="Priority"
                error={errors.priorityId?.message}
                required
                helpText={
                  !selectedPriority && !errors.priorityId?.message
                    ? "How urgent is this case?"
                    : null
                }
              >
                <Controller
                  name="priorityId"
                  control={control}
                  rules={{
                    required: "Please select a priority level",
                  }}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={priorityOptions}
                        placeholder="Select priority..."
                        disabled={isLoading}
                        $hasError={!!errors.priorityId?.message}
                        size="medium"
                      />
                      {selectedPriority && (
                        <PriorityPreview>
                          <PriorityInfo>
                            <Row align="center" justify="space-between">
                              <Text size="sm" weight="semibold">
                                {selectedPriority.label} Priority
                              </Text>
                              <Badge
                                variant={
                                  selectedPriority.label === "Critical"
                                    ? "error"
                                    : selectedPriority.label === "High"
                                    ? "warning"
                                    : selectedPriority.label === "Medium"
                                    ? "info"
                                    : "success"
                                }
                                size="sm"
                              >
                                Level {selectedPriority.level}
                              </Badge>
                            </Row>
                            <Text size="xs" color="muted">
                              {selectedPriority.description}
                            </Text>
                          </PriorityInfo>

                          {priorityTimeline && (
                            <TimelineInfo>
                              <TimelineItem>
                                <Text size="xs" color="muted">
                                  Response Time
                                </Text>
                                <Text size="sm" weight="semibold">
                                  {formatDuration(priorityTimeline.response)}
                                </Text>
                              </TimelineItem>
                              <TimelineItem>
                                <Text size="xs" color="muted">
                                  Resolution Time
                                </Text>
                                <Text size="sm" weight="semibold">
                                  {formatDuration(priorityTimeline.resolution)}
                                </Text>
                              </TimelineItem>
                              <TimelineItem>
                                <Text size="xs" color="muted">
                                  Escalation Time
                                </Text>
                                <Text size="sm" weight="semibold">
                                  {formatDuration(priorityTimeline.escalation)}
                                </Text>
                              </TimelineItem>
                            </TimelineInfo>
                          )}
                        </PriorityPreview>
                      )}
                    </>
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>

          {/* Processing Settings Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineAdjustmentsHorizontal />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Processing Settings
                </Text>
                <Text size="xs" color="muted">
                  Status and channel configuration
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="two-columns">
              {/* Status Selection */}
              <FormField
                label="Status"
                error={errors.statusId?.message}
                required
                helpText={
                  !selectedStatus && !errors.statusId?.message
                    ? "Current processing status"
                    : null
                }
              >
                <Controller
                  name="statusId"
                  control={control}
                  rules={{
                    required: "Please select a status",
                  }}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={statusOptions}
                        placeholder="Select status..."
                        disabled={isLoading ? "disabled" : null}
                        $hasError={!!errors.statusId?.message}
                        size="medium"
                      />
                      {selectedStatus && (
                        <StatusIndicator>
                          <Badge
                            variant={
                              selectedStatus.isFinal ? "success" : "info"
                            }
                            size="sm"
                          >
                            {selectedStatus.isFinal ? "Final" : "Active"}
                          </Badge>
                          <Text size="xs" color="muted">
                            {selectedStatus.description}
                          </Text>
                        </StatusIndicator>
                      )}
                    </>
                  )}
                />
              </FormField>

              {/* Channel Selection */}
              <FormField
                label="Channel"
                error={errors.channelId?.message}
                required
                helpText={
                  !selectedChannel && !errors.channelId?.message
                    ? "How was this case received?"
                    : null
                }
              >
                <Controller
                  name="channelId"
                  control={control}
                  rules={{
                    required: "Please select a channel",
                  }}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={channelOptions}
                        placeholder="Select channel..."
                        disabled={isLoading}
                        $hasError={!!errors.channelId?.message}
                        size="medium"
                      />
                      {selectedChannel && (
                        <ChannelIndicator>
                          <HiOutlineSpeakerWave
                            style={{
                              color: "var(--color-grey-500)",
                              width: "1.4rem",
                              height: "1.4rem",
                            }}
                          />
                          <Text size="xs" color="muted">
                            {selectedChannel.description}
                          </Text>
                        </ChannelIndicator>
                      )}
                    </>
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>
        </MainSection>

        {/* Side Section - Smart Suggestions and Help */}
        <SideSection>
          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <InfoCard
              icon={HiOutlineSparkles}
              title="Smart Suggestions"
              variant="info"
            >
              <Column gap={2}>
                <Text size="sm">Based on your case content, we suggest:</Text>
                {smartSuggestions.map((suggestion, index) => (
                  <SmartSuggestion key={index}>
                    <HiOutlineLightBulb
                      style={{
                        color: "var(--color-blue-600)",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <Column gap={1}>
                      <Row align="center" justify="space-between">
                        <Text size="xs" weight="semibold">
                          {suggestion.type === "category"
                            ? "Category"
                            : "Priority"}
                          : {suggestion.category || suggestion.priority}
                        </Text>
                        <Badge
                          variant={
                            suggestion.confidence === "high"
                              ? "success"
                              : "warning"
                          }
                          size="sm"
                        >
                          {suggestion.confidence}
                        </Badge>
                      </Row>
                      <Text size="xs" color="muted">
                        {suggestion.reason}
                      </Text>
                      <button
                        type="button"
                        onClick={() => applySuggestion(suggestion)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-blue-600)",
                          fontSize: "var(--font-size-xs)",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          textAlign: "left",
                        }}
                      >
                        Apply suggestion
                      </button>
                    </Column>
                  </SmartSuggestion>
                ))}
              </Column>
            </InfoCard>
          )}

          {/* Classification Guidelines */}
          <InfoCard
            icon={HiOutlineInformationCircle}
            title="Classification Guidelines"
            variant="info"
          >
            <Column gap={3}>
              <Text size="sm">
                <strong>Categories:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    <strong>Service Quality:</strong> Issues with service
                    delivery
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Access & Availability:</strong> Problems accessing
                    services
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Staff Conduct:</strong> Behavioral or professional
                    issues
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Safety & Security:</strong> Safety concerns or
                    threats
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Positive Feedback:</strong> Compliments and praise
                  </Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Priority Levels:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    <strong>Critical:</strong> Immediate threat or major impact
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>High:</strong> Significant impact, quick resolution
                    needed
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Medium:</strong> Moderate impact, standard timeline
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Low:</strong> Minor impact, can be addressed when
                    convenient
                  </Text>
                </li>
              </ul>
            </Column>
          </InfoCard>

          {/* Timeline Information */}
          {priorityTimeline && (
            <InfoCard
              icon={HiOutlineClock}
              title="Processing Timeline"
              variant="warning"
            >
              <Column gap={2}>
                <Text size="sm">
                  Based on <strong>{selectedPriority?.label}</strong> priority:
                </Text>
                <Row align="center" justify="space-between">
                  <Text size="xs" color="muted">
                    First Response:
                  </Text>
                  <Text size="xs" weight="semibold">
                    {formatDuration(priorityTimeline.response)}
                  </Text>
                </Row>
                <Row align="center" justify="space-between">
                  <Text size="xs" color="muted">
                    Target Resolution:
                  </Text>
                  <Text size="xs" weight="semibold">
                    {formatDuration(priorityTimeline.resolution)}
                  </Text>
                </Row>
                <Row align="center" justify="space-between">
                  <Text size="xs" color="muted">
                    Escalation Trigger:
                  </Text>
                  <Text size="xs" weight="semibold">
                    {formatDuration(priorityTimeline.escalation)}
                  </Text>
                </Row>
              </Column>
            </InfoCard>
          )}

          {/* High Priority Warning */}
          {selectedPriority?.label === "Critical" && (
            <InfoCard
              icon={HiOutlineExclamationTriangle}
              title="Critical Priority Alert"
              variant="error"
            >
              <Text size="sm">
                This case is marked as <strong>Critical</strong> priority.
                Consider:
              </Text>
              <ul
                style={{
                  margin: "var(--spacing-2) 0 0",
                  paddingLeft: "var(--spacing-4)",
                }}
              >
                <li>
                  <Text size="xs">Immediate assignment to senior staff</Text>
                </li>
                <li>
                  <Text size="xs">Notification to management</Text>
                </li>
                <li>
                  <Text size="xs">Real-time monitoring and updates</Text>
                </li>
                <li>
                  <Text size="xs">Stakeholder communication plan</Text>
                </li>
              </ul>
            </InfoCard>
          )}
        </SideSection>
      </SectionGrid>
    </TabContainer>
  );
}

ClassificationTab.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  trigger: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.object,
};

export default ClassificationTab;
