// Create this file: /frontend/src/features/resources/components/HierarchicalResourceBox.jsx
import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineEllipsisVertical,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from "react-icons/hi2";

import Card from "../../../ui/Card";
import Heading from "../../../ui/Heading";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import IconButton from "../../../ui/IconButton";
import Switch from "../../../ui/Switch";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import HierarchicalResourceTree from "./HierarchicalResourceTree";
import AddResourceModal from "./AddResourceModal";
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
  background: var(--color-grey-0);
`;

const TreeContainer = styled.div`
  flex: 1;
  overflow: auto;
  max-height: 600px;
  min-height: 300px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-grey-100);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: var(--border-radius-sm);
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-grey-400);
  }
`;

const ControlsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-100);
  background: var(--color-grey-25);
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const TreeActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
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
 * HierarchicalResourceBox Component
 *
 * Container for hierarchical resources with tree view and controls
 */
function HierarchicalResourceBox({
  resourceType, // 'geographic' | 'program'
  title,
  description,
  data = [],
  isLoading = false,
  error = null,
  onRefresh,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleExpand,
  onAddChild,
  showActiveOnly = false,
  onToggleShowActive,
  expandAll = false,
  onToggleExpandAll,
  rootResourceKey, // e.g., 'regions' | 'programs'
}) {
  const [addModal, setAddModal] = useState({ isOpen: false });

  // Calculate stats
  const calculateStats = (items) => {
    let total = 0;
    let active = 0;

    const countRecursive = (nodes) => {
      nodes.forEach((node) => {
        total++;
        if (node.isActive !== false) active++;
        if (node.children) countRecursive(node.children);
      });
    };

    countRecursive(items);
    return { total, active };
  };

  const { total, active } = calculateStats(data);

  // Filter data based on showActiveOnly
  const filterData = (items, showActive) => {
    if (!showActive) return items;

    return items
      .filter((item) => item.isActive !== false)
      .map((item) => ({
        ...item,
        children: item.children ? filterData(item.children, showActive) : [],
      }));
  };

  const filteredData = filterData(data, showActiveOnly);

  const handleAddRoot = () => {
    setAddModal({ isOpen: true });
  };

  const handleCloseAddModal = () => {
    setAddModal({ isOpen: false });
  };

  const handleAddSuccess = () => {
    handleCloseAddModal();
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
      key: "expand-all",
      label: expandAll ? "Collapse All" : "Expand All",
      icon: expandAll ? HiOutlineChevronDown : HiOutlineChevronRight,
      onClick: onToggleExpandAll,
    },
    {
      key: "add-root",
      label: `Add ${getRootLabel()}`,
      icon: HiOutlinePlus,
      onClick: handleAddRoot,
      variant: "primary",
    },
  ];

  const getRootLabel = () => {
    return resourceType === "geographic" ? "Region" : "Program";
  };

  const getSingularTitle = () => {
    if (title.endsWith("ies")) return title.slice(0, -3) + "y";
    if (title.endsWith("s")) return title.slice(0, -1);
    return title;
  };

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
          {total > 0 && (
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-2)",
                marginTop: "var(--spacing-1)",
              }}
            >
              <ResourceCount size="xs">
                {showActiveOnly ? `${active} active` : `${total} total`}
              </ResourceCount>
              {!showActiveOnly && total - active > 0 && (
                <ResourceCount
                  size="xs"
                  style={{
                    backgroundColor: "var(--color-grey-100)",
                    color: "var(--color-grey-600)",
                  }}
                >
                  {total - active} inactive
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
            onClick={handleAddRoot}
            disabled={isLoading}
          >
            <HiOutlinePlus />
            Add {getRootLabel()}
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

      {/* Controls Bar */}
      <ControlsBar>
        <ViewControls>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
            }}
          >
            <Text size="xs" color="muted">
              Show:
            </Text>
            <Switch
              checked={showActiveOnly}
              onChange={onToggleShowActive}
              size="small"
            />
            <Text size="xs" color="muted">
              {showActiveOnly ? "Active only" : "All items"}
            </Text>
          </div>
        </ViewControls>

        <TreeActions>
          <Button variant="ghost" size="small" onClick={onToggleExpandAll}>
            {expandAll ? (
              <>
                <HiOutlineChevronDown />
                Collapse All
              </>
            ) : (
              <>
                <HiOutlineChevronRight />
                Expand All
              </>
            )}
          </Button>
        </TreeActions>
      </ControlsBar>

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
                ? `Get started by adding your first ${getSingularTitle().toLowerCase()}`
                : `${
                    showActiveOnly
                      ? "All items are inactive"
                      : "Try adjusting your filters"
                  }`}
            </Text>
            <Button variant="ghost" size="small" onClick={handleAddRoot}>
              <HiOutlinePlus />
              Add {getRootLabel()}
            </Button>
          </EmptyState>
        )}

        {!isLoading && !error && filteredData.length > 0 && (
          <TreeContainer>
            <HierarchicalResourceTree
              data={filteredData}
              isLoading={isLoading}
              error={error}
              resourceType={resourceType}
              onRefresh={onRefresh}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
            />
          </TreeContainer>
        )}
      </BoxContent>

      {/* Add Root Resource Modal */}
      <AddResourceModal
        isOpen={addModal.isOpen}
        onClose={handleCloseAddModal}
        onSuccess={handleAddSuccess}
        resourceKey={rootResourceKey}
        title={`Add New ${getRootLabel()}`}
      />
    </BoxContainer>
  );
}

HierarchicalResourceBox.propTypes = {
  resourceType: PropTypes.oneOf(["geographic", "program"]).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  onRefresh: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  onToggleExpand: PropTypes.func,
  onAddChild: PropTypes.func,
  showActiveOnly: PropTypes.bool,
  onToggleShowActive: PropTypes.func,
  expandAll: PropTypes.bool,
  onToggleExpandAll: PropTypes.func,
  rootResourceKey: PropTypes.string.isRequired,
};

export default HierarchicalResourceBox;
