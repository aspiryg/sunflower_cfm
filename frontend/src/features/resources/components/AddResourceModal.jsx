import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import StyledSelect from "../../../ui/StyledSelect";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import FormField from "../../../ui/FormField";
import { Input, Textarea, Select } from "../../../ui/FormField";
import Switch from "../../../ui/Switch";
import {
  useAddResource,
  RESOURCE_CONFIG,
  useResourceByKey,
} from "../useResources";

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const SectionTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ColorPreview = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: var(--border-radius-md);
  border: 1px solid
    var(--color-${(props) => props.$color.split("-")[3] || "grey"}-400);
  background-color: ${(props) => `var(${props.$color})`};
  display: inline-block;
`;

const ErrorContainer = styled.div`
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--color-error-700);
`;

/**
 * AddResourceModal Component
 *
 * Dynamic modal for adding new resources with field validation
 * based on resource type configuration
 */
function AddResourceModal({
  isOpen = false,
  onClose,
  onSuccess,
  resourceKey,
  title = "Add Resource",
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const config = RESOURCE_CONFIG[resourceKey];
  const addMutation = useAddResource(resourceKey);

  // List of colors from CSS variables for color field validation
  const cssColors = [
    { label: "Blue", value: "--color-blue-200" },
    { label: "Red", value: "--color-red-200" },
    { label: "Green", value: "--color-green-200" },
    { label: "Yellow", value: "--color-yellow-200" },
    { label: "Purple", value: "--color-purple-200" },
    { label: "Orange", value: "--color-orange-200" },
    { label: "Teal", value: "--color-teal-200" },
    { label: "Pink", value: "--color-pink-200" },
    { label: "Indigo", value: "--color-indigo-200" },
    { label: "Grey", value: "--color-grey-200" },
    { label: "Black", value: "--color-black" },
    { label: "White", value: "--color-white" },
  ];

  // Get parent resource data if needed
  const parentResourceKey = config?.fields?.find(
    (f) => f.type === "select"
  )?.resourceType;
  const parentResource = useResourceByKey(parentResourceKey, {
    enabled: !!parentResourceKey,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  function getDefaultValues() {
    const defaults = {};
    config?.fields?.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      } else if (field.type === "boolean") {
        defaults[field.name] = false;
      } else {
        defaults[field.name] = "";
      }
    });
    return defaults;
  }

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues());
      setShowAdvanced(false);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      // Clean data
      const cleanedData = { ...data };

      // Convert empty strings to null
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === "") {
          cleanedData[key] = null;
        }
      });

      // Convert number fields
      config.fields.forEach((field) => {
        if (field.type === "number" && cleanedData[field.name]) {
          cleanedData[field.name] = Number(cleanedData[field.name]);
        }
      });

      await addMutation.mutateAsync(cleanedData);
      onSuccess?.(cleanedData);
    } catch (error) {
      console.error("Add resource error:", error);
    }
  };

  const handleClose = () => {
    if (!addMutation.isPending) {
      reset();
      onClose();
    }
  };

  const renderField = (field) => {
    const commonProps = {
      ...register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        min: field.min
          ? { value: field.min, message: `Minimum value is ${field.min}` }
          : undefined,
        max: field.max
          ? { value: field.max, message: `Maximum value is ${field.max}` }
          : undefined,
      }),
      disabled: addMutation.isPending,
    };

    switch (field.type) {
      case "text":
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            $variant={errors[field.name] ? "error" : "default"}
          />
        );

      case "textarea":
        return (
          <Textarea
            {...commonProps}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={3}
            $variant={errors[field.name] ? "error" : "default"}
          />
        );

      case "number":
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            $variant={errors[field.name] ? "error" : "default"}
          />
        );

      case "date":
        return (
          <Input
            {...commonProps}
            type="date"
            $variant={errors[field.name] ? "error" : "default"}
          />
        );

      case "color": {
        const colorValue = watch(field.name);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-3)",
            }}
          >
            {/* <Input
              {...commonProps}
              type="text"
              placeholder="--color-blue-200"
              $variant={errors[field.name] ? "error" : "default"}
              style={{ flex: 1 }}
            /> */}
            <StyledSelect
              {...commonProps}
              value={colorValue}
              placeholder="Select color"
              onChange={(value) => setValue(field.name, value)}
              // $variant={errors[field.name] ? "error" : "default"}
              $hasError={!!errors[field.name]}
              style={{ flex: 1 }}
              options={cssColors}
            />
            <ColorPreview $color={colorValue || "--color-grey-200"} />
          </div>
        );
      }

      case "select": {
        const options = parentResource?.data?.activeOptions || [];
        return (
          <Select
            {...commonProps}
            $variant={errors[field.name] ? "error" : "default"}
          >
            <option value="">Select {field.label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );
      }

      case "boolean":
        return (
          <Switch
            checked={watch(field.name)}
            onChange={(checked) => setValue(field.name, checked)}
            disabled={addMutation.isPending}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            $variant={errors[field.name] ? "error" : "default"}
          />
        );
    }
  };

  const categorizeFields = (fields) => {
    const basic = [];
    const advanced = [];

    fields.forEach((field) => {
      if (
        ["name", "arabicName", "description", "code", "level"].includes(
          field.name
        )
      ) {
        basic.push(field);
      } else {
        advanced.push(field);
      }
    });

    return { basic, advanced };
  };

  const footer = (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "var(--spacing-3)",
      }}
    >
      <Button
        variant="secondary"
        onClick={handleClose}
        disabled={addMutation.isPending}
      >
        <HiOutlineXMark />
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        loading={addMutation.isPending}
        disabled={!isValid || addMutation.isPending}
      >
        <HiOutlineCheck />
        Add {config?.label?.slice(0, -1) || "Resource"}
      </Button>
    </div>
  );

  if (!config) {
    return null;
  }

  const { basic, advanced } = categorizeFields(config.fields);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={`Add a new ${config.label
        .slice(0, -1)
        .toLowerCase()} to the system`}
      size="lg"
      footer={footer}
      closeOnOverlayClick={!addMutation.isPending}
      closeOnEscape={!addMutation.isPending}
    >
      <FormContainer>
        {/* Error Display */}
        {addMutation.isError && (
          <ErrorContainer>
            <HiOutlineExclamationTriangle />
            <Text size="sm">
              {addMutation.error?.message ||
                `Failed to add ${config.label.slice(0, -1).toLowerCase()}`}
            </Text>
          </ErrorContainer>
        )}

        {/* Basic Fields */}
        <FormSection>
          <SectionTitle size="sm">Basic Information</SectionTitle>
          <FormGrid>
            {basic.map((field) => (
              <FormField
                key={field.name}
                label={field.label}
                error={errors[field.name]?.message}
                required={field.required}
                style={
                  field.name === "description" ? { gridColumn: "1 / -1" } : {}
                }
              >
                {renderField(field)}
              </FormField>
            ))}
          </FormGrid>
        </FormSection>

        {/* Advanced Fields */}
        {advanced.length > 0 && (
          <FormSection>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <SectionTitle size="sm">Advanced Settings</SectionTitle>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setShowAdvanced(!showAdvanced)}
                type="button"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </Button>
            </div>

            {showAdvanced && (
              <FormGrid>
                {advanced.map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    error={errors[field.name]?.message}
                    required={field.required}
                    helpText={field.helpText}
                    style={
                      field.type === "textarea" ? { gridColumn: "1 / -1" } : {}
                    }
                  >
                    {renderField(field)}
                  </FormField>
                ))}
              </FormGrid>
            )}
          </FormSection>
        )}
      </FormContainer>
    </Modal>
  );
}

AddResourceModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  resourceKey: PropTypes.string.isRequired,
  title: PropTypes.string,
};

export default AddResourceModal;
