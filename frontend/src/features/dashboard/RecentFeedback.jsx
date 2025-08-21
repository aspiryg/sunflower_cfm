import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineEye,
  HiOutlineArrowPath,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import StatusBadge from "../../ui/StatusBadge";
import LoadingSpinner from "../../ui/LoadingSpinner";
import { formatRelativeTime } from "../../utils/dateUtils";

const RecentCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  display: flex;
  flex-direction: column;
  height: fit-content;
`;

const RecentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const RecentTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 50rem;
  overflow-y: auto;
`;

const FeedbackItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;

  &:hover {
    background-color: var(--color-grey-50);
    border-color: var(--color-brand-200);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FeedbackContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
`;

const FeedbackTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const FeedbackMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;
`;

const FeedbackActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  align-items: flex-end;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
  text-align: center;
  color: var(--color-grey-500);
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  text-align: center;
  background-color: var(--color-error-25);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-6);
`;

const ViewAllButton = styled(Button)`
  margin-top: var(--spacing-3);
  align-self: stretch;
`;

function RecentFeedback({
  feedback = [],
  isLoading,
  error,
  onViewFeedback,
  onRefresh,
}) {
  const handleViewAll = () => {
    // Navigate to feedback list page
    window.location.href = "/feedback";
  };

  if (isLoading) {
    return (
      <RecentCard>
        <RecentHeader>
          <RecentTitle size="md">Recent Feedback</RecentTitle>
        </RecentHeader>
        <LoadingState>
          <LoadingSpinner size="medium" />
          <Text size="sm" color="muted">
            Loading recent feedback...
          </Text>
        </LoadingState>
      </RecentCard>
    );
  }

  if (error) {
    return (
      <RecentCard>
        <RecentHeader>
          <RecentTitle size="md">Recent Feedback</RecentTitle>
          <IconButton variant="ghost" size="small" onClick={onRefresh}>
            <HiOutlineArrowPath />
          </IconButton>
        </RecentHeader>
        <ErrorState>
          <Text size="sm" color="error" weight="medium">
            Failed to load recent feedback
          </Text>
          <Text size="xs" color="muted">
            {error?.message || "Something went wrong"}
          </Text>
          <Button variant="secondary" size="small" onClick={onRefresh}>
            Try Again
          </Button>
        </ErrorState>
      </RecentCard>
    );
  }

  return (
    <RecentCard>
      <RecentHeader>
        <div>
          <RecentTitle size="md">Recent Feedback</RecentTitle>
          <Text size="sm" color="muted">
            {feedback.length} {feedback.length === 1 ? "item" : "items"}
          </Text>
        </div>
        <IconButton variant="ghost" size="small" onClick={onRefresh}>
          <HiOutlineArrowPath />
        </IconButton>
      </RecentHeader>

      {feedback.length === 0 ? (
        <EmptyState>
          <Text size="lg" color="muted">
            No recent feedback
          </Text>
          <Text size="sm" color="muted">
            Recent feedback submissions will appear here
          </Text>
        </EmptyState>
      ) : (
        <>
          <FeedbackList>
            {feedback.map((item) => (
              <FeedbackItem
                key={item.id}
                onClick={() => onViewFeedback?.(item)}
              >
                <FeedbackContent>
                  <FeedbackTitle size="sm">{item.title}</FeedbackTitle>

                  <FeedbackMeta>
                    <StatusBadge content={item.status} size="xs" />
                    <StatusBadge content={item.priority} size="xs" />
                    <Text size="xs" color="muted">
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                  </FeedbackMeta>

                  <Text size="xs" color="muted">
                    {item.providerName || item.submittedBy?.firstName
                      ? `${item.submittedBy.firstName} ${item.submittedBy.lastName}`
                      : "Anonymous"}
                  </Text>
                </FeedbackContent>

                <FeedbackActions>
                  <IconButton
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewFeedback?.(item);
                    }}
                  >
                    <HiOutlineEye />
                  </IconButton>

                  <Text size="xs" color="muted">
                    #{item.feedbackNumber}
                  </Text>
                </FeedbackActions>
              </FeedbackItem>
            ))}
          </FeedbackList>

          <ViewAllButton
            variant="secondary"
            size="small"
            onClick={handleViewAll}
          >
            <HiOutlineArrowTopRightOnSquare />
            View All Feedback
          </ViewAllButton>
        </>
      )}
    </RecentCard>
  );
}

RecentFeedback.propTypes = {
  feedback: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
  onViewFeedback: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default RecentFeedback;
