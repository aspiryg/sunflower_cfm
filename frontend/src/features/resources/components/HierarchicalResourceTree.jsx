// Create this file: /frontend/src/features/resources/components/HierarchicalResourceTree.jsx
import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineChevronRight,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import IconButton from "../../../ui/IconButton";
import Button from "../../../ui/Button";
import StatusBadge from "../../../ui/StatusBadge";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import AddResourceModal from "./AddResourceModal";
import DeleteResourceModal from "./DeleteResourceModal";

const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--color-grey-0);
  border-radius: var(--border-radius-md);
  overflow: hidden;
`;

const TreeNode = styled.div`
  border-bottom: 1px solid var(--color-grey-100);

  &:last-child {
    border-bottom: none;
  }
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: ${(props) => {
    switch (props.$level) {
      case 0:
        return "linear-gradient(135deg, var(--color-grey-50), var(--color-grey-100))";
      case 1:
        return "var(--color-grey-25)";
      case 2:
        return "var(--color-grey-0)";
      default:
        return "var(--color-grey-0)";
    }
  }};
  border-left: ${(props) => {
    switch (props.$level) {
      case 0:
        return "4px solid var(--color-brand-500)";
      case 1:
        return "3px solid var(--color-brand-300)";
      case 2:
        return "2px solid var(--color-brand-200)";
      default:
        return "1px solid var(--color-grey-200)";
    }
  }};
  margin-left: ${(props) => props.$level * 2}rem;
  transition: all var(--duration-fast) var(--ease-in-out);
  cursor: pointer;

  &:hover {
    background: ${(props) => {
      switch (props.$level) {
        case 0:
          return "linear-gradient(135deg, var(--color-grey-75), var(--color-grey-125))";
        case 1:
          return "var(--color-grey-50)";
        case 2:
          return "var(--color-grey-25)";
        default:
          return "var(--color-grey-25)";
      }
    }};
  }
`;

const NodeContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-600);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);

  &:hover {
    background: var(--color-grey-200);
    color: var(--color-grey-800);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
    transition: transform var(--duration-fast) var(--ease-in-out);
  }
`;

const NodeInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
`;

const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const NodeName = styled(Text)`
  font-weight: ${(props) => {
    switch (props.$level) {
      case 0:
        return "var(--font-weight-bold)";
      case 1:
        return "var(--font-weight-semibold)";
      default:
        return "var(--font-weight-medium)";
    }
  }};
  font-size: ${(props) => {
    switch (props.$level) {
      case 0:
        return "var(--font-size-base)";
      case 1:
        return "var(--font-size-sm)";
      default:
        return "var(--font-size-sm)";
    }
  }};
`;

const NodeDetails = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const NodeCode = styled(Text)`
  font-family: var(--font-mono);
  background-color: var(--color-grey-100);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-grey-200);
`;

const NodeActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  opacity: 0.7;
  transition: opacity var(--duration-fast) var(--ease-in-out);

  ${NodeHeader}:hover & {
    opacity: 1;
  }
`;

const ChildrenContainer = styled.div`
  margin-left: ${(props) => (props.$level + 1) * 2}rem;
  border-left: 1px solid var(--color-grey-200);
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  gap: var(--spacing-2);
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  gap: var(--spacing-3);
  color: var(--color-grey-500);
`;

const AddChildButton = styled(Button)`
  margin: var(--spacing-2) var(--spacing-4);
  margin-left: ${(props) => (props.$level + 1) * 2 + 1}rem;
`;

/**
 * HierarchicalResourceNode Component
 *
 * Represents a single node in the hierarchical tree
 */
function HierarchicalResourceNode({
  item,
  level = 0,
  children = [],
  isExpanded = false,
  isLoading = false,
  hasChildren = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onAddChild,
  childResourceKey,
  // showAddChild = true,
}) {
  const [addModal, setAddModal] = useState({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  const canAddChild = level < 2 && childResourceKey;

  const handleToggleExpand = () => {
    if (hasChildren || children.length > 0) {
      onToggleExpand?.(item.id);
    }
  };

  const handleAddChild = () => {
    setAddModal({ isOpen: true });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true });
  };

  const handleToggleActive = (e) => {
    e.stopPropagation();
    onToggleActive?.(item);
  };

  const handleAddSuccess = () => {
    setAddModal({ isOpen: false });
    onAddChild?.();
  };

  const handleDeleteSuccess = () => {
    setDeleteModal({ isOpen: false });
    onDelete?.(item);
  };

  return (
    <TreeNode>
      <NodeHeader $level={level} onClick={handleToggleExpand}>
        <NodeContent>
          <ExpandButton
            disabled={!hasChildren && children.length === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
          >
            {hasChildren || children.length > 0 ? (
              isExpanded ? (
                <HiOutlineChevronDown />
              ) : (
                <HiOutlineChevronRight />
              )
            ) : null}
          </ExpandButton>

          <NodeInfo>
            <NodeTitle>
              <NodeName $level={level}>{item.name}</NodeName>
              {item.arabicName && (
                <Text size="xs" color="muted" style={{ fontStyle: "italic" }}>
                  ({item.arabicName})
                </Text>
              )}
            </NodeTitle>

            <NodeDetails>
              {item.code && <NodeCode>{item.code}</NodeCode>}

              <StatusBadge
                content={item.isActive ? "Active" : "Inactive"}
                variant={item.isActive ? "success" : "secondary"}
                size="sm"
              />

              {children.length > 0 && (
                <Text size="xs" color="muted">
                  {children.length}{" "}
                  {children.length === 1
                    ? getChildResourceLabel(childResourceKey)?.toLowerCase() ||
                      "child"
                    : getChildResourceLabel(childResourceKey)?.toLowerCase() +
                        "s" || "children"}
                </Text>
              )}
            </NodeDetails>
          </NodeInfo>
        </NodeContent>

        <NodeActions>
          <IconButton
            variant="ghost"
            size="small"
            onClick={handleEdit}
            aria-label="Edit"
          >
            <HiOutlinePencil />
          </IconButton>

          <IconButton
            variant="ghost"
            size="small"
            onClick={handleToggleActive}
            aria-label={item.isActive ? "Deactivate" : "Activate"}
          >
            {item.isActive ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
          </IconButton>

          <IconButton
            variant="ghost"
            size="small"
            onClick={handleDelete}
            aria-label="Delete"
          >
            <HiOutlineTrash />
          </IconButton>

          {canAddChild && (
            <IconButton
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleAddChild();
              }}
              aria-label={`Add ${getChildResourceLabel(childResourceKey)}`}
            >
              <HiOutlinePlus />
            </IconButton>
          )}
        </NodeActions>
      </NodeHeader>

      {/* Children */}
      {isExpanded && (
        <ChildrenContainer $level={level}>
          {isLoading && (
            <LoadingContainer>
              <LoadingSpinner size="small" />
              <Text size="sm" color="muted">
                Loading{" "}
                {getChildResourceLabel(childResourceKey)?.toLowerCase() ||
                  "children"}
                ...
              </Text>
            </LoadingContainer>
          )}

          {!isLoading && children.length === 0 && hasChildren && (
            <EmptyContainer>
              <Text size="sm" color="muted">
                No{" "}
                {getChildResourceLabel(childResourceKey)?.toLowerCase() ||
                  "children"}{" "}
                found
              </Text>
            </EmptyContainer>
          )}

          {!isLoading &&
            children.map((child) => (
              <HierarchicalResourceNode
                key={child.id}
                item={child}
                level={level + 1}
                children={child.children || []}
                isExpanded={child.isExpanded}
                isLoading={child.isLoading}
                hasChildren={child.hasChildren}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onAddChild={onAddChild}
                childResourceKey={getChildResourceKey(childResourceKey)}
                showAddChild={canAddChild}
              />
            ))}

          {/* Add Child Button */}
          {!isLoading && canAddChild && (
            <AddChildButton
              variant="ghost"
              size="small"
              $level={level}
              onClick={handleAddChild}
            >
              <HiOutlinePlus />
              Add {getChildResourceLabel(childResourceKey)}
            </AddChildButton>
          )}
        </ChildrenContainer>
      )}

      {/* Modals */}
      {childResourceKey && (
        <AddResourceModal
          isOpen={addModal.isOpen}
          onClose={() => setAddModal({ isOpen: false })}
          onSuccess={handleAddSuccess}
          resourceKey={childResourceKey}
          title={`Add New ${getChildResourceLabel(childResourceKey)}`}
        />
      )}

      <DeleteResourceModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onSuccess={handleDeleteSuccess}
        resourceKey={getResourceKeyFromItem(item)}
        item={item}
        title={`Delete ${getResourceLabel(getResourceKeyFromItem(item))}`}
      />
    </TreeNode>
  );
}

/**
 * HierarchicalResourceTree Component
 *
 * Main tree component for displaying hierarchical resources
 */
function HierarchicalResourceTree({
  data = [],
  isLoading = false,
  error = null,
  resourceType, // 'geographic' or 'program'
  onRefresh,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleExpand,
  onAddChild,
}) {
  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="medium" />
        <Text size="sm" color="muted">
          Loading hierarchy...
        </Text>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <EmptyContainer>
        <Text size="sm" weight="semibold" color="error">
          Failed to load hierarchy
        </Text>
        <Text size="xs" color="muted">
          {error.message || "Something went wrong"}
        </Text>
        <Button variant="secondary" size="small" onClick={onRefresh}>
          Try Again
        </Button>
      </EmptyContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyContainer>
        <Text size="sm" weight="semibold">
          No {resourceType === "geographic" ? "regions" : "programs"} found
        </Text>
        <Text size="xs" color="muted">
          Get started by adding your first{" "}
          {resourceType === "geographic" ? "region" : "program"}
        </Text>
      </EmptyContainer>
    );
  }

  const getRootChildResourceKey = () => {
    return resourceType === "geographic" ? "governorates" : "projects";
  };

  return (
    <TreeContainer>
      {data.map((item) => (
        <HierarchicalResourceNode
          key={item.id}
          item={item}
          level={0}
          children={item.children || []}
          isExpanded={item.isExpanded}
          isLoading={item.isLoading}
          hasChildren={item.hasChildren}
          onToggleExpand={onToggleExpand}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onAddChild={onAddChild}
          childResourceKey={getRootChildResourceKey()}
          showAddChild={true}
        />
      ))}
    </TreeContainer>
  );
}

// Helper functions
function getChildResourceKey(currentResourceKey) {
  const hierarchy = {
    regions: "governorates",
    governorates: "communities",
    communities: null,
    programs: "projects",
    projects: "activities",
    activities: null,
  };

  return hierarchy[currentResourceKey] || null;
}

function getChildResourceLabel(resourceKey) {
  const labels = {
    governorates: "Governorate",
    communities: "Community",
    projects: "Project",
    activities: "Activity",
  };
  return labels[resourceKey] || "Item";
}

function getResourceKeyFromItem(item) {
  // Determine resource type based on item properties
  if (item.regionId && !item.governorateId) return "governorates";
  if (item.governorateId && !item.projectId) return "communities";
  if (item.programId && !item.projectId) return "projects";
  if (item.projectId) return "activities";

  // Root level items
  if (item.code && !item.regionId && !item.programId) {
    // Could be region or program - check for typical region/program patterns
    return "regions"; // Default to regions for now
  }
  if (!item.regionId && !item.programId) {
    return "programs"; // Programs typically don't have parent references
  }

  return "regions"; // Default fallback
}

function getResourceLabel(resourceKey) {
  const labels = {
    regions: "Region",
    governorates: "Governorate",
    communities: "Community",
    programs: "Program",
    projects: "Project",
    activities: "Activity",
  };
  return labels[resourceKey] || "Resource";
}

HierarchicalResourceNode.propTypes = {
  item: PropTypes.object.isRequired,
  level: PropTypes.number,
  children: PropTypes.array,
  isExpanded: PropTypes.bool,
  isLoading: PropTypes.bool,
  hasChildren: PropTypes.bool,
  onToggleExpand: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  onAddChild: PropTypes.func,
  childResourceKey: PropTypes.string,
  showAddChild: PropTypes.bool,
};

HierarchicalResourceTree.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  resourceType: PropTypes.oneOf(["geographic", "program"]).isRequired,
  onRefresh: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleActive: PropTypes.func,
  onToggleExpand: PropTypes.func,
  onAddChild: PropTypes.func,
};

export default HierarchicalResourceTree;
