import { Controller } from "react-hook-form";
import { useEffect } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import FormField, { Input, Select, Textarea } from "../../../ui/FormField";
import Text from "../../../ui/Text";
import {
  useProjectsByProgramme,
  useActivitiesByProject,
} from "../useFeedbackData";
import { useFeedbackUsers } from "../useFeedbackUsers";

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
  background-color: var(--color-brand-25);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) =>
    props.$hidden &&
    `
    opacity: 0.5;
    pointer-events: none;
  `}
`;

const PrivacyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(25rem, 1fr));
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InfoBox = styled.div`
  padding: var(--spacing-3);
  background-color: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-2);
`;

const UserHint = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-info-600);
`;

/**
 * Advanced Tab Component
 * Handles project assignments, user assignments, privacy settings, and advanced options
 */
function AdvancedTab({
  control,
  errors,
  watch,
  setValue,
  formOptions,
  isLoading = false,
}) {
  // Watch fields for conditional rendering
  const isProjectRelated = watch("isProjectRelated");
  const programmeId = watch("programmeId");
  const projectId = watch("projectId");

  // Extract programmes from form options
  const { programmes = [] } = formOptions || {};

  // Fetch hierarchical data
  const { data: projects = [], isLoading: projectsLoading } =
    useProjectsByProgramme(programmeId, {
      enabled: !!programmeId && isProjectRelated,
    });

  const { data: activities = [], isLoading: activitiesLoading } =
    useActivitiesByProject(projectId, {
      enabled: !!projectId && isProjectRelated,
    });

  // Fetch user options for assignments
  const { data: feedbackUsers = [], isLoading: feedbackUsersLoading } =
    useFeedbackUsers();
  const submitterUsers = feedbackUsers;
  const reviewerUsers = feedbackUsers;
  const assignableUsers = feedbackUsers;
  // console.log(feedbackUsers);

  // Reset dependent fields when parent selections change
  useEffect(() => {
    if (!isProjectRelated) {
      setValue("programmeId", "");
      setValue("projectId", "");
      setValue("activityId", "");
    }
  }, [isProjectRelated, setValue]);

  useEffect(() => {
    if (programmeId) {
      setValue("projectId", "");
      setValue("activityId", "");
    }
  }, [programmeId, setValue]);

  useEffect(() => {
    if (projectId) {
      setValue("activityId", "");
    }
  }, [projectId, setValue]);

  return (
    <TabContainer>
      {/* Project Assignment Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Project Assignment
          </Text>
          <Text size="sm" color="muted">
            Link this feedback to specific programmes, projects, or activities
          </Text>
        </SectionHeader>

        <Controller
          name="isProjectRelated"
          control={control}
          render={({ field }) => (
            <CheckboxField>
              <Checkbox
                {...field}
                type="checkbox"
                id="isProjectRelated"
                checked={field.value}
                disabled={isLoading}
              />
              <CheckboxLabel htmlFor="isProjectRelated">
                <strong>Link to Project</strong>
                <br />
                <Text size="sm" color="muted">
                  This feedback is related to a specific programme, project, or
                  activity
                </Text>
              </CheckboxLabel>
            </CheckboxField>
          )}
        />

        {isProjectRelated && (
          <ConditionalSection>
            <SectionHeader>
              <Text size="md" weight="semibold">
                Project Details
              </Text>
              <Text size="sm" color="muted">
                Select the programme, project, and activity (if applicable)
              </Text>
            </SectionHeader>

            <FieldGroup>
              <Controller
                name="programmeId"
                control={control}
                rules={
                  isProjectRelated
                    ? {
                        required:
                          "Please select a programme when linking to project",
                      }
                    : {}
                }
                render={({ field }) => (
                  <FormField
                    label="Programme"
                    required={isProjectRelated}
                    error={errors.programmeId?.message}
                    helpText="Select the main programme"
                  >
                    <Select
                      {...field}
                      $hasError={!!errors.programmeId}
                      disabled={isLoading}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || "")
                      }
                    >
                      <option value="">Select a programme...</option>
                      {programmes.map((programme) => (
                        <option key={programme.id} value={programme.id}>
                          {programme.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Project"
                    error={errors.projectId?.message}
                    helpText="Select a specific project (optional)"
                  >
                    <Select
                      {...field}
                      $hasError={!!errors.projectId}
                      disabled={isLoading || projectsLoading || !programmeId}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || "")
                      }
                    >
                      <option value="">
                        {!programmeId
                          ? "Select programme first..."
                          : "Select a project..."}
                      </option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                )}
              />

              <Controller
                name="activityId"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Activity"
                    error={errors.activityId?.message}
                    helpText="Select a specific activity (optional)"
                  >
                    <Select
                      {...field}
                      $hasError={!!errors.activityId}
                      disabled={isLoading || activitiesLoading || !projectId}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || "")
                      }
                    >
                      <option value="">
                        {!projectId
                          ? "Select project first..."
                          : "Select an activity..."}
                      </option>
                      {activities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                )}
              />
            </FieldGroup>
          </ConditionalSection>
        )}
      </Section>

      {/* User Assignments Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            User Assignments
          </Text>
          <Text size="sm" color="muted">
            Assign responsibility and track who submitted or will handle this
            feedback
          </Text>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="submittedBy"
            control={control}
            render={({ field }) => (
              <FormField
                label="Submitted By"
                error={errors.submittedBy?.message}
                helpText="Staff member who entered this feedback (optional)"
              >
                <Select
                  {...field}
                  $hasError={!!errors.submittedBy}
                  disabled={isLoading || feedbackUsersLoading}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                >
                  <option value="">Select submitter...</option>
                  {submitterUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName ? user.fullName : user.username} -
                      {user.role}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          />

          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <FormField
                label="Assigned To"
                error={errors.assignedTo?.message}
                helpText="Staff member responsible for responding (optional)"
              >
                <Select
                  {...field}
                  $hasError={!!errors.assignedTo}
                  disabled={isLoading || feedbackUsersLoading}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                >
                  <option value="">Select assignee...</option>
                  {assignableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName ? user.fullName : user.username} -
                      {user.role}
                    </option>
                  ))}
                </Select>
                {assignableUsers.find((user) => user.id === field.value)
                  ?.email ? (
                  <UserHint>
                    {
                      assignableUsers.find((user) => user.id === field.value)
                        .email
                    }
                  </UserHint>
                ) : null}
              </FormField>
            )}
          />

          <Controller
            name="assignedBy"
            control={control}
            render={({ field }) => (
              <FormField
                label="Assigned By"
                error={errors.assignedBy?.message}
                helpText="Who made the assignment (optional)"
              >
                <Select
                  {...field}
                  $hasError={!!errors.assignedBy}
                  disabled={isLoading || feedbackUsersLoading}
                  onChange={(e) => field.onChange(Number(e.target.value) || "")}
                >
                  <option value="">Select assigner...</option>
                  {reviewerUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName ? user.fullName : user.username} -
                      {user.role}
                    </option>
                  ))}
                </Select>
              </FormField>
            )}
          />
        </FieldGroup>
      </Section>

      {/* Privacy & Security Section */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Privacy & Security Settings
          </Text>
          <Text size="sm" color="muted">
            Control how this feedback is handled and shared
          </Text>
        </SectionHeader>

        <PrivacyGrid>
          <Controller
            name="isSensitive"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <Checkbox
                  {...field}
                  type="checkbox"
                  id="isSensitive"
                  checked={field.value}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="isSensitive">
                  <strong>Sensitive Content</strong>
                  <br />
                  <Text size="sm" color="muted">
                    Contains sensitive information requiring special handling
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />

          <Controller
            name="isAnonymized"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <Checkbox
                  {...field}
                  type="checkbox"
                  id="isAnonymized"
                  checked={field.value}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="isAnonymized">
                  <strong>Anonymized</strong>
                  <br />
                  <Text size="sm" color="muted">
                    Remove or hide provider identity in reports
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />

          <Controller
            name="isPublic"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <Checkbox
                  {...field}
                  type="checkbox"
                  id="isPublic"
                  checked={field.value}
                  disabled={isLoading}
                />
                <CheckboxLabel htmlFor="isPublic">
                  <strong>Public Feedback</strong>
                  <br />
                  <Text size="sm" color="muted">
                    Can be included in public reports and communications
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />
        </PrivacyGrid>

        {watch("isSensitive") && (
          <InfoBox>
            <Text size="sm" weight="medium" color="warning">
              ⚠️ Sensitive Content Notice
            </Text>
            <Text
              size="xs"
              color="muted"
              style={{ marginTop: "var(--spacing-1)" }}
            >
              This feedback has been marked as sensitive. Access will be
              restricted to authorized personnel only, and special care should
              be taken when sharing or reporting on this information.
            </Text>
          </InfoBox>
        )}
      </Section>

      {/* Tags and Additional Information */}
      <Section>
        <SectionHeader>
          <Text size="lg" weight="semibold">
            Additional Information
          </Text>
          <Text size="sm" color="muted">
            Tags and other metadata for organizing and searching feedback
          </Text>
        </SectionHeader>

        <Controller
          name="tags"
          control={control}
          rules={{
            maxLength: {
              value: 500,
              message: "Tags cannot exceed 500 characters",
            },
          }}
          render={({ field }) => (
            <FormField
              label="Tags"
              error={errors.tags?.message}
              helpText="Comma-separated tags for categorizing and searching (e.g., urgent, complaint, suggestion)"
            >
              <Textarea
                {...field}
                placeholder="e.g., urgent, water-access, complaint, health-services..."
                $hasError={!!errors.tags}
                rows={3}
                disabled={isLoading}
              />
            </FormField>
          )}
        />

        <InfoBox>
          <Text size="sm" weight="medium" color="primary">
            💡 Tagging Tips
          </Text>
          <Text
            size="xs"
            color="muted"
            style={{ marginTop: "var(--spacing-1)" }}
          >
            Use descriptive tags to make feedback easier to find and analyze.
            Consider using tags for:
            <br />• Urgency level (urgent, high-priority)
            <br />• Service type (health, education, water, sanitation)
            <br />• Feedback type (complaint, suggestion, compliment)
            <br />• Themes (accessibility, quality, staff-behavior)
          </Text>
        </InfoBox>
      </Section>
    </TabContainer>
  );
}

AdvancedTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    programmes: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
};

export default AdvancedTab;
