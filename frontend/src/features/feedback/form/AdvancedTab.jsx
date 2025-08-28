import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCog6Tooth,
  HiOutlineUserGroup,
  HiOutlineRectangleStack,
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineTag,
  HiOutlineBriefcase,
} from "react-icons/hi2";

import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
import StyledSelect from "../../../ui/StyledSelect";
import UserSelect from "../../../ui/UserSelect";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Column from "../../../ui/Column";
// import Row from "../../../ui/Row";

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

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-0);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-25);
    border-color: var(--color-grey-300);
  }

  &:has(input:checked) {
    background-color: var(--color-brand-25);
    border-color: var(--color-brand-200);
  }
`;

const CheckboxLabel = styled.div`
  flex: 1;
  line-height: 1.5;
`;

const InfoCard = styled.div`
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

const WarningCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  background: linear-gradient(
    135deg,
    var(--color-warning-25),
    var(--color-warning-50)
  );
  border: 1px solid var(--color-warning-200);
  border-left: 4px solid var(--color-warning-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  color: var(--color-warning-700);
`;

const PrivacyLevelIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-top: var(--spacing-2);

  ${(props) => {
    if (props.$level === "public") {
      return `
        background: linear-gradient(135deg, var(--color-success-50), var(--color-success-100));
        color: var(--color-success-700);
        border: 1px solid var(--color-success-200);
      `;
    }
    if (props.$level === "sensitive") {
      return `
        background: linear-gradient(135deg, var(--color-warning-50), var(--color-warning-100));
        color: var(--color-warning-700);
        border: 1px solid var(--color-warning-200);
      `;
    }
    if (props.$level === "confidential") {
      return `
        background: linear-gradient(135deg, var(--color-error-50), var(--color-error-100));
        color: var(--color-error-700);
        border: 1px solid var(--color-error-200);
      `;
    }
    return `
      background: var(--color-grey-100);
      color: var(--color-grey-600);
      border: 1px solid var(--color-grey-200);
    `;
  }}
`;

const TagsPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: linear-gradient(
    135deg,
    var(--color-brand-50),
    var(--color-brand-25)
  );
  color: var(--color-brand-700);
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

/**
 * Enhanced Advanced Settings Tab Component
 * Handles project relations, assignments, privacy settings, and metadata
 */
function AdvancedTab({
  control,
  errors,
  watch,
  formOptions,
  isLoading = false,
  isEditing = false,
}) {
  // Extract form options
  const {
    programmes = [],
    projects = [],
    activities = [],
    users = [],
  } = formOptions || {};

  // console.log("Users in AdvancedTab:", users);

  // Watch for conditional fields and privacy calculations
  const isProjectRelated = watch("isProjectRelated");
  const programmeId = watch("programmeId");
  const projectId = watch("projectId");
  const isSensitive = watch("isSensitive");
  // const isAnonymized = watch("isAnonymized");
  const isPublic = watch("isPublic");
  const tags = watch("tags");
  const assignedTo = watch("assignedTo");
  // const submittedBy = watch("submittedBy");

  // Filter projects based on selected programme
  const filteredProjects = programmeId
    ? projects.filter(
        (project) => project.programmeId === parseInt(programmeId)
      )
    : projects;

  // Filter activities based on selected project
  const filteredActivities = projectId
    ? activities.filter(
        (activity) => activity.projectId === parseInt(projectId)
      )
    : activities;

  // Parse tags for preview
  const parsedTags = tags
    ? tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  // Calculate privacy level
  const getPrivacyLevel = () => {
    if (isSensitive) return "confidential";
    if (!isPublic) return "sensitive";
    return "public";
  };

  const privacyLevel = getPrivacyLevel();

  return (
    <TabContainer aria-label="Advanced Case Settings">
      {/* Important Notice */}
      <InfoCard>
        <HiOutlineInformationCircle
          size={20}
          style={{ marginTop: "2px", flexShrink: 0 }}
        />
        <Column gap={1}>
          <Text size="sm" weight="semibold">
            Advanced Configuration
          </Text>
          <Text size="sm">
            These settings control case assignment, project relationships,
            privacy handling, and workflow automation. Changes to privacy
            settings may affect case visibility and access permissions.
          </Text>
        </Column>
      </InfoCard>

      {/* Case Assignment & Workflow */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineUserGroup />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Case Assignment & Workflow
            </Heading>
            <Text size="sm" color="muted">
              Assign case ownership and configure processing workflow
            </Text>
          </SectionContent>
        </SectionHeader>

        <FieldGroup>
          <Controller
            name="submittedBy"
            control={control}
            render={({ field }) => (
              <FormField
                label="Data Entry Officer"
                error={errors.submittedBy?.message}
                helpText="Staff member who entered this case into the system"
              >
                <UserSelect
                  {...field}
                  users={users}
                  placeholder="Select data entry officer..."
                  $hasError={!!errors.submittedBy}
                  disabled={isLoading}
                  onChange={(userId) => field.onChange(userId)}
                />
              </FormField>
            )}
          />

          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <FormField
                label="Assigned Case Officer"
                error={errors.assignedTo?.message}
                helpText="Staff member responsible for processing and resolving this case"
              >
                <UserSelect
                  {...field}
                  users={users}
                  placeholder="Select case officer..."
                  $hasError={!!errors.assignedTo}
                  disabled={isLoading}
                  onChange={(userId) => field.onChange(userId)}
                />
              </FormField>
            )}
          />
        </FieldGroup>

        {/* Assignment Notifications */}
        {assignedTo && (
          <InfoCard>
            <HiOutlineUserGroup
              size={20}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Column gap={1}>
              <Text size="sm" weight="semibold">
                Assignment Notification
              </Text>
              <Text size="sm">
                The assigned case officer will receive an email notification
                with case details and will be able to track progress, add
                comments, and update the case status. Assignment triggers SLA
                timers for response requirements.
              </Text>
            </Column>
          </InfoCard>
        )}
      </Section>

      {/* Project & Programme Relations */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineBriefcase />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Project & Programme Relations
            </Heading>
            <Text size="sm" color="muted">
              Link this case to specific programmes, projects, or activities
            </Text>
          </SectionContent>
        </SectionHeader>

        <Controller
          name="isProjectRelated"
          control={control}
          render={({ field }) => (
            <CheckboxField>
              <EnhancedCheckbox
                id="isProjectRelated"
                checked={field.value || false}
                onChange={(checked) => field.onChange(checked)}
                disabled={isLoading}
              />
              <CheckboxLabel>
                <Text weight="medium" size="sm">
                  Project Related Case
                </Text>
                <Text
                  size="sm"
                  color="muted"
                  style={{ marginTop: "var(--spacing-1)" }}
                >
                  This case is related to a specific programme or project
                </Text>
              </CheckboxLabel>
            </CheckboxField>
          )}
        />

        {isProjectRelated && (
          <Column gap={5}>
            <FieldGroup>
              <Controller
                name="programmeId"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Programme"
                    error={errors.programmeId?.message}
                    helpText="Select the main programme this case relates to"
                  >
                    <StyledSelect
                      {...field}
                      $hasError={!!errors.programmeId}
                      disabled={isLoading}
                      placeholder="Select a programme..."
                      options={[
                        {
                          value: "",
                          label: "Select programme...",
                          disabled: true,
                        },
                        ...programmes.map((programme) => ({
                          value: programme.id,
                          label: programme.name,
                          description: programme.description,
                        })),
                      ]}
                      onChange={(value) => {
                        field.onChange(parseInt(value) || "");
                        // Reset dependent fields when programme changes
                        if (control._formValues.projectId) {
                          control._formValues.projectId = "";
                        }
                        if (control._formValues.activityId) {
                          control._formValues.activityId = "";
                        }
                      }}
                    />
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
                    helpText="Select the specific project within the programme"
                  >
                    <StyledSelect
                      {...field}
                      $hasError={!!errors.projectId}
                      disabled={isLoading || !programmeId}
                      placeholder={
                        programmeId
                          ? "Select a project..."
                          : "Select programme first"
                      }
                      options={[
                        {
                          value: "",
                          label: "Select project...",
                          disabled: true,
                        },
                        ...filteredProjects.map((project) => ({
                          value: project.id,
                          label: project.name,
                          description: project.description,
                        })),
                      ]}
                      onChange={(value) => {
                        field.onChange(parseInt(value) || "");
                        // Reset activity when project changes
                        if (control._formValues.activityId) {
                          control._formValues.activityId = "";
                        }
                      }}
                    />
                  </FormField>
                )}
              />
            </FieldGroup>

            <Controller
              name="activityId"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Activity"
                  error={errors.activityId?.message}
                  helpText="Select the specific activity or component (optional)"
                >
                  <StyledSelect
                    {...field}
                    $hasError={!!errors.activityId}
                    disabled={isLoading || !projectId}
                    placeholder={
                      projectId
                        ? "Select an activity..."
                        : "Select project first"
                    }
                    options={[
                      {
                        value: "",
                        label: "Select activity...",
                        disabled: true,
                      },
                      ...filteredActivities.map((activity) => ({
                        value: activity.id,
                        label: activity.name,
                        description: activity.description,
                      })),
                    ]}
                    onChange={(value) => field.onChange(parseInt(value) || "")}
                  />
                </FormField>
              )}
            />
          </Column>
        )}
      </Section>

      {/* Privacy & Security Settings */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineShieldCheck />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Privacy & Security Settings
            </Heading>
            <Text size="sm" color="muted">
              Control case visibility, data handling, and privacy protections
            </Text>
          </SectionContent>
        </SectionHeader>

        <CheckboxGroup>
          <Controller
            name="isSensitive"
            control={control}
            render={({ field }) => (
              <CheckboxField>
                <EnhancedCheckbox
                  id="isSensitive"
                  checked={field.value || false}
                  onChange={(checked) => field.onChange(checked)}
                  disabled={isLoading}
                />
                <CheckboxLabel>
                  <Text weight="medium" size="sm">
                    🔒 Sensitive Case
                  </Text>
                  <Text
                    size="sm"
                    color="muted"
                    style={{ marginTop: "var(--spacing-1)" }}
                  >
                    Contains sensitive information requiring restricted access
                    and special handling
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
                <EnhancedCheckbox
                  id="isAnonymized"
                  checked={field.value || false}
                  onChange={(checked) => field.onChange(checked)}
                  disabled={isLoading}
                />
                <CheckboxLabel>
                  <Text weight="medium" size="sm">
                    🎭 Anonymized Case
                  </Text>
                  <Text
                    size="sm"
                    color="muted"
                    style={{ marginTop: "var(--spacing-1)" }}
                  >
                    Personal identifiers have been removed or masked to protect
                    privacy
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
                <EnhancedCheckbox
                  id="isPublic"
                  checked={field.value || false}
                  onChange={(checked) => field.onChange(checked)}
                  disabled={isLoading || isSensitive}
                />
                <CheckboxLabel>
                  <Text weight="medium" size="sm">
                    {isPublic ? "👁️" : "👁️‍🗨️"} Public Case
                  </Text>
                  <Text
                    size="sm"
                    color="muted"
                    style={{ marginTop: "var(--spacing-1)" }}
                  >
                    Case details may be shared in public reports and
                    transparency initiatives
                    {isSensitive && " (Disabled for sensitive cases)"}
                  </Text>
                </CheckboxLabel>
              </CheckboxField>
            )}
          />
        </CheckboxGroup>

        {/* Privacy Level Indicator */}
        <PrivacyLevelIndicator $level={privacyLevel}>
          <HiOutlineShieldCheck />
          <Text size="sm" weight="medium">
            Privacy Level: {privacyLevel.toUpperCase()}
          </Text>
        </PrivacyLevelIndicator>

        {/* Privacy Warning for Sensitive Cases */}
        {isSensitive && (
          <WarningCard>
            <HiOutlineShieldCheck
              size={20}
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Column gap={1}>
              <Text size="sm" weight="semibold">
                Sensitive Case Handling
              </Text>
              <Text size="sm">
                This case is marked as sensitive and will have restricted
                access. Only authorized personnel with appropriate clearance
                levels will be able to view full case details. Consider
                additional security measures for data storage and communication.
              </Text>
            </Column>
          </WarningCard>
        )}
      </Section>

      {/* Case Metadata & Tags */}
      <Section>
        <SectionHeader>
          <SectionIcon>
            <HiOutlineTag />
          </SectionIcon>
          <SectionContent>
            <Heading as="h3" size="h4">
              Case Metadata & Tags
            </Heading>
            <Text size="sm" color="muted">
              Additional categorization and searchable keywords
            </Text>
          </SectionContent>
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
              helpText="Add searchable tags separated by commas (e.g., water, sanitation, health, emergency)"
            >
              <Input
                {...field}
                placeholder="water, health, emergency, infrastructure, education..."
                variant={errors.tags ? "error" : "default"}
                disabled={isLoading}
                maxLength={500}
                leftIcon={<HiOutlineTag />}
              />
              <Text
                size="xs"
                color="muted"
                style={{ marginTop: "var(--spacing-1)" }}
              >
                {field.value?.length || 0}/500 characters • {parsedTags.length}{" "}
                tags
              </Text>
            </FormField>
          )}
        />

        {/* Tags Preview */}
        {parsedTags.length > 0 && (
          <Column gap={2}>
            <Text size="sm" weight="medium">
              Tag Preview:
            </Text>
            <TagsPreview>
              {parsedTags.map((tag, index) => (
                <Tag key={index}>
                  <HiOutlineTag />
                  {tag}
                </Tag>
              ))}
            </TagsPreview>
          </Column>
        )}

        {/* Tags Guidelines */}
        <InfoCard>
          <HiOutlineInformationCircle
            size={20}
            style={{ marginTop: "2px", flexShrink: 0 }}
          />
          <Column gap={1}>
            <Text size="sm" weight="semibold">
              Effective Tagging Guidelines
            </Text>
            <Text size="sm">
              <strong>Sector Tags:</strong> health, education, water,
              sanitation, shelter, protection
              <br />
              <strong>Priority Tags:</strong> emergency, urgent, routine,
              follow-up
              <br />
              <strong>Type Tags:</strong> service-complaint, policy-suggestion,
              infrastructure, accessibility
              <br />
              <strong>Geographic Tags:</strong> rural, urban, remote,
              border-area
            </Text>
            <Text size="xs" style={{ marginTop: "var(--spacing-2)" }}>
              💡 <strong>Tip:</strong> Use consistent, standardized tags to
              improve searchability and enable better reporting and analysis.
            </Text>
          </Column>
        </InfoCard>
      </Section>

      {/* Privacy Policy Acceptance */}
      {!isEditing && (
        <Section>
          <SectionHeader>
            <SectionIcon>
              <HiOutlineShieldCheck />
            </SectionIcon>
            <SectionContent>
              <Heading as="h3" size="h4">
                Privacy & Data Protection
              </Heading>
              <Text size="sm" color="muted">
                Required acknowledgments for data processing and privacy
                compliance
              </Text>
            </SectionContent>
          </SectionHeader>

          <Controller
            name="privacyPolicyAccepted"
            control={control}
            rules={{
              required: "Privacy policy acceptance is required",
            }}
            render={({ field }) => (
              <FormField error={errors.privacyPolicyAccepted?.message}>
                <CheckboxField>
                  <EnhancedCheckbox
                    id="privacyPolicyAccepted"
                    checked={field.value || false}
                    onChange={(checked) => field.onChange(checked)}
                    disabled={isLoading}
                    error={!!errors.privacyPolicyAccepted}
                  />
                  <CheckboxLabel>
                    <Text weight="medium" size="sm">
                      Privacy Policy Acknowledgment
                    </Text>
                    <Text
                      size="sm"
                      color="muted"
                      style={{ marginTop: "var(--spacing-1)" }}
                    >
                      I confirm that this case data has been collected and
                      processed in accordance with privacy policies and data
                      protection regulations. This includes proper consent from
                      the feedback provider and compliance with applicable data
                      protection laws.
                    </Text>
                  </CheckboxLabel>
                </CheckboxField>
              </FormField>
            )}
          />
        </Section>
      )}
    </TabContainer>
  );
}

AdvancedTab.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  formOptions: PropTypes.shape({
    programmes: PropTypes.array,
    projects: PropTypes.array,
    activities: PropTypes.array,
    users: PropTypes.array,
  }),
  isLoading: PropTypes.bool,
  isEditing: PropTypes.bool,
};

export default AdvancedTab;
