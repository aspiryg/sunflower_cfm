import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineInformationCircle,
  HiOutlineUser,
  HiOutlineMapPin,
  HiOutlineCog6Tooth,
  HiOutlineCheck,
  HiOutlineXMark,
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

// Import tab components
import BasicInfoTab from "./form/BasicInfoTab";
import ProviderDetailsTab from "./form/ProviderDetailsTab";
import LocationTab from "./form/LocationTab";
import AdvancedTab from "./form/AdvancedTab";

const FormContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
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
  padding: var(--spacing-4) var(--spacing-6);
  background-color: var(--color-grey-25);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column-reverse;
    gap: var(--spacing-3);
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
`;

/**
 * FeedbackForm Component
 *
 * Handles both creation and editing of feedback entries using a tabbed interface
 * Integrates with React Query hooks for data management
 *
 * Props:
 * - feedbackId: ID for editing existing feedback (null for new feedback)
 * - onSuccess: Callback when form is successfully submitted
 * - onCancel: Callback when form is cancelled
 * - initialData: Optional initial form data (overrides API data)
 */
function FeedbackForm({
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

  // Fetch existing feedback data if editing
  //   console.log("Fetching existing feedback data for feedbackId:", feedbackId);
  const {
    data: existingFeedback,
    isLoading: feedbackLoading,
    error: feedbackError,
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

    // provider types later ...
    isLoading: optionsLoading,
  } = useFeedbackFormOptions();

  // console.log("Form options:", {
  //   categories,
  //   channels,
  // });

  // Mock data for the programmes and communities

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

  // Get default form values
  function getDefaultFormValues() {
    return {
      // Basic Information
      title: "",
      description: "",
      category: "",
      priority: "medium",
      status: "open",
      feedbackChannel: "",
      feedbackDate: new Date().toISOString().slice(0, 10),
      impactDescription: "",

      // Provider Details
      providerType: 1, // Individual by default
      providerName: "",
      providerEmail: "",
      providerPhone: "",
      dataSharingConsent: false,
      consentToFollowUp: false,

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
      tags: "",
    };
  }

  // Get nested fields
  const getNestedField = () => [
    "category",
    "feedbackChannel",
    "providerType",
    "community",
    "governorate",
    "region",
    "assignedTo",
    "assignedBy",
    "submittedBy",
  ];

  // Load existing data when editing
  useEffect(() => {
    if (isEditing && (existingFeedback || initialData)) {
      const dataToLoad = initialData || existingFeedback;

      // Populate form with existing data
      Object.entries(dataToLoad).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Handle date fields
          if (key === "feedbackDate" && value) {
            const date = new Date(value);
            setValue(key, date.toISOString().slice(0, 10));
          } else if (getNestedField().includes(key) && value) {
            setValue(key, value.id);
          } else if (key === "community" && !value) {
            setValue(key, ""); // Ensure empty string for community
          } else {
            setValue(key, value);
          }
        }
      });

      setIsFormReady(true);
    } else if (!isEditing) {
      setIsFormReady(true);
    }
  }, [existingFeedback, initialData, isEditing, setValue]);

  // Calculate tab errors for visual indicators
  useEffect(() => {
    const newTabErrors = {};

    // Check for errors in each tab's fields
    tabs.forEach((tab) => {
      const tabFieldErrors = getTabFieldErrors(tab.value, errors);
      newTabErrors[tab.value] = Object.keys(tabFieldErrors).length > 0;
    });

    // console.log("Tab errors:", newTabErrors);

    setTabErrors(newTabErrors);
  }, [errors]);

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
      console.error("Form submission error:", error);
      // Error handling is done in the mutation hooks
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

  // Handle save as draft (placeholder for future implementation)
  const handleSaveDraft = () => {
    console.log("Save draft functionality to be implemented");
  };

  // Tab configuration
  const tabs = [
    {
      value: "basic",
      label: "Basic Information",
      icon: HiOutlineInformationCircle,
      component: BasicInfoTab,
      required: true,
    },
    {
      value: "provider",
      label: "Provider Details",
      icon: HiOutlineUser,
      component: ProviderDetailsTab,
      required: true,
    },
    {
      value: "location",
      label: "Location",
      icon: HiOutlineMapPin,
      component: LocationTab,
      required: false,
    },
    {
      value: "advanced",
      label: "Advanced Settings",
      icon: HiOutlineCog6Tooth,
      component: AdvancedTab,
      required: false,
    },
  ];

  // Get field errors for a specific tab
  const getTabFieldErrors = (tabValue, allErrors) => {
    const tabFieldMappings = {
      basic: [
        "title",
        "description",
        "category",
        "priority",
        "status",
        "feedbackChannel",
        "feedbackDate",
        "impactDescription",
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
      ],
      location: ["community", "location", "latitude", "longitude"],
      advanced: [
        "programmeId",
        "projectId",
        "activityId",
        "submittedBy",
        "assignedTo",
        "assignedBy",
        "tags",
      ],
    };

    const tabFields = tabFieldMappings[tabValue] || [];
    return Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => tabFields.includes(key))
    );
  };

  // Loading states
  if (feedbackLoading || optionsLoading || !isFormReady) {
    return (
      <FormContainer className={className}>
        <div style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
          <Text>Loading form data...</Text>
        </div>
      </FormContainer>
    );
  }

  // Error state
  if (feedbackError) {
    return (
      <FormContainer className={className}>
        <div style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
          <Text color="error">
            Failed to load feedback data. Please try again.
          </Text>
        </div>
      </FormContainer>
    );
  }

  const isLoading =
    createMutation.isLoading || updateMutation.isLoading || isSubmitting;

  return (
    <FormContainer className={className}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  icon={tab.icon}
                  data-label={tab.label.charAt(0)} // First letter for mobile fallback
                  hasError={tabErrors[tab.value]}
                  disabled={isLoading}
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
                  }}
                />
              </TabsContent>
            ))}
            {/* Add navigation at the bottom of tabs */}
            <TabsNavigation
              showProgress={true}
              previousLabel="Previous"
              nextLabel="Next"
              onNext={async () => {
                // Validate current tab before moving to next
                const currentTabFields = getTabFieldErrors(activeTab, errors);
                const isCurrentTabValid =
                  Object.keys(currentTabFields).length === 0;
                // console.log("Current tab validation:", isCurrentTabValid);

                if (!isCurrentTabValid) {
                  await trigger(); // Trigger validation to show errors
                  return; // Don't proceed to next tab
                }
                // Move to next tab (handled by TabsNavigation internally)
                setActiveTab((prev) => {
                  const currentIndex = tabs.findIndex((t) => t.value === prev);
                  if (currentIndex < tabs.length - 1) {
                    return tabs[currentIndex + 1].value;
                  }
                  return prev; // Stay on last tab
                });
              }}
            />
          </Tabs>
        </FormContent>

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
                <Text size="sm" color="warning">
                  • Unsaved changes
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
              {isEditing ? "Update Feedback" : "Create Feedback"}
            </Button>
          </ActionGroup>
        </FormActions>
      </form>
    </FormContainer>
  );
}

FeedbackForm.propTypes = {
  feedbackId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
  initialData: PropTypes.object,
  className: PropTypes.string,
};

export default FeedbackForm;
