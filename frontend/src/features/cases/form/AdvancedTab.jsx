// Create this file: /frontend/src/features/cases/form/AdvancedTab.jsx
import { useState, useEffect } from "react";
import { Controller } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCog6Tooth,
  HiShieldCheck,
  HiOutlineFolderOpen,
  HiOutlineTag,
  HiOutlineInformationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";

import FormField, { Textarea } from "../../../ui/FormField";
import Input from "../../../ui/Input";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import Row from "../../../ui/Row";
import Column from "../../../ui/Column";
import InfoCard from "../../../ui/InfoCard";
import EnhancedCheckbox from "../../../ui/EnhancedCheckbox";
import Badge from "../../../ui/Badge";
import { useProjectsByProgram, useActivitiesByProject } from "../useCaseData";

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

const PrivacyLevelIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
`;

const AssignmentPreview = styled.div`
  background: var(--color-green-25);
  border: 1px solid var(--color-green-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
`;

const ProjectHierarchy = styled.div`
  background: var(--color-blue-25);
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
`;

const TagsInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  min-height: 4rem;
  padding: var(--spacing-2);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: var(--color-grey-0);

  &:focus-within {
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 1px var(--color-brand-500);
  }
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);

  button {
    background: none;
    border: none;
    color: var(--color-brand-600);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
      color: var(--color-brand-800);
    }
  }
`;

const TagInput = styled.input`
  flex: 1;
  min-width: 8rem;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-sm);
  padding: var(--spacing-1);

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

/**
 * AdvancedTab Component
 *
 * Handles advanced case settings including assignment, project relations,
 * privacy settings, and metadata with user-friendly organization
 */
function AdvancedTab({
  control,
  watch,
  setValue,
  errors,
  // trigger,
  // isEditing,
  isLoading,
  formOptions = {},
}) {
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tagsArray, setTagsArray] = useState([]);

  // Get form options
  const { users = [], programs = [] } = formOptions;

  // Watch form values for conditional rendering
  const watchedValues = watch([
    "isProjectRelated",
    "programId",
    "projectId",
    "activityId",
    "assignedTo",
    "assignedBy",
    "submittedBy",
    "isSensitive",
    "isAnonymized",
    "confidentialityLevel",
    "tags",
  ]);

  const [
    isProjectRelated,
    programId,
    projectId,
    activityId,
    assignedTo,
    // assignedBy,
    submittedBy,
    isSensitive,
    // isAnonymized,
    confidentialityLevel,
    tags,
  ] = watchedValues;

  // Fetch hierarchical project data
  const { data: projectsData, isLoading: projectsLoading } =
    useProjectsByProgram(selectedProgramId, { enabled: !!selectedProgramId });

  const { data: activitiesData, isLoading: activitiesLoading } =
    useActivitiesByProject(selectedProjectId, { enabled: !!selectedProjectId });

  // Update selected IDs when form values change
  useEffect(() => {
    if (programId && programId !== selectedProgramId) {
      setSelectedProgramId(programId);
      // Clear downstream selections
      setValue("projectId", "");
      setValue("activityId", "");
      setSelectedProjectId("");
    }
  }, [programId, selectedProgramId, setValue]);

  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId);
      // Clear downstream selections
      setValue("activityId", "");
    }
  }, [projectId, selectedProjectId, setValue]);

  // Handle tags input
  useEffect(() => {
    if (tags && typeof tags === "string") {
      setTagsArray(
        tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      );
    }
  }, [tags]);

  // Get selected user details
  const getSelectedUser = (userId) => {
    return users.find((user) => user.id === Number(userId));
  };

  const selectedAssignee = getSelectedUser(assignedTo);
  // const selectedAssigner = getSelectedUser(assignedBy);
  const selectedSubmitter = getSelectedUser(submittedBy);

  // console.log("Assigned To:", selectedAssignee);

  // Form options
  const userOptions = users.length
    ? [
        { value: "", label: "Select user..." },
        ...users.map((user) => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName}`,
          role: user.role,
          email: user.email,
        })),
      ]
    : [{ value: "loading", label: "Loading users...", disabled: true }];

  const programOptions = programs.length
    ? [{ value: "", label: "Select program..." }, ...programs]
    : [{ value: "loading", label: "Loading programs...", disabled: true }];

  const projectOptions = projectsData?.activeOptions || [];
  const activityOptions = activitiesData?.activeOptions || [];

  const confidentialityOptions = [
    { value: "public", label: "Public - Visible to all authorized users" },
    {
      value: "internal",
      label: "Internal - Visible to organization staff only",
    },
    {
      value: "restricted",
      label: "Restricted - Visible to assigned team only",
    },
    {
      value: "confidential",
      label: "Confidential - Visible to managers and above",
    },
  ];

  // Tags management
  const handleTagAdd = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const newTag = event.target.value.trim();

      if (newTag && !tagsArray.includes(newTag)) {
        const updatedTags = [...tagsArray, newTag];
        setTagsArray(updatedTags);
        setValue("tags", updatedTags.join(", "));
        event.target.value = "";
      }
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const updatedTags = tagsArray.filter((tag) => tag !== tagToRemove);
    setTagsArray(updatedTags);
    setValue("tags", updatedTags.join(", "));
  };

  // Build project hierarchy display
  const getProjectHierarchy = () => {
    const parts = [];

    const selectedProgram = programs.find((p) => p.value === programId);
    const selectedProject = projectOptions.find((p) => p.value === projectId);
    const selectedActivity = activityOptions.find(
      (a) => a.value === activityId
    );

    if (selectedProgram) parts.push(selectedProgram.label);
    if (selectedProject) parts.push(selectedProject.label);
    if (selectedActivity) parts.push(selectedActivity.label);

    return parts.length > 0 ? parts.join(" → ") : "No project selected";
  };

  return (
    <TabContainer>
      <TabHeader>
        <Text size="lg" weight="semibold" color="grey-800">
          Advanced Settings
        </Text>
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
          Assignment, project relations, privacy settings, and metadata
        </Text>
      </TabHeader>

      <SectionGrid>
        {/* Main Content Section */}
        <MainSection>
          {/* Assignment Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiShieldCheck />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Case Assignment
                </Text>
                <Text size="xs" color="muted">
                  Assign responsibility and track submission details
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid className="two-columns">
              {/* Submitted By */}
              <FormField
                label="Submitted By"
                error={errors.submittedBy?.message}
                helpText="Who originally submitted this case?"
              >
                <Controller
                  name="submittedBy"
                  control={control}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={userOptions}
                        placeholder="Select submitter..."
                        disabled={isLoading}
                        $hasError={!!errors.submittedBy?.message}
                        size="medium"
                      />
                      {selectedSubmitter && (
                        <AssignmentPreview>
                          <Row align="center" gap={2}>
                            <HiOutlineUser
                              style={{ color: "var(--color-green-600)" }}
                            />
                            <Column gap={0}>
                              <Text size="sm" weight="medium">
                                {selectedSubmitter.firstName}{" "}
                                {selectedSubmitter.lastName}
                              </Text>
                              <Text size="xs" color="muted">
                                {selectedSubmitter.email} •{" "}
                                {selectedSubmitter.role}
                              </Text>
                            </Column>
                          </Row>
                        </AssignmentPreview>
                      )}
                    </>
                  )}
                />
              </FormField>

              {/* Assigned To */}
              <FormField
                label="Assigned To"
                error={errors.assignedTo?.message}
                helpText="Who is responsible for this case?"
              >
                <Controller
                  name="assignedTo"
                  control={control}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={userOptions}
                        placeholder="Select assignee..."
                        disabled={isLoading}
                        $hasError={!!errors.assignedTo?.message}
                        size="medium"
                      />
                      {selectedAssignee && (
                        <AssignmentPreview>
                          <Row align="center" gap={2}>
                            <HiShieldCheck
                              style={{ color: "var(--color-green-600)" }}
                            />
                            <Column gap={0}>
                              <Text size="sm" weight="medium">
                                {selectedAssignee.firstName}{" "}
                                {selectedAssignee.lastName}
                              </Text>
                              <Text size="xs" color="muted">
                                {selectedAssignee.email} •{" "}
                                {selectedAssignee.role}
                              </Text>
                            </Column>
                          </Row>
                        </AssignmentPreview>
                      )}
                    </>
                  )}
                />
              </FormField>

              {/* Assignment Comments */}
              {assignedTo && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Assignment Comments"
                    error={errors.assignmentComments?.message}
                    helpText="Optional comments about the assignment"
                  >
                    <Controller
                      name="assignmentComments"
                      control={control}
                      rules={{
                        maxLength: {
                          value: 500,
                          message: "Comments cannot exceed 500 characters",
                        },
                      }}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Add notes about why this case was assigned to this person..."
                          disabled={isLoading}
                          $variant={
                            errors.assignmentComments?.message
                              ? "error"
                              : "default"
                          }
                        />
                      )}
                    />
                  </FormField>
                </div>
              )}
            </FieldGrid>
          </SectionCard>

          {/* Project Relations Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineFolderOpen />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Project Relations
                </Text>
                <Text size="xs" color="muted">
                  Link this case to organizational programs and projects
                </Text>
              </Column>
            </SectionHeader>

            <CheckboxContainer>
              {/* Is Project Related */}
              <Controller
                name="isProjectRelated"
                control={control}
                render={({ field }) => (
                  <EnhancedCheckbox
                    {...field}
                    checked={field.value}
                    label="This case is related to a specific project"
                    // helpText="Enable to link this case to your organization's programs, projects, and activities"
                    disabled={isLoading}
                  />
                )}
              />

              {/* Project Selection (conditional) */}
              {isProjectRelated && (
                <ConditionalSection $visible={isProjectRelated}>
                  <FieldGrid className="three-columns">
                    {/* Program */}
                    <FormField
                      label="Program"
                      error={errors.programId?.message}
                      // helpText="Select the program"
                    >
                      <Controller
                        name="programId"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={programOptions}
                            placeholder="Select program..."
                            disabled={isLoading}
                            $hasError={!!errors.programId?.message}
                            size="medium"
                          />
                        )}
                      />
                    </FormField>

                    {/* Project */}
                    <FormField
                      label="Project"
                      error={errors.projectId?.message}
                      // helpText="Select the project"
                    >
                      <Controller
                        name="projectId"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={[
                              { value: "", label: "Select project..." },
                              ...projectOptions,
                            ]}
                            placeholder="Select project..."
                            disabled={
                              isLoading || !selectedProgramId || projectsLoading
                            }
                            $hasError={!!errors.projectId?.message}
                            size="medium"
                          />
                        )}
                      />
                    </FormField>

                    {/* Activity */}
                    <FormField
                      label="Activity"
                      error={errors.activityId?.message}
                      // helpText="Select the activity"
                    >
                      <Controller
                        name="activityId"
                        control={control}
                        render={({ field }) => (
                          <StyledSelect
                            {...field}
                            options={[
                              { value: "", label: "Select activity..." },
                              ...activityOptions,
                            ]}
                            placeholder="Select activity..."
                            disabled={
                              isLoading ||
                              !selectedProjectId ||
                              activitiesLoading
                            }
                            $hasError={!!errors.activityId?.message}
                            size="medium"
                          />
                        )}
                      />
                    </FormField>
                  </FieldGrid>

                  {/* Project Hierarchy Preview */}
                  {(programId || projectId || activityId) && (
                    <ProjectHierarchy>
                      <Row align="center" gap={2}>
                        <HiOutlineFolderOpen
                          style={{ color: "var(--color-blue-600)" }}
                        />
                        <Text size="sm" weight="medium">
                          Project Hierarchy: {getProjectHierarchy()}
                        </Text>
                      </Row>
                    </ProjectHierarchy>
                  )}
                </ConditionalSection>
              )}
            </CheckboxContainer>
          </SectionCard>

          {/* Privacy & Security Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiShieldCheck />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Privacy & Security
                </Text>
                <Text size="xs" color="muted">
                  Control access and visibility of this case
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Confidentiality Level */}
              <FormField
                label="Confidentiality Level"
                error={errors.confidentialityLevel?.message}
                // helpText="Who can view this case?"
              >
                <Controller
                  name="confidentialityLevel"
                  control={control}
                  render={({ field }) => (
                    <>
                      <StyledSelect
                        {...field}
                        options={confidentialityOptions}
                        placeholder="Select confidentiality level..."
                        disabled={isLoading}
                        $hasError={!!errors.confidentialityLevel?.message}
                        size="medium"
                      />
                      {confidentialityLevel && (
                        <PrivacyLevelIndicator>
                          {confidentialityLevel === "public" ? (
                            <HiOutlineEye
                              style={{ color: "var(--color-green-600)" }}
                            />
                          ) : (
                            <HiOutlineEyeSlash
                              style={{ color: "var(--color-warning-600)" }}
                            />
                          )}
                          <Text size="xs" color="muted">
                            {
                              confidentialityOptions.find(
                                (opt) => opt.value === confidentialityLevel
                              )?.label
                            }
                          </Text>
                        </PrivacyLevelIndicator>
                      )}
                    </>
                  )}
                />
              </FormField>

              {/* Privacy Checkboxes */}
              <CheckboxContainer>
                {/* Sensitive Content */}
                <Controller
                  name="isSensitive"
                  control={control}
                  render={({ field }) => (
                    <EnhancedCheckbox
                      {...field}
                      checked={field.value}
                      label="Contains Sensitive Information"
                      // helpText="This case contains sensitive personal, medical, or confidential information"
                      disabled={isLoading}
                    />
                  )}
                />

                {/* Anonymized */}
                <Controller
                  name="isAnonymized"
                  control={control}
                  render={({ field }) => (
                    <EnhancedCheckbox
                      {...field}
                      checked={field.value}
                      label="Anonymize Provider Information"
                      // helpText="Hide or remove personally identifiable information from reports and summaries"
                      disabled={isLoading}
                    />
                  )}
                />
              </CheckboxContainer>
            </FieldGrid>
          </SectionCard>

          {/* Metadata Section */}
          <SectionCard>
            <SectionHeader>
              <SectionIcon>
                <HiOutlineTag />
              </SectionIcon>
              <Column gap={0}>
                <Text size="md" weight="semibold">
                  Metadata & Tags
                </Text>
                <Text size="xs" color="muted">
                  Additional information for organization and search
                </Text>
              </Column>
            </SectionHeader>

            <FieldGrid>
              {/* Tags */}
              <FormField
                label="Tags"
                error={errors.tags?.message}
                // helpText="Add tags to help organize and find this case"
              >
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TagsInput>
                      {tagsArray.map((tag, index) => (
                        <Tag key={index}>
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleTagRemove(tag)}
                            aria-label={`Remove tag: ${tag}`}
                          >
                            ×
                          </button>
                        </Tag>
                      ))}
                      <TagInput
                        type="text"
                        placeholder={
                          tagsArray.length === 0
                            ? "Add tags (press Enter or comma to add)..."
                            : "Add another tag..."
                        }
                        onKeyDown={handleTagAdd}
                        disabled={isLoading}
                      />
                    </TagsInput>
                  )}
                />
              </FormField>

              {/* Submission Comments */}
              <FormField
                label="Submission Comments"
                error={errors.submittedByComments?.message}
                // helpText="Additional notes from the person who submitted this case"
              >
                <Controller
                  name="submittedByComments"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 1000,
                      message: "Comments cannot exceed 1000 characters",
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Add any additional context or notes about this case submission..."
                      disabled={isLoading}
                      $variant={
                        errors.submittedByComments?.message
                          ? "error"
                          : "default"
                      }
                    />
                  )}
                />
              </FormField>
            </FieldGrid>
          </SectionCard>
        </MainSection>

        {/* Side Section - Help and Guidelines */}
        <SideSection>
          {/* Assignment Guidelines */}
          <InfoCard
            icon={HiOutlineInformationCircle}
            title="Assignment Guidelines"
            variant="info"
          >
            <Column gap={3}>
              <Text size="sm">
                <strong>Best Practices:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    Assign cases based on expertise and workload
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    Include clear assignment comments for context
                  </Text>
                </li>
                <li>
                  <Text size="xs">Consider time zones and availability</Text>
                </li>
                <li>
                  <Text size="xs">Reassign if priorities change</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Assignment Comments:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">Explain why this person was chosen</Text>
                </li>
                <li>
                  <Text size="xs">Include any special instructions</Text>
                </li>
                <li>
                  <Text size="xs">Mention deadlines or urgency</Text>
                </li>
              </ul>
            </Column>
          </InfoCard>

          {/* Privacy Guidelines */}
          <InfoCard
            icon={HiShieldCheck}
            title="Privacy & Security Guidelines"
            variant="warning"
          >
            <Column gap={2}>
              <Text size="sm">
                <strong>Confidentiality Levels:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">
                    <strong>Public:</strong> All authorized users
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Internal:</strong> Organization staff only
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Restricted:</strong> Assigned team only
                  </Text>
                </li>
                <li>
                  <Text size="xs">
                    <strong>Confidential:</strong> Managers and above
                  </Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Remember:</strong>
              </Text>
              <Text size="xs" color="muted">
                Cases containing personal data, medical information, or
                sensitive details should be marked appropriately and anonymized
                when possible.
              </Text>
            </Column>
          </InfoCard>

          {/* Project Relations Help */}
          {isProjectRelated && (
            <InfoCard
              icon={HiOutlineFolderOpen}
              title="Project Relations"
              variant="success"
            >
              <Column gap={2}>
                <Text size="sm">
                  <strong>Benefits of Linking Cases:</strong>
                </Text>
                <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                  <li>
                    <Text size="xs">Better resource allocation tracking</Text>
                  </li>
                  <li>
                    <Text size="xs">
                      Project-specific reporting and analysis
                    </Text>
                  </li>
                  <li>
                    <Text size="xs">Impact assessment per project</Text>
                  </li>
                  <li>
                    <Text size="xs">Improved stakeholder communication</Text>
                  </li>
                </ul>

                {(programId || projectId || activityId) && (
                  <>
                    <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                      <strong>Current Selection:</strong>
                    </Text>
                    <Text size="sm" color="brand">
                      {getProjectHierarchy()}
                    </Text>
                  </>
                )}
              </Column>
            </InfoCard>
          )}

          {/* Tags Help */}
          <InfoCard
            icon={HiOutlineTag}
            title="Tagging Best Practices"
            variant="info"
          >
            <Column gap={2}>
              <Text size="sm">
                <strong>Effective Tags:</strong>
              </Text>
              <ul style={{ margin: 0, paddingLeft: "var(--spacing-4)" }}>
                <li>
                  <Text size="xs">Use consistent terminology</Text>
                </li>
                <li>
                  <Text size="xs">Include location-based tags</Text>
                </li>
                <li>
                  <Text size="xs">Add urgency or impact indicators</Text>
                </li>
                <li>
                  <Text size="xs">Use specific, searchable terms</Text>
                </li>
              </ul>

              <Text size="sm" style={{ marginTop: "var(--spacing-3)" }}>
                <strong>Examples:</strong>
              </Text>
              <Row gap={1} style={{ flexWrap: "wrap" }}>
                <Badge variant="info" size="sm">
                  urgent
                </Badge>
                <Badge variant="info" size="sm">
                  follow-up
                </Badge>
                <Badge variant="info" size="sm">
                  gaza
                </Badge>
                <Badge variant="info" size="sm">
                  health
                </Badge>
              </Row>
            </Column>
          </InfoCard>

          {/* Sensitive Content Warning */}
          {isSensitive && (
            <InfoCard
              icon={HiOutlineExclamationTriangle}
              title="Sensitive Content Alert"
              variant="error"
            >
              <Text size="sm">
                This case is marked as containing{" "}
                <strong>sensitive information</strong>. Please ensure:
              </Text>
              <ul
                style={{
                  margin: "var(--spacing-2) 0 0",
                  paddingLeft: "var(--spacing-4)",
                }}
              >
                <li>
                  <Text size="xs">Access is restricted appropriately</Text>
                </li>
                <li>
                  <Text size="xs">
                    Data handling complies with privacy policies
                  </Text>
                </li>
                <li>
                  <Text size="xs">Consider anonymization when sharing</Text>
                </li>
                <li>
                  <Text size="xs">Document any data access or sharing</Text>
                </li>
              </ul>
            </InfoCard>
          )}
        </SideSection>
      </SectionGrid>
    </TabContainer>
  );
}

AdvancedTab.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  trigger: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isLoading: PropTypes.bool,
  formOptions: PropTypes.object,
};

export default AdvancedTab;
