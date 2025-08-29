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
import {
  useCreateFeedback,
  useUpdateFeedback,
  useFeedback,
} from "./useFeedback";
import { useFeedbackFormOptions } from "./useFeedbackData";
import { useFeedbackUsers } from "./useFeedbackUsers";

// Import tab components
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
 * Handles both creation and editing of feedback cases using a tabbed interface
 *
 * Props:
 * - feedbackId: ID for editing existing case (null for new case)
 * - onSuccess: Callback when form is successfully submitted
 * - onCancel: Callback when form is cancelled
 * - initialData: Optional initial form data (overrides API data)
 */
function CaseForm({
  feedbackId = null,
  onSuccess,
  onCancel,
  initialData = null,
  className = "",
}) {
  const navigate = useNavigate();
  const isEditing = !!feedbackId;

  // State management
  const [activeTab, setActiveTab] = useState("basic");
  const [tabErrors, setTabErrors] = useState({});
  const [isFormReady, setIsFormReady] = useState(false);

  // Fetch existing case data if editing
  const {
    data: existingCase,
    isLoading: caseLoading,
    error: caseError,
  } = useFeedback(feedbackId, {
    enabled: isEditing && !initialData,
  });

  // Load form options (categories, channels, etc.)
  const {
    categories,
    channels,
    providerTypes,
    programmes,
    projects,
    activities,
    communities,
    isLoading: optionsLoading,
  } = useFeedbackFormOptions();

  // Load users for assignment
  const { data: usersData, isLoading: usersLoading } = useFeedbackUsers();
  const users = usersData || [];

  // Mutations for create/update
  const createMutation = useCreateFeedback({
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data, "create");
      }
    },
  });

  const updateMutation = useUpdateFeedback({
    onSuccess: (data) => {
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
    // reset,
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
      feedbackDate: today,
      caseType: "complaint", // complaint, suggestion, compliment, inquiry
      urgency: "normal", // low, normal, high, critical
      impactDescription: "",

      // Classification
      category: "",
      priority: "medium", // low, medium, high, urgent
      status: "open", // open, acknowledged, investigating, resolved, closed
      feedbackChannel: "",
      severity: "medium", // low, medium, high, critical

      // Provider Details
      providerType: 1, // Individual by default
      providerName: "",
      providerEmail: "",
      providerPhone: "",
      providerOrganization: "",
      providerAddress: "",
      dataSharingConsent: false,
      consentToFollowUp: false,
      followUpContactMethod: "", // Conditional field

      // Individual Provider Fields
      individualProviderGender: "",
      individualProviderAgeGroup: "",
      individualProviderDisabilityStatus: "",

      // Group Provider Fields
      groupProviderNumberOfIndividuals: "",
      groupProviderGenderComposition: "",

      // Location
      community: "",
      location: "",
      latitude: "",
      longitude: "",

      // Advanced Settings
      isProjectRelated: false,
      programmeId: "",
      projectId: "",
      activityId: "",
      submittedBy: "",
      assignedTo: "",
      assignedBy: "",
      isSensitive: false,
      isAnonymized: false,
      isPublic: true,
      privacyPolicyAccepted: false,
      tags: "",
    };
  }

  // Enhanced tab configuration with new structure
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
      description: "Category, priority, and urgency settings",
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

  // Get nested fields for proper data handling
  const getNestedFields = () => [
    "category",
    "feedbackChannel",
    "providerType",
    "community",
    "governorate",
    "region",
    "assignedTo",
    "assignedBy",
    "submittedBy",
    "programmeId",
    "projectId",
    "activityId",
  ];

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && (existingCase || initialData)) {
      const dataToLoad = initialData || existingCase;

      // Populate form with existing data
      Object.entries(dataToLoad).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Handle date fields
          if (key === "feedbackDate" && value) {
            const date = new Date(value);
            setValue(key, date.toISOString().slice(0, 10));
          }
          // Handle nested objects (get ID)
          else if (
            getNestedFields().includes(key) &&
            typeof value === "object" &&
            value.id
          ) {
            setValue(key, value.id);
          }
          // Handle direct values
          else if (
            getNestedFields().includes(key) &&
            typeof value !== "object"
          ) {
            setValue(key, value);
          }
          // Handle other fields
          else {
            setValue(key, value);
          }
        }
      });

      setIsFormReady(true);
    } else if (!isEditing) {
      setIsFormReady(true);
    }
  }, [existingCase, initialData, isEditing, setValue]);

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
        "feedbackDate",
        "caseType",
        "urgency",
        "impactDescription",
      ],
      classification: [
        "category",
        "priority",
        "status",
        "feedbackChannel",
        "severity",
      ],
      provider: [
        "providerType",
        "providerName",
        "providerEmail",
        "providerPhone",
        "individualProviderGender",
        "individualProviderAgeGroup",
        "groupProviderNumberOfIndividuals",
        "dataSharingConsent",
        "consentToFollowUp",
        "followUpContactMethod",
      ],
      location: ["community", "location", "latitude", "longitude"],
      advanced: [
        "programmeId",
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

      if (isEditing) {
        await updateMutation.mutateAsync({ id: feedbackId, data: cleanedData });
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

      // check if it an object
      if (typeof cleaned[key] === "object" && cleaned[key].id !== null) {
        cleaned[key] = cleaned[key].id;
      }

      if (typeof cleaned[key] === "object" && cleaned[key].id === null) {
        delete cleaned[key];
      }

      // Convert number fields
      const numberFields = [
        "groupProviderNumberOfIndividuals",
        "latitude",
        "longitude",
        "category",
        "feedbackChannel",
        "programmeId",
        "projectId",
        "activityId",
        "community",
        "submittedBy",
        "assignedTo",
        "assignedBy",
        "providerType",
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
      navigate("/feedback");
    }
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    try {
      const formData = watch();
      const cleanedData = { ...cleanFormData(formData), status: "draft" };

      if (isEditing) {
        await updateMutation.mutateAsync({ id: feedbackId, data: cleanedData });
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
                  $hasError={tabErrors[tab.value]}
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
                    categories: categories.data || [],
                    channels: channels.data || [],
                    providerTypes: providerTypes.data || [],
                    programmes: programmes.data || [],
                    projects: projects.data || [],
                    activities: activities.data || [],
                    communities: communities.data || [],
                    users: users.data || [],
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
  feedbackId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  initialData: PropTypes.object,
  className: PropTypes.string,
};

export default CaseForm;
