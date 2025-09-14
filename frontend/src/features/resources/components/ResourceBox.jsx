// Create this file: /frontend/src/features/resources/components/ResourceBox.jsx
import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineEllipsisVertical,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

import Card from "../../../ui/Card";
import Heading from "../../../ui/Heading";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import IconButton from "../../../ui/IconButton";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import ResourceTable from "./ResourceTable";
import AddResourceModal from "./AddResourceModal";
import DeleteResourceModal from "./DeleteResourceModal";
import ContextMenu from "../../../ui/ContextMenu";

const BoxContainer = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-grey-200);
  background: var(--color-grey-0);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    border-color: var(--color-grey-300);
    box-shadow: var(--shadow-md);
  }
`;

const BoxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--color-grey-200);
  background: linear-gradient(
    135deg,
    var(--color-grey-25),
    var(--color-grey-50)
  );
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const ResourceCount = styled(Text)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-xs);
`;

const BoxContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  max-height: 400px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  gap: var(--spacing-3);
  color: var(--color-grey-500);
  text-align: center;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  gap: var(--spacing-3);
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  gap: var(--spacing-3);
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-4);
`;

/**
 * ResourceBox Component
 *
 * A reusable container component for displaying resource collections
 * with add, delete, and management capabilities
 */
function ResourceBox({
  resourceKey,
  title,
  description,
  data = [],
  isLoading = false,
  error = null,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  columns = [],
  showActiveOnly = false,
  onToggleShowActive,
}) {
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Filter data based on showActiveOnly
  const filteredData = showActiveOnly
    ? data.filter((item) => item.isActive !== false)
    : data;

  const activeCount = data.filter((item) => item.isActive !== false).length;
  const inactiveCount = data.length - activeCount;

  const handleAdd = () => {
    setAddModal({ isOpen: true });
  };

  const handleEdit = (item) => {
    if (onEdit) {
      onEdit(item);
    }
  };

  const handleDelete = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleCloseAddModal = () => {
    setAddModal({ isOpen: false });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null });
  };

  const handleAddSuccess = (newItem) => {
    handleCloseAddModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeleteSuccess = () => {
    handleCloseDeleteModal();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getContextMenuItems = () => [
    {
      key: "refresh",
      label: "Refresh Data",
      icon: HiOutlineArrowPath,
      onClick: onRefresh,
      disabled: isLoading,
    },
    {
      key: "show-active",
      label: showActiveOnly ? "Show All" : "Show Active Only",
      icon: showActiveOnly ? HiOutlineEye : HiOutlineEyeSlash,
      onClick: onToggleShowActive,
    },
    {
      key: "add",
      label: `Add ${title.slice(0, -1)}`,
      icon: HiOutlinePlus,
      onClick: handleAdd,
      variant: "primary",
    },
  ];

  return (
    <BoxContainer>
      <BoxHeader>
        <HeaderContent>
          <Heading as="h3" size="h5">
            {title}
          </Heading>
          <Text size="sm" color="muted">
            {description}
          </Text>
          {data.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-2)",
                marginTop: "var(--spacing-1)",
              }}
            >
              <ResourceCount size="xs">
                {showActiveOnly
                  ? `${activeCount} active`
                  : `${data.length} total`}
              </ResourceCount>
              {!showActiveOnly && inactiveCount > 0 && (
                <ResourceCount
                  size="xs"
                  style={{
                    backgroundColor: "var(--color-grey-100)",
                    color: "var(--color-grey-600)",
                  }}
                >
                  {inactiveCount} inactive
                </ResourceCount>
              )}
            </div>
          )}
        </HeaderContent>

        <HeaderActions>
          <IconButton
            variant="ghost"
            size="small"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh data"
          >
            <HiOutlineArrowPath />
          </IconButton>

          <Button
            variant="primary"
            size="small"
            onClick={handleAdd}
            disabled={isLoading}
          >
            <HiOutlinePlus />
            Add New
          </Button>

          <ContextMenu
            items={getContextMenuItems()}
            trigger={
              <IconButton variant="ghost" size="small">
                <HiOutlineEllipsisVertical />
              </IconButton>
            }
          />
        </HeaderActions>
      </BoxHeader>

      <BoxContent>
        {isLoading && (
          <LoadingState>
            <LoadingSpinner size="medium" />
            <Text size="sm" color="muted">
              Loading {title.toLowerCase()}...
            </Text>
          </LoadingState>
        )}

        {error && !isLoading && (
          <ErrorState>
            <Text size="sm" weight="semibold" color="error">
              Failed to load {title.toLowerCase()}
            </Text>
            <Text size="xs" color="muted">
              {error.message || "Something went wrong"}
            </Text>
            <Button variant="secondary" size="small" onClick={onRefresh}>
              Try Again
            </Button>
          </ErrorState>
        )}

        {!isLoading && !error && filteredData.length === 0 && (
          <EmptyState>
            <Text size="sm" weight="semibold">
              {data.length === 0
                ? `No ${title.toLowerCase()} found`
                : `No ${
                    showActiveOnly ? "active" : ""
                  } ${title.toLowerCase()} found`}
            </Text>
            <Text size="xs" color="muted">
              {data.length === 0
                ? `Get started by adding your first ${title
                    .slice(0, -1)
                    .toLowerCase()}`
                : `${
                    showActiveOnly
                      ? "All items are inactive"
                      : "Try adjusting your filters"
                  }`}
            </Text>
            <Button variant="ghost" size="small" onClick={handleAdd}>
              <HiOutlinePlus />
              Add {title.slice(0, -1)}
            </Button>
          </EmptyState>
        )}

        {!isLoading && !error && filteredData.length > 0 && (
          <TableContainer>
            <ResourceTable
              data={filteredData}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={onToggleActive}
              resourceKey={resourceKey}
            />
          </TableContainer>
        )}
      </BoxContent>

      {/* Modals */}
      <AddResourceModal
        isOpen={addModal.isOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
        resourceKey={resourceKey}
        title={`Add New ${title.slice(0, -1)}`}
      />

      <DeleteResourceModal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        onSuccess={handleDeleteSuccess}
        resourceKey={resourceKey}
        item={deleteModal.item}
        title={`Delete ${title.slice(0, -1)}`}
      />
    </BoxContainer>
  );
}

ResourceBox.propTypes = {
  resourceKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  onRefresh: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  columns: PropTypes.array,
  showActiveOnly: PropTypes.bool,
  onToggleShowActive: PropTypes.func,
};

export default ResourceBox;
