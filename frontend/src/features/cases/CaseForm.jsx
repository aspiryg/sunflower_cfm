// Create this file: /frontend/src/features/cases/CaseForm.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineDocumentText,
  HiOutlineRectangleStack,
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsNavigation,
} from "../../ui/Tabs";
import Button from "../../ui/Button";
import Text from "../../ui/Text";
import { useCreateCase, useUpdateCase, useCase } from "./useCase";
import { useAllCaseLookupData } from "./useCaseData";
import { useUsers } from "../../features/user/useUsers"; // You'll need this for user selection

// Import tab components (we'll create these next)
import BasicInfoTab from "./form/BasicInfoTab";
import ClassificationTab from "./form/ClassificationTab";
import ProviderDetailsTab from "./form/ProviderDetailsTab";
import LocationTab from "./form/LocationTab";
import AdvancedTab from "./form/AdvancedTab";

const FormContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 100%;
`;

const FormContent = styled.div`
  /* Content styling will be handled by individual tabs */
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-5) var(--spacing-8);
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: var(--spacing-3);
    padding: var(--spacing-4) var(--spacing-6);
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    width: 100%;
    justify-content: stretch;

    & > * {
      flex: 1;
    }
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--color-grey-600);

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }
`;

const ErrorSummary = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-error-50),
    var(--color-error-25)
  );
  border: 1px solid var(--color-error-200);
  border-left: 4px solid var(--color-error-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin: var(--spacing-4) var(--spacing-8);
  color: var(--color-error-700);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  gap: var(--spacing-4);
`;

/**
 * Enhanced Case Management Form Component
 *
 * Modern case management form with improved terminology, structure, and UX
 * Handles both creation and editing of cases using a tabbed interface
 *
 * Props:
 * - caseId: ID for editing existing case (null for new case)
 * - onSuccess: Callback when form is successfully submitted
 * - onCancel: Callback when form is cancelled
 * - initialData: Optional initial form data (overrides API data)
 */
function CaseForm({
  caseId = null,
  onSuccess,
  onCancel,
  initialData = null,
  className = "",
}) {
  const navigate = useNavigate();
  const isEditing = !!caseId;

  // State management
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);

  // Fetch existing case data if editing
  const {
    data: existingCase,
    isLoading: caseLoading,
    error: caseError,
  } = useCase(caseId, {
    enabled: isEditing && !initialData,
  });

  // Load form options (categories, statuses, priorities, etc.)
  const {
    categoryOptions,
    statusOptions,
    priorityOptions,
    channelOptions,
    providerTypeOptions,
    regionOptions,
    programOptions,
    isLoading: optionsLoading,
  } = useAllCaseLookupData();

  // Load users for assignment
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const users = usersData?.data || [];

  // Mutations for create/update
  const createMutation = useCreateCase({
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data, "create");
      }
    },
  });

  const updateMutation = useUpdateCase({
    onSuccess: (data) => {
      // console.log("Updated Case Data:", data)
      if (onSuccess) {
        onSuccess(data, "update");
      }
    },
  });

  // Initialize react-hook-form with default values
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    defaultValues: getDefaultFormValues(),
  });

  // Get default form values for new case
  function getDefaultFormValues() {
    const today = new Date().toISOString().slice(0, 10);

    return {
      // Basic Information
      title: "",
      description: "",
      caseDate: today,
      dueDate: "",
      impactDescription: "",
      affectedBeneficiaries: "",

      // Classification
      categoryId: "",
      priorityId: "",
      statusId: 1, // Default to "Open" status
      channelId: "",

      // Provider Details
      providerTypeId: "",
      providerName: "",
      providerEmail: "",
      providerPhone: "",
      providerOrganization: "",
      providerAddress: "",

      // Individual Provider Demographics
      individualProviderGender: "",
      individualProviderAgeGroup: "",
      individualProviderDisabilityStatus: "",

      // Group Provider Details
      groupProviderSize: "",
      groupProviderGenderComposition: "",

      // Consent & Privacy
      dataSharingConsent: false,
      followUpConsent: false,
      followUpContactMethod: "",
      privacyPolicyAccepted: false,

      // Privacy & Security
      isSensitive: false,
      isAnonymized: false,
      isPublic: false,
      confidentialityLevel: "internal",

      // Location
      communityId: "",
      location: "",
      coordinates: "",

      // Assignment
      assignedTo: "",
      assignedBy: "",
      assignmentComments: "",

      // Project Relations
      programId: "",
      projectId: "",
      activityId: "",
      isProjectRelated: false,

      // Submission Information
      submittedBy: "",
      submittedByComments: "",

      // Metadata
      tags: "",
    };
  }

  // Enhanced tab configuration
  const tabs = [
    {
      value: "basic",
      label: "Basic Information",
      icon: HiOutlineDocumentText,
      component: BasicInfoTab,
      required: true,
      description: "Essential case details and description",
    },
    {
      value: "classification",
      label: "Classification",
      icon: HiOutlineRectangleStack,
      component: ClassificationTab,
      required: true,
      description: "Category, priority, and status settings",
    },
    {
      value: "provider",
      label: "Provider Details",
      icon: HiOutlineUser,
      component: ProviderDetailsTab,
      required: true,
      description: "Information about the case submitter",
    },
    {
      value: "location",
      label: "Location & Context",
      icon: HiOutlineMapPin,
      component: LocationTab,
      required: false,
      description: "Geographic and contextual information",
    },
    {
      value: "advanced",
      label: "Advanced Settings",
      icon: HiOutlineCog6Tooth,
      component: AdvancedTab,
      required: false,
      description: "Assignment, projects, and privacy settings",
    },
  ];

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && (existingCase || initialData)) {
      const dataToLoad = initialData || existingCase?.data;

      if (dataToLoad) {
        // Reset form with existing data
        const formData = {
          ...getDefaultFormValues(),
          ...dataToLoad,
        };

        // Handle date fields
        if (dataToLoad.caseDate) {
          formData.caseDate = new Date(dataToLoad.caseDate)
            .toISOString()
            .slice(0, 10);
        }
        if (dataToLoad.dueDate) {
          formData.dueDate = new Date(dataToLoad.dueDate)
            .toISOString()
            .slice(0, 10);
        }

        // Handle nested objects - extract IDs
        if (dataToLoad.category?.id)
          formData.categoryId = dataToLoad.category.id;
        if (dataToLoad.priority?.id)
          formData.priorityId = dataToLoad.priority.id;
        if (dataToLoad.status?.id) formData.statusId = dataToLoad.status.id;
        if (dataToLoad.channel?.id) formData.channelId = dataToLoad.channel.id;
        if (dataToLoad.providerType?.id)
          formData.providerTypeId = dataToLoad.providerType.id;
        if (dataToLoad.community?.id)
          formData.communityId = dataToLoad.community.id;
        if (dataToLoad.program?.id) formData.programId = dataToLoad.program.id;
        if (dataToLoad.project?.id) formData.projectId = dataToLoad.project.id;
        if (dataToLoad.activity?.id)
          formData.activityId = dataToLoad.activity.id;
        if (dataToLoad.assignedTo?.id)
          formData.assignedTo = dataToLoad.assignedTo.id;
        if (dataToLoad.assignedBy?.id)
          formData.assignedBy = dataToLoad.assignedBy.id;
        if (dataToLoad.submittedBy?.id)
          formData.submittedBy = dataToLoad.submittedBy.id;

        reset(formData);
      }

      setIsFormReady(true);
    } else if (!isEditing) {
      setIsFormReady(true);
    }
  }, [existingCase, initialData, isEditing, reset]);

  // Calculate tab errors for visual indicators
  useEffect(() => {
    const newTabErrors = {};

    tabs.forEach((tab) => {
      const tabFieldErrors = getTabFieldErrors(tab.value, errors);
      newTabErrors[tab.value] = Object.keys(tabFieldErrors).length > 0;
    });

    setTabErrors(newTabErrors);
  }, [errors]);

  // Get field errors for a specific tab
  const getTabFieldErrors = (tabValue, allErrors) => {
    const tabFieldMappings = {
      basic: [
        "title",
        "description",
        "caseDate",
        "dueDate",
        "impactDescription",
        "affectedBeneficiaries",
      ],
      classification: ["categoryId", "priorityId", "statusId", "channelId"],
      provider: [
        "providerTypeId",
        "providerName",
        "providerEmail",
        "providerPhone",
        "individualProviderGender",
        "individualProviderAgeGroup",
        "groupProviderSize",
        "dataSharingConsent",
        "followUpConsent",
        "followUpContactMethod",
      ],
      location: ["communityId", "location", "coordinates"],
      advanced: [
        "programId",
        "projectId",
        "activityId",
        "submittedBy",
        "assignedTo",
        "assignedBy",
        "isSensitive",
        "privacyPolicyAccepted",
        "tags",
      ],
    };

    const tabFields = tabFieldMappings[tabValue] || [];
    return Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => tabFields.includes(key))
    );
  };

  const nestedFieldsForEdit = [
    { object: "category", field: "categoryId" },
    { object: "priority", field: "priorityId" },
    { object: "status", field: "statusId" },
    { object: "channel", field: "channelId" },
    { object: "providerType", field: "providerTypeId" },
    { object: "community", field: "communityId" },
    { object: "program", field: "programId" },
    { object: "project", field: "projectId" },
    { object: "activity", field: "activityId" },
    { object: "assignedTo", field: "assignedTo" },
    { object: "assignedBy", field: "assignedBy" },
    { object: "submittedBy", field: "submittedBy" },
    { object: "escalatedBy", field: "escalatedBy" },
    { object: "qualityReviewedBy", field: "qualityReviewedBy" },
    { object: "createdBy", field: "createdBy" },
    { object: "updatedBy", field: "updatedBy" },
  ];

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Validate all tabs before submission
      const isFormValid = await trigger();
      if (!isFormValid) {
        // Find first tab with errors and switch to it
        const firstErrorTab = tabs.find((tab) => tabErrors[tab.value]);
        if (firstErrorTab) {
          setActiveTab(firstErrorTab.value);
        }
        return;
      }

      // Clean up data before submission
      const cleanedData = cleanFormData(data);

      // console.log("Submitting Case Data:", cleanedData);

      if (isEditing) {
        await updateMutation.mutateAsync({
          caseId: caseId,
          caseData: cleanedData,
        });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
    } catch (error) {
      console.error("Case submission error:", error);
    }
  };

  // Clean form data before submission
  const cleanFormData = (data) => {
    const cleaned = { ...data };

    // Remove empty strings and convert to appropriate types
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === "" || cleaned[key] === null) {
        delete cleaned[key];
      }

      // account for nested fields
      nestedFieldsForEdit.forEach(({ object, field }) => {
        if (cleaned[object]) {
          cleaned[field] = cleaned[object].id;
          delete cleaned[object];
        }
      });

      // Convert number fields
      const numberFields = [
        "categoryId",
        "priorityId",
        "statusId",
        "channelId",
        "providerTypeId",
        "communityId",
        "programId",
        "projectId",
        "activityId",
        "assignedTo",
        "assignedBy",
        "submittedBy",
        "affectedBeneficiaries",
        "groupProviderSize",
      ];

      if (numberFields.includes(key) && cleaned[key]) {
        const num = Number(cleaned[key]);
        if (!isNaN(num)) {
          cleaned[key] = num;
        }
      }
    });

    return cleaned;
  };

  // Handle cancel action
  const handleCancel = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmLeave) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      navigate("/cases");
    }
  };

  // Handle save as draft (for new cases, update status to draft)
  const handleSaveDraft = async () => {
    try {
      const formData = watch();
      const cleanedData = {
        ...cleanFormData(formData),
        statusId: 1, // Assuming 1 is "Draft" or "Open" status
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          caseId: caseId,
          caseData: cleanedData,
        });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
    } catch (error) {
      console.error("Save draft error:", error);
    }
  };

  // Handle tab navigation with validation
  const handleTabChange = async (newTab) => {
    const currentTabFields = getTabFieldErrors(activeTab, errors);
    const hasCurrentTabErrors = Object.keys(currentTabFields).length > 0;

    // If moving forward and current tab has errors, trigger validation
    const currentIndex = tabs.findIndex((t) => t.value === activeTab);
    const newIndex = tabs.findIndex((t) => t.value === newTab);

    if (newIndex > currentIndex && hasCurrentTabErrors) {
      await trigger();
      return; // Don't change tab if there are errors
    }

    setActiveTab(newTab);
  };

  // Loading states
  if (caseLoading || optionsLoading || usersLoading || !isFormReady) {
    return (
      <FormContainer className={className}>
        <LoadingContainer>
          <Text size="lg">Loading case data...</Text>
          <Text size="sm" color="muted">
            Preparing form components and validation rules
          </Text>
        </LoadingContainer>
      </FormContainer>
    );
  }

  // Error state
  if (caseError) {
    return (
      <FormContainer className={className}>
        <ErrorSummary>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <HiOutlineExclamationTriangle size={20} />
            <Text weight="semibold">Failed to load case data</Text>
          </div>
          <Text size="sm" style={{ marginTop: "var(--spacing-2)" }}>
            {caseError.message ||
              "An unexpected error occurred. Please try again."}
          </Text>
        </ErrorSummary>
      </FormContainer>
    );
  }

  const isLoading =
    createMutation.isLoading || updateMutation.isLoading || isSubmitting;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <FormContainer className={className}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Error Summary */}
        {hasErrors && (
          <ErrorSummary>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-2)",
              }}
            >
              <HiOutlineExclamationTriangle size={20} />
              <Text weight="semibold">
                Please review and correct the following issues:
              </Text>
            </div>
            <ul
              style={{
                marginTop: "var(--spacing-2)",
                paddingLeft: "var(--spacing-5)",
              }}
            >
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <Text size="sm">{error.message}</Text>
                </li>
              ))}
            </ul>
          </ErrorSummary>
        )}

        <FormContent aria-label="Case Management Form">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  hasError={tabErrors[tab.value]}
                  disabled={isLoading}
                  title={tab.description}
                >
                  {tab.label}
                  {tab.required && (
                    <span
                      style={{
                        color: "var(--color-error-500)",
                        marginLeft: "4px",
                      }}
                    >
                      *
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <tab.component
                  control={control}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  trigger={trigger}
                  isEditing={isEditing}
                  isLoading={isLoading}
                  formOptions={{
                    categories: categoryOptions,
                    statuses: statusOptions,
                    priorities: priorityOptions,
                    channels: channelOptions,
                    providerTypes: providerTypeOptions,
                    regions: regionOptions,
                    programs: programOptions,
                    users: users,
                  }}
                />
              </TabsContent>
            ))}

            {/* Enhanced Navigation */}
            <TabsNavigation
              showProgress={true}
              previousLabel="Previous"
              nextLabel="Next"
              onNext={async () => {
                const currentIndex = tabs.findIndex(
                  (t) => t.value === activeTab
                );
                if (currentIndex < tabs.length - 1) {
                  await handleTabChange(tabs[currentIndex + 1].value);
                }
              }}
              onPrevious={() => {
                const currentIndex = tabs.findIndex(
                  (t) => t.value === activeTab
                );
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1].value);
                }
              }}
            />
          </Tabs>
        </FormContent>

        {/* Enhanced Actions */}
        <FormActions>
          <ActionGroup>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              Save Draft
            </Button>

            <StatusIndicator>
              {isDirty && (
                <>
                  <HiOutlineExclamationTriangle />
                  <Text size="sm" color="warning">
                    Unsaved changes
                  </Text>
                </>
              )}
              {!isDirty && isEditing && (
                <Text size="sm" color="success">
                  All changes saved
                </Text>
              )}
            </StatusIndicator>
          </ActionGroup>

          <ActionGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <HiOutlineXMark />
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !isValid}
              loading={isLoading}
            >
              <HiOutlineCheck />
              {isEditing ? "Update Case" : "Create Case"}
            </Button>
          </ActionGroup>
        </FormActions>
      </form>
    </FormContainer>
  );
}

CaseForm.propTypes = {
  caseId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  initialData: PropTypes.object,
  className: PropTypes.string,
};

export default CaseForm;
