import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineRectangleStack,
  HiOutlineSignal,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

import FormField from "../../../ui/FormField";
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

const InfoCard = styled.div`
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

const PriorityCard = styled.div`
  background: ${(props) => {
    switch (props.$priority) {
      case "urgent":
        return "linear-gradient(135deg, var(--color-error-50), var(--color-error-100))";
      case "high":
        return "linear-gradient(135deg, var(--color-warning-50), var(--color-warning-100))";
      case "medium":
        return "linear-gradient(135deg, var(--color-info-50), var(--color-info-100))";
      case "low":
        return "linear-gradient(135deg, var(--color-success-50), var(--color-success-100))";
      default:
        return "linear-gradient(135deg, var(--color-grey-50), var(--color-grey-100))";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.$priority) {
        case "urgent":
          return "var(--color-error-200)";
        case "high":
          return "var(--color-warning-200)";
        case "medium":
          return "var(--color-info-200)";
        case "low":
          return "var(--color-success-200)";
        default:
          return "var(--color-grey-200)";
      }
    }};
  border-left: 4px solid
    ${(props) => {
      switch (props.$priority) {
        case "urgent":
          return "var(--color-error-500)";
        case "high":
          return "var(--color-warning-500)";
        case "medium":
          return "var(--color-info-500)";
        case "low":
          return "var(--color-success-500)";
        default:
          return "var(--color-grey-500)";
      }
    }};
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  color: ${(props) => {
    switch (props.$priority) {
      case "urgent":
        return "var(--color-error-700)";
      case "high":
        return "var(--color-warning-700)";
      case "medium":
        return "var(--color-info-700)";
      case "low":
        return "var(--color-success-700)";
      default:
        return "var(--color-grey-700)";
    }
  }};
  margin-top: var(--spacing-3);
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: ${(props) => {
    switch (props.$status) {
      case "open":
        return "var(--color-info-100)";
      case "acknowledged":
        return "var(--color-warning-100)";
      case "investigating":
        return "var(--color-brand-100)";
      case "resolved":
        return "var(--color-success-100)";
      case "closed":
        return "var(--color-grey-100)";
      default:
        return "var(--color-grey-100)";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "open":
        return "var(--color-info-700)";
      case "acknowledged":
        return "var(--color-warning-700)";
      case "investigating":
        return "var(--color-brand-700)";
      case "resolved":
        return "var(--color-success-700)";
      case "closed":
        return "var(--color-grey-700)";
      default:
        return "var(--color-grey-700)";
    }
  }};
`;

function ClassificationTab({
  control,
  errors,
  watch,
  formOptions,
  isLoading = false,
}) {
  // Watch for dynamic content
  const priority = watch("priority");
  const status = watch("status");
  const category = watch("category");
  const feedbackChannel = watch("feedbackChannel");

  // Extract options from formOptions
  const { categories = [], channels = [] } = formOptions || {};

  // Priority options with SLA information
  const priorityOptions = [
    { value: "", label: "Select priority level...", disabled: true },
    {
      value: "low",
      label: "Low Priority",
      description: "Non-urgent issue, standard processing",
      sla: "14-21 business days",
    },
    {
      value: "medium",
      label: "Medium Priority",
      description: "Standard importance, normal processing",
      sla: "7-14 business days",
    },
    {
      value: "high",
      label: "High Priority",
      description: "Important issue requiring prompt attention",
      sla: "3-7 business days",
    },
    {
      value: "urgent",
      label: "Urgent Priority",
      description: "Critical issue requiring immediate action",
      sla: "24-72 hours",
    },
  ];

  // Status options with workflow information
  const statusOptions = [
    { value: "", label: "Select status...", disabled: true },
    {
      value: "open",
      label: "Open",
      description: "Case created, awaiting acknowledgment",
    },
    {
      value: "acknowledged",
      label: "Acknowledged",
      description: "Case received and acknowledged",
    },
    {
      value: "investigating",
      label: "Under Investigation",
      description: "Case being actively investigated",
    },
    {
      value: "resolved",
      label: "Resolved",
      description: "Issue resolved, awaiting closure",
    },
    {
      value: "closed",
      label: "Closed",
      description: "Case completed and closed",
    },
  ];

  // Get selected priority details
  const selectedPriority = priorityOptions.find((p) => p.value === priority);
  const selectedStatus = statusOptions.find((s) => s.value === status);
  const selectedCategory = categories.find((c) => c.id === parseInt(category));
  const selectedChannel = channels.find(
    (c) => c.id === parseInt(feedbackChannel)
  );

  return (
    <TabContainer aria-label="Case Classification">
      {/* Category & Channel Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineRectangleStack />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Category & Channel
            </Heading>
            <Text size="sm" color="muted">
              Classify the case type and identify how it was received
            </Text>
          </SectionContent>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="category"
            control={control}
            rules={{
              required: "Please select a case category",
            }}
            render={({ field }) => (
              <FormField
                label="Case Category"
                required
                error={errors.category?.message}
                helpText="What type of issue or topic does this case address?"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.category}
                  disabled={isLoading}
                  placeholder="Select case category..."
                  options={[
                    { value: "", label: "Select category...", disabled: true },
                    ...categories.map((cat) => ({
                      value: cat.id,
                      label: cat.name,
                      description: cat.description,
                    })),
                  ]}
                  onChange={(value) => field.onChange(parseInt(value) || "")}
                />
              </FormField>
            )}
          />

          <Controller
            name="feedbackChannel"
            control={control}
            rules={{
              required: "Please select how this case was received",
            }}
            render={({ field }) => (
              <FormField
                label="Received Channel"
                required
                error={errors.feedbackChannel?.message}
                helpText="How was this case submitted or received?"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.feedbackChannel}
                  disabled={isLoading}
                  placeholder="Select feedback channel..."
                  options={[
                    { value: "", label: "Select channel...", disabled: true },
                    ...channels.map((channel) => ({
                      value: channel.id,
                      label: channel.name,
                      description: channel.description,
                    })),
                  ]}
                  onChange={(value) => field.onChange(parseInt(value) || "")}
                />
              </FormField>
            )}
          />
        </FieldGroup>

        {/* Category Information */}
        {selectedCategory && (
          <InfoCard>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
              }}
            >
              <HiOutlineInformationCircle size={20} />
              <Text size="sm" weight="semibold">
                {selectedCategory.name} Category
              </Text>
            </div>
            {selectedCategory.description && (
              <Text size="sm" style={{ marginTop: "var(--spacing-2)" }}>
                {selectedCategory.description}
              </Text>
            )}
          </InfoCard>
        )}
      </Section>

      {/* Priority & Status Section */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineSignal />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Priority & Status
            </Heading>
            <Text size="sm" color="muted">
              Set processing priority and current case status
            </Text>
          </SectionContent>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="priority"
            control={control}
            rules={{
              required: "Please select a priority level",
            }}
            render={({ field }) => (
              <FormField
                label="Priority Level"
                required
                error={errors.priority?.message}
                helpText="How urgent is this case? This affects processing timeframes."
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.priority}
                  disabled={isLoading}
                  placeholder="Select priority level..."
                  options={priorityOptions}
                />
              </FormField>
            )}
          />

          <Controller
            name="status"
            control={control}
            rules={{
              required: "Please select a case status",
            }}
            render={({ field }) => (
              <FormField
                label="Case Status"
                required
                error={errors.status?.message}
                helpText="Current status in the case processing workflow"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.status}
                  disabled={isLoading}
                  placeholder="Select case status..."
                  options={statusOptions}
                />
                {selectedStatus && (
                  <StatusBadge
                    $status={status}
                    style={{ marginTop: "var(--spacing-2)" }}
                  >
                    <Text size="sm">{selectedStatus.description}</Text>
                  </StatusBadge>
                )}
              </FormField>
            )}
          />
        </FieldGroup>

        {/* Priority Information */}
        {selectedPriority && (
          <PriorityCard $priority={priority}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
              }}
            >
              <HiOutlineExclamationTriangle size={20} />
              <Text size="sm" weight="semibold">
                {selectedPriority.label} - SLA: {selectedPriority.sla}
              </Text>
            </div>
            <Text size="sm" style={{ marginTop: "var(--spacing-2)" }}>
              {selectedPriority.description}
            </Text>

            {priority === "urgent" && (
              <Text
                size="sm"
                weight="medium"
                style={{ marginTop: "var(--spacing-2)" }}
              >
                ⚠️ Urgent cases require immediate supervisor notification and
                daily status updates.
              </Text>
            )}
          </PriorityCard>
        )}
      </Section>

      {/* Classification Summary */}
      {(category || feedbackChannel || priority || status) && (
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineInformationCircle />
            </SectionIcon>
            <SectionContent>
              <Heading as="h3" size="h4">
                Classification Summary
              </Heading>
              <Text size="sm" color="muted">
                Review the case classification and processing requirements
              </Text>
            </SectionContent>
          </SectionHeader>

          <InfoCard>
            <Column gap={3}>
              <Text size="sm" weight="semibold">
                Case Classification Overview
              </Text>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
                  gap: "var(--spacing-3)",
                }}
              >
                {selectedCategory && (
                  <div>
                    <Text size="xs" weight="medium" color="muted">
                      CATEGORY
                    </Text>
                    <Text size="sm" weight="medium">
                      {selectedCategory.name}
                    </Text>
                  </div>
                )}

                {selectedChannel && (
                  <div>
                    <Text size="xs" weight="medium" color="muted">
                      CHANNEL
                    </Text>
                    <Text size="sm" weight="medium">
                      {selectedChannel.name}
                    </Text>
                  </div>
                )}

                {selectedPriority && (
                  <div>
                    <Text size="xs" weight="medium" color="muted">
                      PRIORITY
                    </Text>
                    <Text size="sm" weight="medium">
                      {selectedPriority.label}
                    </Text>
                  </div>
                )}

                {selectedStatus && (
                  <div>
                    <Text size="xs" weight="medium" color="muted">
                      STATUS
                    </Text>
                    <Text size="sm" weight="medium">
                      {selectedStatus.label}
                    </Text>
                  </div>
                )}
              </div>

              {selectedPriority && (
                <div
                  style={{
                    paddingTop: "var(--spacing-2)",
                    borderTop: "1px solid var(--color-info-200)",
                  }}
                >
                  <Text size="xs" weight="medium" color="muted">
                    PROCESSING TIMELINE
                  </Text>
                  <Text size="sm">
                    Expected resolution timeframe:{" "}
                    <strong>{selectedPriority.sla}</strong>
                  </Text>
                </div>
              )}
            </Column>
          </InfoCard>
        </Section>
      )}
    </TabContainer>
  );
}

ClassificationTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    categories: PropTypes.array,
    channels: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
};

export default ClassificationTab;
