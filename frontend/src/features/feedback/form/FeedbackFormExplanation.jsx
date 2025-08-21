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

// Styled components...
const FormContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  width: 100%;
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
 * ERROR HANDLING SYSTEM OVERVIEW
 * ==============================
 *
 * This form implements a comprehensive multi-layered error handling system:
 *
 * 1. FIELD-LEVEL VALIDATION (React Hook Form)
 *    - Real-time validation as user types
 *    - Custom validation rules for each field
 *    - Immediate feedback on field blur/change
 *
 * 2. TAB-LEVEL ERROR AGGREGATION
 *    - Groups field errors by tab sections
 *    - Visual indicators on tab headers for errors
 *    - Prevents navigation to next tab if current has errors
 *
 * 3. FORM-LEVEL VALIDATION
 *    - Final validation before submission
 *    - Cross-field validation if needed
 *    - Error navigation (jumps to first tab with errors)
 *
 * 4. API-LEVEL ERROR HANDLING
 *    - Server validation errors
 *    - Network error handling
 *    - User-friendly error messages via toast notifications
 *
 * 5. UX ERROR RECOVERY
 *    - Clear error messaging
 *    - Error state preservation during navigation
 *    - Graceful fallbacks for failed operations
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

  // ===== ERROR-RELATED STATE MANAGEMENT =====

  // Tab navigation state
  const [activeTab, setActiveTab] = useState("basic");

  /**
   * TAB ERROR STATE TRACKING
   *
   * This state object tracks which tabs have validation errors.
   * Structure: { tabName: boolean }
   * Example: { basic: true, provider: false, location: false, advanced: true }
   *
   * Purpose:
   * - Visual indicators on tab headers (red dots, different styling)
   * - Navigation prevention (can't go to next tab if current has errors)
   * - Error recovery guidance (highlights problematic tabs)
   */
  const [tabErrors, setTabErrors] = useState({});

  const [isFormReady, setIsFormReady] = useState(false);

  // Fetch existing feedback data if editing
  const {
    data: existingFeedback,
    isLoading: feedbackLoading,
    error: feedbackError, // API-level error for data fetching
  } = useFeedback(feedbackId, {
    enabled: isEditing && !initialData,
  });

  // Load form options (categories, channels, etc.)
  const {
    categories,
    channels,
    isLoading: optionsLoading,
  } = useFeedbackFormOptions();

  // Mock data for the programmes and communities
  const programmes = [
    { id: "1", name: "Programme A" },
    { id: "2", name: "Programme B" },
  ];

  const communities = [
    { id: "1", name: "Community A" },
    { id: "2", name: "Community B" },
  ];

  // ===== API MUTATION ERROR HANDLING =====

  /**
   * CREATE MUTATION WITH ERROR HANDLING
   *
   * The useCreateFeedback hook handles:
   * - Network errors (connection failures, timeouts)
   * - Server validation errors (400 Bad Request)
   * - Authorization errors (401, 403)
   * - Server errors (500 Internal Server Error)
   *
   * Error handling is done in the hook itself via:
   * - Toast notifications for user feedback
   * - Console logging for debugging
   * - Error state management in React Query cache
   */
  const createMutation = useCreateFeedback({
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data, "create");
      }
    },
    // onError is handled in the hook itself
  });

  /**
   * UPDATE MUTATION WITH ERROR HANDLING
   *
   * Similar error handling to create mutation, but for updates
   * Additional considerations:
   * - Optimistic updates and rollback on error
   * - Conflict resolution (if data changed since last fetch)
   * - Version control errors
   */
  const updateMutation = useUpdateFeedback({
    onSuccess: (data) => {
      if (onSuccess) {
        onSuccess(data, "update");
      }
    },
  });

  // ===== REACT HOOK FORM ERROR SYSTEM =====

  /**
   * FORM INITIALIZATION WITH VALIDATION MODE
   *
   * mode: 'onChange' enables real-time validation
   * - Validates fields as user types (after first blur)
   * - Provides immediate feedback
   * - Updates error state continuously
   *
   * formState.errors contains all current validation errors:
   * {
   *   title: { type: 'required', message: 'Title is required' },
   *   email: { type: 'pattern', message: 'Invalid email format' },
   *   // ... other field errors
   * }
   */
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger, // Manual validation trigger
    formState: {
      errors, // Current validation errors object
      isDirty, // Has user made any changes?
      isValid, // Are all fields currently valid?
      isSubmitting, // Is form currently being submitted?
    },
  } = useForm({
    mode: "onChange", // Enable real-time validation
    defaultValues: getDefaultFormValues(),
  });

  // ===== DEFAULT VALUES FUNCTION =====

  /**
   * Get default form values
   *
   * Provides clean initial state for all form fields.
   * Important for error handling because:
   * - Prevents undefined field errors
   * - Establishes baseline validation state
   * - Ensures consistent field types
   */
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

  // ===== FIELD CATEGORIZATION FOR ERROR MAPPING =====

  /**
   * Get nested fields that need special handling
   *
   * These fields contain objects but we store only IDs in the form.
   * Important for error handling because:
   * - Prevents type mismatch errors
   * - Ensures proper validation rules
   * - Handles API response format correctly
   */
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

  // ===== DATA LOADING AND ERROR RECOVERY =====

  /**
   * Load existing data when editing
   *
   * Error considerations:
   * - Handles missing or malformed data gracefully
   * - Prevents form breakage from bad API responses
   * - Maintains form functionality even with partial data
   */
  useEffect(() => {
    if (isEditing && (existingFeedback || initialData)) {
      const dataToLoad = initialData || existingFeedback;

      // Populate form with existing data
      Object.entries(dataToLoad).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          try {
            // Handle date fields with error protection
            if (key === "feedbackDate" && value) {
              const date = new Date(value);
              // Validate date before setting
              if (!isNaN(date.getTime())) {
                setValue(key, date.toISOString().slice(0, 10));
              }
            }
            // Handle nested objects (extract ID)
            else if (getNestedField().includes(key) && value) {
              setValue(key, value.id);
            }
            // Handle community field specifically (may be null)
            else if (key === "community" && !value) {
              setValue(key, ""); // Ensure empty string for community
            }
            // Handle all other fields
            else {
              setValue(key, value);
            }
          } catch (error) {
            // Log but don't break the form if a single field fails
            console.warn(`Failed to set field ${key}:`, error);
          }
        }
      });

      setIsFormReady(true);
    } else if (!isEditing) {
      setIsFormReady(true);
    }
  }, [existingFeedback, initialData, isEditing, setValue]);

  // ===== TAB ERROR CALCULATION SYSTEM =====

  /**
   * REAL-TIME TAB ERROR CALCULATION
   *
   * This effect runs whenever the 'errors' object changes.
   * It calculates which tabs have errors and updates visual indicators.
   *
   * Process:
   * 1. Loop through each tab configuration
   * 2. Get the fields that belong to that tab
   * 3. Check if any of those fields have errors
   * 4. Update the tabErrors state for visual indicators
   *
   * Why this matters:
   * - Users can see at a glance which sections need attention
   * - Prevents users from missing errors in inactive tabs
   * - Guides error resolution workflow
   */
  useEffect(() => {
    const newTabErrors = {};

    // Check for errors in each tab's fields
    tabs.forEach((tab) => {
      // Get errors specific to this tab
      const tabFieldErrors = getTabFieldErrors(tab.value, errors);

      // Tab has errors if any of its fields have errors
      newTabErrors[tab.value] = Object.keys(tabFieldErrors).length > 0;
    });

    console.log("Tab errors calculated:", newTabErrors);
    console.log("All form errors:", errors);

    setTabErrors(newTabErrors);
  }, [errors]); // Re-run whenever errors change

  // ===== FORM SUBMISSION WITH COMPREHENSIVE ERROR HANDLING =====

  /**
   * Handle form submission with multi-level validation
   *
   * Error handling strategy:
   * 1. Pre-submission validation (trigger all fields)
   * 2. Error navigation (jump to first problematic tab)
   * 3. Data cleaning and sanitization
   * 4. API call with error recovery
   * 5. User feedback on success/failure
   */
  const onSubmit = async (data) => {
    try {
      // ===== STEP 1: COMPREHENSIVE FORM VALIDATION =====

      /**
       * trigger() validates all form fields manually
       * Returns: boolean indicating if entire form is valid
       *
       * Why we do this:
       * - Ensures all tabs are validated, not just current one
       * - Catches errors user might have missed
       * - Prevents bad data from reaching the API
       */
      const isFormValid = await trigger();

      if (!isFormValid) {
        // ===== ERROR NAVIGATION SYSTEM =====

        /**
         * If validation fails, automatically navigate to first tab with errors
         *
         * User experience benefits:
         * - Guides user to exactly where the problem is
         * - Prevents confusion about what needs to be fixed
         * - Maintains context during error resolution
         */
        const firstErrorTab = tabs.find((tab) => tabErrors[tab.value]);
        if (firstErrorTab) {
          console.log(`Navigating to tab with errors: ${firstErrorTab.value}`);
          setActiveTab(firstErrorTab.value);
        }

        // Stop submission process
        return;
      }

      // ===== STEP 2: DATA CLEANING AND SANITIZATION =====

      /**
       * Clean up data before API submission
       *
       * Error prevention measures:
       * - Remove empty/null values that might cause API errors
       * - Convert string numbers to actual numbers
       * - Sanitize input data
       * - Ensure data types match API expectations
       */
      const cleanedData = cleanFormData(data);

      // ===== STEP 3: API SUBMISSION WITH ERROR HANDLING =====

      /**
       * Submit to API with automatic error handling
       *
       * The mutation hooks handle:
       * - Network timeouts and connection errors
       * - Server validation errors (400 Bad Request)
       * - Authorization errors (401/403)
       * - Server errors (500)
       * - User notification via toast messages
       */
      if (isEditing) {
        await updateMutation.mutateAsync({ id: feedbackId, data: cleanedData });
      } else {
        await createMutation.mutateAsync(cleanedData);
      }
    } catch (error) {
      // ===== FINAL ERROR FALLBACK =====

      /**
       * Catch any errors not handled by mutation hooks
       *
       * This is a safety net for:
       * - Unexpected JavaScript errors
       * - React Hook Form internal errors
       * - Data processing errors
       */
      console.error("Form submission error:", error);

      // Additional error handling could be added here:
      // - Show user-friendly error message
      // - Log error to monitoring service
      // - Attempt error recovery
    }
  };

  // ===== DATA CLEANING WITH ERROR PREVENTION =====

  /**
   * Clean form data before submission
   *
   * Error prevention strategy:
   * - Remove empty values that might cause API validation errors
   * - Convert data types to match API expectations
   * - Handle edge cases that could break the submission
   */
  const cleanFormData = (data) => {
    const cleaned = { ...data };

    // Remove empty strings and convert to appropriate types
    Object.keys(cleaned).forEach((key) => {
      // Remove empty/null values to prevent API errors
      if (cleaned[key] === "" || cleaned[key] === null) {
        delete cleaned[key];
      }

      // Convert string numbers to actual numbers
      // This prevents API type validation errors
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
        } else {
          // If conversion fails, remove the field to prevent API errors
          console.warn(`Failed to convert ${key} to number, removing field`);
          delete cleaned[key];
        }
      }
    });

    return cleaned;
  };

  // ===== USER INTERACTION ERROR HANDLING =====

  /**
   * Handle cancel action with unsaved changes protection
   *
   * Error prevention:
   * - Warns user about losing unsaved changes
   * - Prevents accidental data loss
   * - Graceful fallback navigation
   */
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

  // ===== TAB CONFIGURATION WITH ERROR MAPPING =====

  /**
   * Tab configuration defining which fields belong to which tabs
   *
   * This is crucial for error handling because it:
   * - Defines the field-to-tab mapping
   * - Enables tab-specific error calculation
   * - Supports error navigation between tabs
   */
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

  // ===== FIELD-TO-TAB ERROR MAPPING SYSTEM =====

  /**
   * Get field errors for a specific tab
   *
   * This function is the core of the tab error system:
   *
   * @param {string} tabValue - The tab identifier
   * @param {object} allErrors - All form errors from React Hook Form
   * @returns {object} - Only the errors that belong to the specified tab
   *
   * How it works:
   * 1. Define which fields belong to each tab
   * 2. Filter the global errors object to only include fields from that tab
   * 3. Return the filtered errors for tab-specific error indication
   *
   * Example:
   * - Input: tabValue="basic", allErrors={ title: "Required", email: "Invalid" }
   * - Output: { title: "Required" } (email belongs to provider tab)
   */
  const getTabFieldErrors = (tabValue, allErrors) => {
    /**
     * FIELD-TO-TAB MAPPING CONFIGURATION
     *
     * This object defines which form fields belong to which tabs.
     * Critical for error handling because:
     * - Enables tab-specific error indicators
     * - Supports error navigation
     * - Maintains separation of concerns
     *
     * Adding new fields:
     * 1. Add field to appropriate tab array
     * 2. Error handling will automatically work
     * 3. Tab indicators will show errors for new field
     */
    const tabFieldMappings = {
      basic: [
        "title", // Required field
        "description", // Required field
        "category", // Required dropdown
        "priority", // Required dropdown
        "status", // Required dropdown
        "feedbackChannel", // Required dropdown
        "feedbackDate", // Required date
        "impactDescription", // Optional text area
      ],
      provider: [
        "providerType", // Required radio/dropdown
        "providerName", // Required text
        "providerEmail", // Optional email (with format validation)
        "providerPhone", // Optional phone (with format validation)
        "individualProviderGender", // Conditional field
        "individualProviderAgeGroup", // Conditional field
        "groupProviderNumberOfIndividuals", // Conditional number field
        "dataSharingConsent", // Boolean checkbox
      ],
      location: [
        "community", // Optional dropdown
        "location", // Optional text
        "latitude", // Optional number (with range validation)
        "longitude", // Optional number (with range validation)
      ],
      advanced: [
        "programmeId", // Conditional dropdown
        "projectId", // Conditional dropdown
        "activityId", // Conditional dropdown
        "submittedBy", // Optional user dropdown
        "assignedTo", // Optional user dropdown
        "assignedBy", // Optional user dropdown
        "tags", // Optional text area
      ],
    };

    /**
     * ERROR FILTERING LOGIC
     *
     * Process:
     * 1. Get the list of fields for the specified tab
     * 2. Filter the global errors object to only include those fields
     * 3. Return the filtered errors object
     *
     * This creates a clean separation between tabs for error handling
     */
    const tabFields = tabFieldMappings[tabValue] || [];
    return Object.fromEntries(
      Object.entries(allErrors).filter(([fieldName]) =>
        tabFields.includes(fieldName)
      )
    );
  };

  // ===== ERROR STATE RENDERING LOGIC =====

  /**
   * LOADING STATES WITH ERROR HANDLING
   *
   * Show loading spinner when:
   * - Fetching existing feedback data
   * - Loading form options (categories, channels)
   * - Form is not ready for user interaction
   *
   * Error considerations:
   * - Prevents user interaction during loading
   * - Avoids form submission with incomplete data
   * - Provides clear user feedback about system state
   */
  if (feedbackLoading || optionsLoading || !isFormReady) {
    return (
      <FormContainer className={className}>
        <div style={{ padding: "var(--spacing-8)", textAlign: "center" }}>
          <Text>Loading form data...</Text>
        </div>
      </FormContainer>
    );
  }

  /**
   * ERROR STATE RENDERING
   *
   * Show error message when data fetching fails:
   * - API is down or unreachable
   * - Invalid feedback ID (404 error)
   * - Permission errors (403 Forbidden)
   * - Server errors (500 Internal Server Error)
   *
   * User experience:
   * - Clear error message instead of broken form
   * - Actionable feedback ("Please try again")
   * - Graceful degradation of functionality
   */
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

  // ===== LOADING STATE FOR FORM ACTIONS =====

  /**
   * Determine if form is in a loading state
   *
   * Loading states prevent:
   * - Double submission
   * - User interaction during API calls
   * - Form state corruption
   */
  const isLoading =
    createMutation.isLoading || updateMutation.isLoading || isSubmitting;

  // ===== MAIN FORM RENDER WITH ERROR INTEGRATION =====

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
                  /**
                   * ERROR VISUAL INDICATOR
                   *
                   * hasError prop controls visual error indicators on tabs:
                   * - Red dot or different styling
                   * - Warns user about validation issues
                   * - Guides error resolution workflow
                   */
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
                {/**
                 * TAB COMPONENT ERROR PROPS
                 *
                 * Each tab component receives:
                 * - errors: Field-specific error messages
                 * - trigger: Function to manually validate fields
                 * - isLoading: Prevents interaction during submission
                 *
                 * Tab components handle:
                 * - Field-level error display
                 * - Input validation styling
                 * - Error message rendering
                 */}
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
                    programmes: programmes || [],
                    communities: communities || [],
                  }}
                />
              </TabsContent>
            ))}

            {/**
             * TAB NAVIGATION WITH VALIDATION
             *
             * Custom onNext handler prevents navigation if current tab has errors:
             * 1. Check if current tab has validation errors
             * 2. If errors exist, trigger validation to show them
             * 3. Prevent navigation to next tab
             * 4. If no errors, allow navigation
             *
             * This prevents users from skipping required fields
             */}
            <TabsNavigation
              showProgress={true}
              previousLabel="Previous"
              nextLabel="Next"
              onNext={async () => {
                // ===== TAB VALIDATION BEFORE NAVIGATION =====

                /**
                 * Validate current tab before moving to next
                 *
                 * Process:
                 * 1. Get errors for current tab only
                 * 2. Check if any errors exist
                 * 3. If errors, trigger validation and stop
                 * 4. If clean, proceed to next tab
                 */
                const currentTabFields = getTabFieldErrors(activeTab, errors);
                const isCurrentTabValid =
                  Object.keys(currentTabFields).length === 0;

                console.log("Current tab validation:", {
                  tab: activeTab,
                  isValid: isCurrentTabValid,
                  errors: currentTabFields,
                });

                if (!isCurrentTabValid) {
                  // Show validation errors to user
                  await trigger();
                  return; // Don't proceed to next tab
                }

                // Navigation logic (proceed to next tab)
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
              {/**
               * UNSAVED CHANGES INDICATOR
               *
               * isDirty flag shows when user has made changes:
               * - Warns about potential data loss
               * - Encourages saving before navigation
               * - Prevents accidental loss of work
               */}
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
              /**
               * SUBMIT BUTTON STATE MANAGEMENT
               *
               * Button is disabled when:
               * - Form is loading (prevents double submission)
               * - Form is invalid (prevents bad data submission)
               *
               * isValid flag from React Hook Form:
               * - Automatically calculated based on all field validations
               * - Updates in real-time as user fixes errors
               * - Provides immediate feedback about form completeness
               */
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
