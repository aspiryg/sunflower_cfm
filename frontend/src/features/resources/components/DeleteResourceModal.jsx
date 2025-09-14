// Create this file: /frontend/src/features/resources/components/DeleteResourceModal.jsx
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

import Modal from "../../../ui/Modal";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import StatusBadge from "../../../ui/StatusBadge";
import { useDeleteResource, RESOURCE_CONFIG } from "../useResources";

const WarningContainer = styled.div`
  background-color: var(--color-warning-50);
  border: 1px solid var(--color-warning-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
`;

const WarningContent = styled.div`
  flex: 1;
`;

const ItemDetails = styled.div`
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-grey-200);

  &:last-child {
    border-bottom: none;
  }
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
  margin-bottom: var(--spacing-4);
`;

/**
 * DeleteResourceModal Component
 *
 * Confirmation modal for deleting resources with item details
 */
function DeleteResourceModal({
  isOpen = false,
  onClose,
  onSuccess,
  resourceKey,
  item = null,
  title = "Delete Resource",
}) {
  const config = RESOURCE_CONFIG[resourceKey];
  const deleteMutation = useDeleteResource(resourceKey);

  const handleDelete = async () => {
    if (!item?.id) return;

    try {
      await deleteMutation.mutateAsync(item.id);
      onSuccess?.();
    } catch (error) {
      console.error("Delete resource error:", error);
    }
  };

  const handleClose = () => {
    if (!deleteMutation.isPending) {
      onClose();
    }
  };

  const getItemDisplayValue = (key, value) => {
    switch (key) {
      case "isActive":
        return (
          <StatusBadge
            content={value ? "Active" : "Inactive"}
            variant={value ? "success" : "secondary"}
            size="sm"
          />
        );
      case "color":
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <div
              style={{
                width: "1.6rem",
                height: "1.6rem",
                backgroundColor: `var(${value})`,
                border: "1px solid var(--color-grey-300)",
                borderRadius: "var(--border-radius-sm)",
              }}
            />
            <Text size="sm" style={{ fontFamily: "var(--font-mono)" }}>
              {value}
            </Text>
          </div>
        );
      case "startDate":
      case "endDate":
        return value ? new Date(value).toLocaleDateString() : "-";
      default:
        return value || "-";
    }
  };

  const getDisplayFields = () => {
    if (!item) return [];

    const fields = [];

    // Always show name
    if (item.name) {
      fields.push({ key: "name", label: "Name", value: item.name });
    }

    // Show Arabic name if available
    if (item.arabicName) {
      fields.push({
        key: "arabicName",
        label: "Arabic Name",
        value: item.arabicName,
      });
    }

    // Show code if available
    if (item.code) {
      fields.push({ key: "code", label: "Code", value: item.code });
    }

    // Resource-specific fields
    switch (resourceKey) {
      case "priorities":
        if (item.level) {
          fields.push({ key: "level", label: "Level", value: item.level });
        }
        break;
      case "categories":
      case "statuses":
        if (item.color) {
          fields.push({ key: "color", label: "Color", value: item.color });
        }
        if (item.sortOrder !== undefined) {
          fields.push({
            key: "sortOrder",
            label: "Sort Order",
            value: item.sortOrder,
          });
        }
        break;
      case "programs":
      case "projects":
      case "activities":
        if (item.startDate) {
          fields.push({
            key: "startDate",
            label: "Start Date",
            value: item.startDate,
          });
        }
        if (item.endDate) {
          fields.push({
            key: "endDate",
            label: "End Date",
            value: item.endDate,
          });
        }
        break;
    }

    // Always show status
    fields.push({ key: "isActive", label: "Status", value: item.isActive });

    return fields;
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
        disabled={deleteMutation.isPending}
      >
        <HiOutlineXMark />
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={handleDelete}
        loading={deleteMutation.isPending}
        disabled={!item?.id || deleteMutation.isPending}
      >
        <HiOutlineTrash />
        Delete {config?.label?.slice(0, -1) || "Resource"}
      </Button>
    </div>
  );

  if (!config || !item) {
    return null;
  }

  const displayFields = getDisplayFields();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={`Permanently remove this ${config.label
        .slice(0, -1)
        .toLowerCase()} from the system`}
      size="md"
      footer={footer}
      closeOnOverlayClick={!deleteMutation.isPending}
      closeOnEscape={!deleteMutation.isPending}
    >
      {/* Error Display */}
      {deleteMutation.isError && (
        <ErrorContainer>
          <HiOutlineExclamationTriangle />
          <Text size="sm">
            {deleteMutation.error?.message ||
              `Failed to delete ${config.label.slice(0, -1).toLowerCase()}`}
          </Text>
        </ErrorContainer>
      )}

      {/* Warning */}
      <WarningContainer>
        <HiOutlineExclamationTriangle
          style={{
            color: "var(--color-warning-600)",
            width: "2rem",
            height: "2rem",
            flexShrink: 0,
          }}
        />
        <WarningContent>
          <Text size="sm" weight="semibold" color="warning">
            This action cannot be undone
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-1)" }}
          >
            Deleting this {config.label.slice(0, -1).toLowerCase()} will
            permanently remove it from the system. Any cases or records using
            this {config.label.slice(0, -1).toLowerCase()} may be affected.
          </Text>
        </WarningContent>
      </WarningContainer>

      {/* Item Details */}
      <ItemDetails>
        <Text
          size="sm"
          weight="semibold"
          style={{ marginBottom: "var(--spacing-3)" }}
        >
          {config.label.slice(0, -1)} Details:
        </Text>

        {displayFields.map((field) => (
          <DetailRow key={field.key}>
            <Text size="sm" color="muted">
              {field.label}:
            </Text>
            <div>{getItemDisplayValue(field.key, field.value)}</div>
          </DetailRow>
        ))}
      </ItemDetails>

      <Text size="sm" color="muted">
        Type the {config.label.slice(0, -1).toLowerCase()} name "
        <strong>{item.name}</strong>" to confirm deletion, or click Cancel to go
        back.
      </Text>
    </Modal>
  );
}

DeleteResourceModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  resourceKey: PropTypes.string.isRequired,
  item: PropTypes.object,
  title: PropTypes.string,
};

export default DeleteResourceModal;
