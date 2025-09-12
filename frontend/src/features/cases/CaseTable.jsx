// Create this file: /frontend/src/features/cases/CaseTable.jsx
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineArchiveBox,
  HiOutlineUserPlus,
  HiOutlineDocumentDuplicate,
  HiOutlineFlag,
  HiOutlineChatBubbleLeft,
  HiOutlineArrowTrendingUp,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import Text from "../../ui/Text";
import StatusBadge from "../../ui/StatusBadge";
import ContextMenu from "../../ui/ContextMenu";
import Avatar from "../../ui/Avatar";
import { formatRelativeTime } from "../../utils/dateUtils";
import { getUserDisplayName } from "../../utils/userUtils";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { getColorStyles } from "../../utils/caseUtils";

const TableContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  white-space: nowrap;

  &:last-child {
    text-align: center;
    width: 5rem;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-3);
    font-size: var(--font-size-xs);
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-100);
  transition: background-color var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-25);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-4);
  vertical-align: middle;

  @media (max-width: 768px) {
    padding: var(--spacing-3);
  }
`;

const MobileCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
  box-shadow: var(--shadow-sm);
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const MobileCardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);
`;

const CaseTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  cursor: pointer;

  &:hover {
    color: var(--color-brand-600);
  }
`;

const CaseNumber = styled(Text)`
  font-family: var(--font-family-mono);
  color: var(--color-grey-500);
  background-color: var(--color-grey-50);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  display: inline-block;
`;

const ActionsCell = styled(TableCell)`
  text-align: center;
  width: 5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-grey-500);
`;

const UrgencyIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);

  ${(props) => {
    switch (props.$level) {
      case "critical":
        return `
          background-color: var(--color-error-100);
          color: var(--color-error-700);
        `;
      case "urgent":
        return `
          background-color: var(--color-warning-100);
          color: var(--color-warning-700);
        `;
      case "high":
        return `
          background-color: var(--color-yellow-100);
          color: var(--color-yellow-700);
        `;
      case "normal":
        return `
          background-color: var(--color-blue-100);
          color: var(--color-blue-700);
        `;
      case "low":
      default:
        return `
          background-color: var(--color-grey-100);
          color: var(--color-grey-600);
        `;
    }
  }}
`;

function CaseTable({
  caseData = [],
  isLoading = false,
  onViewCase,
  onEditCase,
  onDeleteCase,
  onArchiveCase,
  onAssignCase,
  onUpdateStatus,
  onDuplicateCase,
  onMarkPriority,
  onAddComment,
  onEscalateCase,
  tableType, // to distinguish between different table types (e.g., "assigned", "created"
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // console.log("Case data: ", caseData);

  const handleRowClick = (caseItem, event) => {
    // Don't trigger row click if clicking on action buttons
    if (event.target.closest("button")) return;

    if (onViewCase) {
      onViewCase(caseItem);
    }
  };

  const getContextMenuItems = (caseItem) => [
    {
      key: "view",
      label: "View Details",
      description: "Open case in detail view",
      icon: HiOutlineEye,
      onClick: () => onViewCase?.(caseItem),
      variant: "primary",
      group: "primary",
    },
    {
      key: "edit",
      label: "Edit Case",
      description: "Modify case information",
      icon: HiOutlinePencil,
      onClick: () => onEditCase?.(caseItem),
      group: "primary",
    },
    {
      key: "status",
      label: "Update Status",
      description: "Change case status",
      icon: HiOutlineClipboardDocumentCheck,
      onClick: () => onUpdateStatus?.(caseItem),
      group: "secondary",
    },
    {
      key: "assign",
      label: "Assign to User",
      description: "Assign case to team member",
      icon: HiOutlineUserPlus,
      onClick: () => onAssignCase?.(caseItem),
      group: "secondary",
      // Only show for "created" cases
      hidden: tableType !== "created" && tableType !== "all",
    },
    {
      key: "comment",
      label: "Add Comment",
      description: "Add internal comment or note",
      icon: HiOutlineChatBubbleLeft,
      onClick: () => onAddComment?.(caseItem),
      group: "secondary",
    },
    {
      key: "escalate",
      label: "Escalate Case",
      description: "Escalate to higher priority",
      icon: HiOutlineArrowTrendingUp,
      onClick: () => onEscalateCase?.(caseItem),
      disabled: caseItem.escalationLevel >= 3 || true, // Example condition
      group: "secondary",
    },
    {
      key: "priority",
      label: "Mark Priority",
      description: "Change priority level",
      icon: HiOutlineFlag,
      onClick: () => onMarkPriority?.(caseItem),
      disabled: caseItem.urgencyLevel === "critical" || true, // Example condition
      group: "secondary",
    },
    {
      key: "duplicate",
      label: "Duplicate",
      description: "Create a copy of this case",
      icon: HiOutlineDocumentDuplicate,
      onClick: () => onDuplicateCase?.(caseItem),
      group: "secondary",
      // hidden: true,
      disabled: true,
      hidden: tableType !== "created" && tableType !== "all",
    },
    {
      key: "archive",
      label: "Archive",
      description: "Move to archived items",
      icon: HiOutlineArchiveBox,
      onClick: () => onArchiveCase?.(caseItem),
      disabled: caseItem.status?.name === "archived" || true,
      group: "actions",
      // hidden: true,
      hidden: tableType !== "created" && tableType !== "all",
    },
    {
      key: "delete",
      label: "Delete",
      description: "Permanently remove case",
      icon: HiOutlineTrash,
      onClick: () => onDeleteCase?.(caseItem),
      variant: "danger",
      group: "danger",
      // hidden: true,
      hidden: tableType !== "created" && tableType !== "all",
    },
  ];

  if (isLoading) {
    return (
      <TableContainer>
        <EmptyState>
          <Text>Loading cases...</Text>
        </EmptyState>
      </TableContainer>
    );
  }

  if (caseData.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <Text size="lg" color="muted">
            No cases found
          </Text>
          <Text size="sm" color="muted">
            There are no case entries to display.
          </Text>
        </EmptyState>
      </TableContainer>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div>
        {caseData.map((caseItem) => (
          <MobileCard key={caseItem.id}>
            <MobileCardHeader>
              <div style={{ flex: 1 }}>
                <CaseTitle
                  size="sm"
                  weight="semibold"
                  onClick={() => onViewCase?.(caseItem)}
                >
                  {caseItem.title}
                </CaseTitle>
                <CaseNumber size="xs">{caseItem.caseNumber}</CaseNumber>
              </div>
              {/* <UrgencyIndicator $level={caseItem.urgencyLevel}>
                {caseItem.urgencyLevel?.toUpperCase() || "NORMAL"}
              </UrgencyIndicator> */}
            </MobileCardHeader>

            <MobileCardContent>
              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Status
                </Text>
                <StatusBadge
                  content={caseItem.status?.name || "Open"}
                  size="sm"
                  style={getColorStyles(
                    caseItem.status?.color || "--color-grey-200"
                  )}
                />
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Priority
                </Text>
                <StatusBadge
                  content={caseItem.priority?.name || "Normal"}
                  size="sm"
                  style={getColorStyles(
                    caseItem.priority?.color || "--color-grey-200"
                  )}
                />
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Category
                </Text>
                <Text size="sm">{caseItem.category?.name || "N/A"}</Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Submitted By
                </Text>
                <Text size="sm">
                  {getUserDisplayName(caseItem.submittedBy) || "Anonymous"}
                </Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Assigned To
                </Text>
                <Text size="sm">
                  {caseItem.assignedTo?.firstName
                    ? getUserDisplayName(caseItem.assignedTo)
                    : "Unassigned"}
                </Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Date
                </Text>
                <Text size="sm">{formatRelativeTime(caseItem.createdAt)}</Text>
              </MobileCardField>
            </MobileCardContent>

            <MobileCardActions>
              <ContextMenu
                items={getContextMenuItems(caseItem)}
                header="Case Actions"
              />
            </MobileCardActions>
          </MobileCard>
        ))}
      </div>
    );
  }

  // Desktop view
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Case</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>
              {tableType === "created" ? "Assigned To" : "Submitted By"}
            </TableHeaderCell>
            <TableHeaderCell>
              {tableType === "created" || tableType === "all"
                ? "Date"
                : "Assigned Date"}
            </TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {caseData.map((caseItem) => (
            <TableRow
              key={caseItem.id}
              onClick={(e) => handleRowClick(caseItem, e)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>
                <div>
                  <CaseTitle
                    size="sm"
                    weight="semibold"
                    onClick={() => onViewCase?.(caseItem)}
                  >
                    {caseItem.title}
                  </CaseTitle>
                  <CaseNumber size="xs">{caseItem.caseNumber}</CaseNumber>
                </div>
              </TableCell>

              <TableCell>
                <StatusBadge
                  content={caseItem.status?.name || "Open"}
                  size="sm"
                  style={getColorStyles(
                    caseItem.status?.color || "--color-grey-200"
                  )}
                />
              </TableCell>

              <TableCell>
                <StatusBadge
                  content={caseItem.priority?.name || "Normal"}
                  size="sm"
                  style={getColorStyles(
                    caseItem.priority?.color || "--color-grey-200"
                  )}
                />
              </TableCell>

              <TableCell>
                <Text size="sm">{caseItem.category?.name || "N/A"}</Text>
              </TableCell>

              <TableCell>
                <Text size="sm">
                  {/* <Avatar
                    name={getUserDisplayName(caseItem.submittedBy)}
                    src={caseItem.submittedBy?.profilePicture}
                    size="sm"
                  /> */}

                  {tableType === "created"
                    ? caseItem.assignedTo !== null &&
                      caseItem.assignedTo !== undefined
                      ? getUserDisplayName(caseItem.assignedTo)
                      : "Not Assigned Yet"
                    : caseItem.submittedBy !== null &&
                      caseItem.submittedBy !== undefined
                    ? getUserDisplayName(caseItem.submittedBy)
                    : "Anonymous"}
                </Text>
              </TableCell>

              <TableCell>
                <Text size="sm" color="muted">
                  {tableType === "created" || tableType === "all"
                    ? formatRelativeTime(caseItem.createdAt)
                    : formatRelativeTime(caseItem.assignedAt)}
                </Text>
              </TableCell>

              <ActionsCell>
                <ContextMenu
                  items={getContextMenuItems(caseItem)}
                  header="Case Actions"
                />
              </ActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

CaseTable.propTypes = {
  caseData: PropTypes.array,
  isLoading: PropTypes.bool,
  onViewCase: PropTypes.func,
  onEditCase: PropTypes.func,
  onDeleteCase: PropTypes.func,
  onArchiveCase: PropTypes.func,
  onAssignCase: PropTypes.func,
  onUpdateStatus: PropTypes.func,
  onDuplicateCase: PropTypes.func,
  onMarkPriority: PropTypes.func,
  onAddComment: PropTypes.func,
  onEscalateCase: PropTypes.func,
};

export default CaseTable;
