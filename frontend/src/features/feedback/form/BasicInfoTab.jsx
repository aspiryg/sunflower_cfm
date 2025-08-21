import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import FormField, { Input, Textarea, Select } from "../../../ui/FormField";
import Text from "../../../ui/Text";
import StyledSelect from "../../../ui/StyledSelect";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";

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

/**
 * Basic Information Tab Component
 * Handles core feedback information including title, description, category, priority, etc.
 */
function BasicInfoTab({
  control,
  errors,
  // watch,
  formOptions,
  isLoading = false,
}) {
  // Extract form options with fallbacks
  const { categories = [], channels = [] } = formOptions || {};

  // Static options that don't come from API
  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const statuses = [
    { value: "open", label: "Open" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "reviewing", label: "Reviewing" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  return (
    <TabContainer>
      {/* Core Information Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Core Information
          </Text>
          <Text size="sm" color="muted">
            Essential details about the feedback submission
          </Text>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="title"
            control={control}
            rules={{
              required: "Feedback title is required",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters long",
              },
              maxLength: {
                value: 200,
                message: "Title cannot exceed 200 characters",
              },
            }}
            render={({ field }) => (
              <FormField
                label="Feedback Title"
                required
                error={errors.title?.message}
                helpText="Brief, descriptive title for the feedback"
              >
                <Input
                  {...field}
                  placeholder="Enter feedback title..."
                  $hasError={!!errors.title}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />

          <Controller
            name="feedbackDate"
            control={control}
            rules={{
              required: "Feedback date is required",
            }}
            render={({ field }) => (
              <FormField
                label="Feedback Date"
                required
                error={errors.feedbackDate?.message}
                helpText="When the feedback was received"
              >
                <Input
                  {...field}
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  $hasError={!!errors.feedbackDate}
                  disabled={isLoading}
                />
              </FormField>
            )}
          />
        </FieldGroup>

        <Controller
          name="description"
          control={control}
          rules={{
            required: "Feedback description is required",
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters long",
            },
            maxLength: {
              value: 2000,
              message: "Description cannot exceed 2000 characters",
            },
          }}
          render={({ field }) => (
            <FormField
              label="Feedback Description"
              required
              error={errors.description?.message}
              helpText="Detailed description of the feedback"
            >
              <Textarea
                {...field}
                placeholder="Provide detailed information about the feedback..."
                $hasError={!!errors.description}
                rows={6}
                disabled={isLoading}
              />
            </FormField>
          )}
        />
      </Section>

      {/* Classification Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Classification
          </Text>
          <Text size="sm" color="muted">
            Categorize and prioritize the feedback
          </Text>
        </SectionHeader>

        <FieldGroup>
          {/* <Controller
            name="category"
            control={control}
            rules={{
              required: "Please select a feedback category",
            }}
            render={({ field }) => (
              <FormField
                label="Category"
                required
                error={errors.category?.message}
                helpText="Type of feedback being submitted"
              >
                <Select
                  {...field}
                  $hasError={!!errors.category}
                  disabled={isLoading}
                >
                  <option disabled value="">
                    Select a category...
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          /> */}
          <Controller
            name="category"
            control={control}
            rules={{
              required: "Please select a feedback category",
            }}
            render={({ field }) => (
              <FormField
                label="Category"
                required
                error={errors.category?.message}
                helpText="Type of feedback being submitted"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.category}
                  disabled={isLoading}
                  placeholder={field.value ? "" : "Select a category..."}
                  options={[
                    {
                      value: "",
                      label: "Select a category...",
                      disabled: true,
                    },
                    ...categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    })),
                  ]}
                />
              </FormField>
            )}
          />

          {/* <Controller
            name="feedbackChannel"
            control={control}
            rules={{
              required: "Please select how the feedback was received",
            }}
            render={({ field }) => (
              <FormField
                label="Feedback Channel"
                required
                error={errors.feedbackChannel?.message}
                helpText="How the feedback was received"
              >
                <Select
                  {...field}
                  $hasError={!!errors.feedbackChannel}
                  disabled={isLoading}
                >
                  <option disabled value="">
                    Select a channel...
                  </option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          /> */}
          <Controller
            name="feedbackChannel"
            control={control}
            rules={{
              required: "Please select how the feedback was received",
            }}
            render={({ field }) => (
              <FormField
                label="Feedback Channel"
                required
                error={errors.feedbackChannel?.message}
                helpText="How the feedback was received"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.feedbackChannel}
                  disabled={isLoading}
                  placeholder={field.value ? "" : "Select a channel..."}
                  options={[
                    { value: "", label: "Select a channel...", disabled: true },
                    ...channels.map((channel) => ({
                      value: channel.id,
                      label: channel.name,
                    })),
                  ]}
                />
              </FormField>
            )}
          />

          {/* <Controller
            name="priority"
            control={control}
            rules={{
              required: "Please select a priority level",
            }}
            render={({ field }) => (
              <FormField
                label="Priority"
                required
                error={errors.priority?.message}
                helpText="Urgency level of this feedback"
              >
                <Select
                  {...field}
                  $hasError={!!errors.priority}
                  disabled={isLoading}
                >
                  <option disabled value="">
                    Select priority...
                  </option>
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          /> */}
          <Controller
            name="priority"
            control={control}
            rules={{
              required: "Please select a priority level",
            }}
            render={({ field }) => (
              <FormField
                label="Priority"
                required
                error={errors.priority?.message}
                helpText="Urgency level of this feedback"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.priority}
                  options={[
                    { value: "", label: "Select priority...", disabled: true },
                    ...priorities.map((priority) => ({
                      value: priority.value,
                      label: priority.label,
                    })),
                  ]}
                />
              </FormField>
            )}
          />
          <Controller
            name="status"
            control={control}
            rules={{
              required: "Please select a status",
            }}
            render={({ field }) => (
              <FormField
                label={"status"}
                required
                error={errors.status?.message}
                helpText="Current status of the feedback"
              >
                <StyledSelect
                  {...field}
                  $hasError={!!errors.status}
                  options={[
                    { value: "", label: "Select status...", disabled: true },
                    ...statuses.map((status) => ({
                      value: status.value,
                      label: status.label,
                    })),
                  ]}
                />
              </FormField>
            )}
          />

          {/* <Controller
            name="status"
            control={control}
            rules={{
              required: "Please select a status",
            }}
            render={({ field }) => (
              <FormField
                label="Status"
                required
                error={errors.status?.message}
                helpText="Current status of the feedback"
              >
                <Select
                  {...field}
                  $hasError={!!errors.status}
                  disabled={isLoading}
                >
                  <option disabled value="">
                    Select status...
                  </option>
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          /> */}
        </FieldGroup>
      </Section>

      {/* Additional Information Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Additional Information
          </Text>
          <Text size="sm" color="muted">
            Optional details about the impact or context
          </Text>
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
              helpText="Describe the impact or effect of the issue mentioned in the feedback"
            >
              <Textarea
                {...field}
                placeholder="Describe how this feedback impacts beneficiaries or operations..."
                $hasError={!!errors.impactDescription}
                rows={4}
                disabled={isLoading}
              />
            </FormField>
          )}
        />
      </Section>
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
