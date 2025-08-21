import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineUserPlus,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineArrowPath,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import StatusBadge from "../../../ui/StatusBadge";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import Button from "../../../ui/Button";
import Avatar from "../../../ui/Avatar";
import { useFeedbackHistory } from "../useFeedback";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";

const TimelineContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 80rem;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const TimelineList = styled.div`
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 2rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(
      to bottom,
      var(--color-brand-200),
      var(--color-grey-200)
    );

    @media (max-width: 640px) {
      left: 1.5rem;
    }
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding: 0 0 var(--spacing-6) 5rem;
  min-height: 8rem;

  &:last-child {
    padding-bottom: 0;
  }

  @media (max-width: 640px) {
    padding-left: 4rem;
    min-height: 6rem;
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--color-grey-0);
  z-index: 2;

  ${(props) => {
    switch (props.$variant) {
      case "creation":
        return `
          background-color: var(--color-success-500);
          color: var(--color-grey-0);
        `;
      case "status_change":
        return `
          background-color: var(--color-brand-500);
          color: var(--color-grey-0);
        `;
      case "assignment_change":
        return `
          background-color: var(--color-warning-500);
          color: var(--color-grey-0);
        `;
      case "comment":
        return `
          background-color: var(--color-info-500);
          color: var(--color-grey-0);
        `;
      case "error":
        return `
          background-color: var(--color-error-500);
          color: var(--color-grey-0);
        `;
      default:
        return `
          background-color: var(--color-grey-500);
          color: var(--color-grey-0);
        `;
    }
  }}

  @media (max-width: 640px) {
    width: 3rem;
    height: 3rem;
  }

  svg {
    width: 2rem;
    height: 2rem;

    @media (max-width: 640px) {
      width: 1.6rem;
      height: 1.6rem;
    }
  }
`;

const TimelineContent = styled(Card)`
  padding: var(--spacing-4);
  margin-left: var(--spacing-2);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 640px) {
    margin-left: 0;
    padding: var(--spacing-3);
  }
`;

const TimelineHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
  gap: var(--spacing-3);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: var(--spacing-2);
  }
`;

const TimelineTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
`;

const TimelineTimestamp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`;

const TimelineDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const TimelineUser = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const UserAvatar = styled.div`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
`;

const ChangeDetails = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
`;

const EmptyState = styled(Card)`
  padding: var(--spacing-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
`;

const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background-color: var(--color-grey-100);
  color: var(--color-grey-400);
  border-radius: 50%;

  svg {
    width: 3rem;
    height: 3rem;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
`;

const ErrorState = styled(Card)`
  padding: var(--spacing-6);
  border: 1px solid var(--color-error-200);
  background-color: var(--color-error-25);
  text-align: center;
`;

// Helper function to get icon for action type
const getActionIcon = (actionType) => {
  switch (actionType?.toLowerCase()) {
    case "creation":
      return HiOutlineCheckCircle;
    case "status_change":
      return HiOutlineFlag;
    case "assignment_change":
      return HiOutlineUserPlus;
    case "comment":
      return HiOutlineDocumentText;
    default:
      return HiOutlineArrowPath;
  }
};

// Helper function to get action variant for styling
const getActionVariant = (actionType) => {
  switch (actionType?.toLowerCase()) {
    case "creation":
      return "creation";
    case "status_change":
      return "status_change";
    case "assignment_change":
      return "assignment_change";
    case "comment":
      return "comment";
    default:
      return "default";
  }
};

// Helper function to get user initials
// const getUserInitials = (user) => {
//   if (!user) return "?";
//   if (user.firstName && user.lastName) {
//     return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
//   }
//   if (user.username) {
//     return user.username.substring(0, 2).toUpperCase();
//   }
//   return "U";
// };

// Helper function to get user display name
const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.username) {
    return user.username;
  }
  return "Unknown User";
};

// Helper function to format action description
const getActionDescription = (historyItem) => {
  const { actionType, status, oldValue, newValue, assignedTo } = historyItem;

  switch (actionType?.toLowerCase()) {
    case "creation":
      return "Feedback was created";
    case "status_change":
      if (oldValue && newValue) {
        return `Status changed from ${oldValue} to ${newValue}`;
      }
      return `Status updated to ${status}`;
    case "assignment_change":
      if (assignedTo) {
        return `Assigned to ${getUserDisplayName(assignedTo)}`;
      }
      return "Assignment updated";
    case "comment":
      return "Added a comment";
    default:
      return "Activity recorded";
  }
};

/**
 * Feedback Timeline Component
 *
 * Displays a comprehensive timeline of all feedback activities,
 * including status changes, assignments, comments, and other updates
 */
function FeedbackTimeline({ /*feedback,*/ feedbackId, onRefresh }) {
  const [showAll, setShowAll] = useState(false);

  const {
    data: historyData,
    isLoading,
    error,
    refetch,
    isError,
  } = useFeedbackHistory(feedbackId);

  const handleRefresh = () => {
    refetch();
    if (onRefresh) onRefresh();
  };

  const history = historyData?.data || [];
  const displayedHistory = showAll ? history : history.slice(0, 10);

  // Loading state
  if (isLoading) {
    return (
      <TimelineContainer>
        <LoadingState>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading timeline...
          </Text>
        </LoadingState>
      </TimelineContainer>
    );
  }

  // Error state
  if (isError) {
    return (
      <TimelineContainer>
        <ErrorState>
          <Text size="lg" weight="semibold" color="error">
            Failed to load timeline
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            {error?.message ||
              "Something went wrong while loading the timeline."}
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={handleRefresh}
            style={{ marginTop: "var(--spacing-3)" }}
          >
            <HiOutlineArrowPath />
            Try Again
          </Button>
        </ErrorState>
      </TimelineContainer>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <TimelineContainer>
        <EmptyState>
          <EmptyIcon>
            <HiOutlineClock />
          </EmptyIcon>
          <Text size="lg" weight="semibold" color="muted">
            No timeline data available
          </Text>
          <Text size="sm" color="muted">
            Timeline activities will appear here as the feedback progresses.
          </Text>
          <Button variant="secondary" size="small" onClick={handleRefresh}>
            <HiOutlineArrowPath />
            Refresh Timeline
          </Button>
        </EmptyState>
      </TimelineContainer>
    );
  }

  return (
    <TimelineContainer>
      {/* Header */}
      <TimelineHeader>
        <div>
          <Text size="lg" weight="semibold">
            Activity Timeline
          </Text>
          <Text size="sm" color="muted">
            {history.length} {history.length === 1 ? "activity" : "activities"}{" "}
            recorded
          </Text>
        </div>
        <Button variant="ghost" size="small" onClick={handleRefresh}>
          <HiOutlineArrowPath />
          Refresh
        </Button>
      </TimelineHeader>

      {/* Timeline */}
      <TimelineList>
        {displayedHistory.map((item, index) => {
          const IconComponent = getActionIcon(item.actionType);
          const variant = getActionVariant(item.actionType);

          return (
            <TimelineItem key={item.id || index}>
              <TimelineIcon $variant={variant}>
                <IconComponent />
              </TimelineIcon>

              <TimelineContent>
                <TimelineHeader2>
                  <div style={{ flex: 1 }}>
                    <TimelineTitle size="sm">
                      {getActionDescription(item)}
                    </TimelineTitle>

                    <TimelineUser>
                      <Avatar
                        src={item.updatedBy?.profilePicture}
                        name={getUserDisplayName(item.updatedBy)}
                        size="sm"
                      />
                      {/* <UserAvatar>{getUserInitials(item.updatedBy)}</UserAvatar> */}
                      <Text size="sm" color="muted">
                        {getUserDisplayName(item.updatedBy)}
                      </Text>
                    </TimelineUser>
                  </div>

                  <TimelineTimestamp>
                    <Text size="xs" color="muted">
                      {formatRelativeTime(item.updatedAt)}
                    </Text>
                    <Text size="xs" color="muted">
                      {formatDate(item.updatedAt, "MMM dd, yyyy HH:mm")}
                    </Text>
                  </TimelineTimestamp>
                </TimelineHeader2>

                <TimelineDetails>
                  {/* Status change details */}
                  {item.actionType?.toLowerCase() === "status_change" && (
                    <ChangeDetails>
                      {item.oldValue && (
                        <ChangeItem>
                          <Text size="xs" color="muted">
                            From:
                          </Text>
                          <StatusBadge content={item.oldValue} size="xs" />
                        </ChangeItem>
                      )}
                      <ChangeItem>
                        <Text size="xs" color="muted">
                          To:
                        </Text>
                        <StatusBadge
                          content={item.newValue || item.status}
                          size="xs"
                        />
                      </ChangeItem>
                    </ChangeDetails>
                  )}

                  {/* Assignment details */}
                  {item.actionType?.toLowerCase() === "assignment_change" &&
                    item.assignedTo && (
                      <ChangeDetails>
                        <ChangeItem>
                          <HiOutlineUser size={12} />
                          <Text size="xs">
                            {getUserDisplayName(item.assignedTo)}
                          </Text>
                        </ChangeItem>
                      </ChangeDetails>
                    )}

                  {/* Comments */}
                  {item.comments && (
                    <div
                      style={{
                        padding: "var(--spacing-2)",
                        backgroundColor: "var(--color-grey-25)",
                        borderRadius: "var(--border-radius-sm)",
                        borderLeft: "3px solid var(--color-brand-200)",
                      }}
                    >
                      <Text size="sm" style={{ fontStyle: "italic" }}>
                        "{item.comments}"
                      </Text>
                    </div>
                  )}

                  {/* Feedback context */}
                  {item.feedback && (
                    <Text size="xs" color="muted">
                      Feedback: {item.feedback.title || item.feedback.number}
                    </Text>
                  )}
                </TimelineDetails>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </TimelineList>

      {/* Show more button */}
      {history.length > 10 && (
        <div style={{ textAlign: "center", marginTop: "var(--spacing-4)" }}>
          <Button
            variant="ghost"
            size="medium"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show All ${history.length} Activities`}
          </Button>
        </div>
      )}
    </TimelineContainer>
  );
}

FeedbackTimeline.propTypes = {
  feedback: PropTypes.object.isRequired,
  feedbackId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default FeedbackTimeline;
