import styled /*, { css }*/ from "styled-components";
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
} from "react-icons/hi2";
import Text from "../../ui/Text";
import StatusBadge from "../../ui/StatusBadge";
import ContextMenu from "../../ui/ContextMenu";
import { /*formatDate,*/ formatRelativeTime } from "../../utils/dateUtils";
import { useMediaQuery } from "../../hooks/useMediaQuery";
// import { useNavigate } from "react-router-dom";

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

const FeedbackTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  cursor: pointer;

  &:hover {
    color: var(--color-brand-600);
  }
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

function FeedbackTable({
  feedbackData = [],
  isLoading = false,
  onViewFeedback,
  onEditFeedback,
  onDeleteFeedback,
  onArchiveFeedback,
  onAssignFeedback,
  onUpdateStatus,
  onDuplicateFeedback,
  onMarkPriority,
  onAddComment,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  // const navigate = useNavigate();

  const handleRowClick = (feedback, event) => {
    // Don't trigger row click if clicking on action buttons
    if (event.target.closest("button")) return;

    if (onViewFeedback) {
      onViewFeedback(feedback);
    }
  };

  const getContextMenuItems = (feedback) => [
    {
      key: "view",
      label: "View Details",
      description: "Open feedback in detail view",
      icon: HiOutlineEye,
      onClick: () => onViewFeedback?.(feedback),
      variant: "primary",
      group: "primary",
    },
    {
      key: "edit",
      label: "Edit Feedback",
      description: "Modify feedback information",
      icon: HiOutlinePencil,
      onClick: () => onEditFeedback?.(feedback),
      group: "primary",
    },
    {
      key: "status",
      label: "Update Status",
      description: "Change feedback status",
      icon: HiOutlineFlag,
      onClick: () => onUpdateStatus?.(feedback), // Add this line
      group: "secondary",
    },
    {
      key: "assign",
      label: "Assign to User",
      description: "Assign feedback to team member",
      icon: HiOutlineUserPlus,
      onClick: () => onAssignFeedback?.(feedback),
      group: "secondary",
    },
    {
      key: "comment",
      label: "Add Comment",
      description: "Add internal comment or note",
      icon: HiOutlineChatBubbleLeft,
      onClick: () => onAddComment?.(feedback),
      group: "secondary",
    },
    {
      key: "priority",
      label: "Mark as Priority",
      description: "Change priority level",
      icon: HiOutlineFlag,
      onClick: () => onMarkPriority?.(feedback),
      disabled: feedback.priority === "urgent",
      group: "secondary",
    },
    {
      key: "duplicate",
      label: "Duplicate",
      description: "Create a copy of this feedback",
      icon: HiOutlineDocumentDuplicate,
      onClick: () => onDuplicateFeedback?.(feedback),
      group: "secondary",
    },
    {
      key: "archive",
      label: "Archive",
      description: "Move to archived items",
      icon: HiOutlineArchiveBox,
      onClick: () => onArchiveFeedback?.(feedback),
      disabled: feedback.status === "archived",
      group: "actions",
    },
    {
      key: "delete",
      label: "Delete",
      description: "Permanently remove feedback",
      icon: HiOutlineTrash,
      onClick: () => onDeleteFeedback?.(feedback),
      variant: "danger",
      group: "danger",
    },
  ];

  if (isLoading) {
    return (
      <TableContainer>
        <EmptyState>
          <Text>Loading feedback...</Text>
        </EmptyState>
      </TableContainer>
    );
  }

  if (feedbackData.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <Text size="lg" color="muted">
            No feedback found
          </Text>
          <Text size="sm" color="muted">
            There are no feedback entries to display.
          </Text>
        </EmptyState>
      </TableContainer>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div>
        {feedbackData.map((feedback) => (
          <MobileCard key={feedback.id}>
            <MobileCardHeader>
              <div style={{ flex: 1 }}>
                <FeedbackTitle
                  size="sm"
                  weight="semibold"
                  onClick={() => onViewFeedback?.(feedback)}
                >
                  {feedback.title}
                </FeedbackTitle>
                <Text size="xs" color="muted">
                  {feedback.feedbackNumber}
                </Text>
              </div>
              <StatusBadge content={feedback.priority} size="sm" />
            </MobileCardHeader>

            <MobileCardContent>
              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Status
                </Text>
                <StatusBadge content={feedback.status} size="sm" />
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Category
                </Text>
                <Text size="sm">{feedback.category?.name || "N/A"}</Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Submitted By
                </Text>
                <Text size="sm">
                  {feedback.submittedBy?.firstName
                    ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
                    : "Anonymous"}
                </Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Date
                </Text>
                <Text size="sm">{formatRelativeTime(feedback.createdAt)}</Text>
              </MobileCardField>
            </MobileCardContent>

            <MobileCardActions>
              <ContextMenu
                items={getContextMenuItems(feedback)}
                header="Feedback Actions"
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
            <TableHeaderCell>Feedback</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
            <TableHeaderCell>Category</TableHeaderCell>
            <TableHeaderCell>Submitted By</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {feedbackData.map((feedback) => (
            <TableRow
              key={feedback.id}
              onClick={(e) => handleRowClick(feedback, e)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>
                <div>
                  <FeedbackTitle
                    size="sm"
                    weight="semibold"
                    onClick={() => onViewFeedback?.(feedback)}
                  >
                    {feedback.title}
                  </FeedbackTitle>
                  <Text size="xs" color="muted">
                    {feedback.feedbackNumber}
                  </Text>
                </div>
              </TableCell>

              <TableCell>
                <StatusBadge content={feedback.status} size="sm" />
              </TableCell>

              <TableCell>
                <StatusBadge content={feedback.priority} size="sm" />
              </TableCell>

              <TableCell>
                <Text size="sm">{feedback.category?.name || "N/A"}</Text>
              </TableCell>

              <TableCell>
                <Text size="sm">
                  {feedback.submittedBy?.firstName
                    ? `${feedback.submittedBy.firstName} ${feedback.submittedBy.lastName}`
                    : "Anonymous"}
                </Text>
              </TableCell>

              <TableCell>
                <Text size="sm" color="muted">
                  {formatRelativeTime(feedback.createdAt)}
                </Text>
              </TableCell>

              <ActionsCell>
                <ContextMenu
                  items={getContextMenuItems(feedback)}
                  header="Feedback Actions"
                />
              </ActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

FeedbackTable.propTypes = {
  feedbackData: PropTypes.array,
  isLoading: PropTypes.bool,
  onViewFeedback: PropTypes.func,
  onEditFeedback: PropTypes.func,
  onDeleteFeedback: PropTypes.func,
  onArchiveFeedback: PropTypes.func,
  onAssignFeedback: PropTypes.func,
  onDuplicateFeedback: PropTypes.func,
  onMarkPriority: PropTypes.func,
  onAddComment: PropTypes.func,
};

export default FeedbackTable;
