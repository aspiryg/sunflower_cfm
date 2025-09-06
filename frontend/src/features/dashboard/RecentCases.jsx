import styled from "styled-components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
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
import { getColorStyles } from "../../utils/caseUtils";
import { getUserDisplayName } from "../../utils/userUtils";

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

const CasesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 50rem;
  overflow-y: auto;
`;

const CaseItem = styled.div`
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

const CaseContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
`;

const CaseTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CaseMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;
`;

const CaseActions = styled.div`
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

function RecentCases({ cases = [], isLoading, error, onViewCase, onRefresh }) {
  const navigate = useNavigate();
  const handleViewAll = () => {
    // Navigate to cases list page
    navigate(`/cases`);
  };

  if (isLoading) {
    return (
      <RecentCard>
        <RecentHeader>
          <RecentTitle size="md">Recent Cases</RecentTitle>
        </RecentHeader>
        <LoadingState>
          <LoadingSpinner size="medium" />
          <Text size="sm" color="muted">
            Loading recent cases...
          </Text>
        </LoadingState>
      </RecentCard>
    );
  }

  if (error) {
    return (
      <RecentCard>
        <RecentHeader>
          <RecentTitle size="md">Recent Cases</RecentTitle>
          <IconButton variant="ghost" size="small" onClick={onRefresh}>
            <HiOutlineArrowPath />
          </IconButton>
        </RecentHeader>
        <ErrorState>
          <Text size="sm" color="error" weight="medium">
            Failed to load recent cases
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
          <RecentTitle size="md">Recent Cases</RecentTitle>
          <Text size="sm" color="muted">
            {cases.length} {cases.length === 1 ? "case" : "cases"}
          </Text>
        </div>
        <IconButton variant="ghost" size="small" onClick={onRefresh}>
          <HiOutlineArrowPath />
        </IconButton>
      </RecentHeader>

      {cases.length === 0 ? (
        <EmptyState>
          <Text size="lg" color="muted">
            No recent cases
          </Text>
          <Text size="sm" color="muted">
            Recent case submissions will appear here
          </Text>
        </EmptyState>
      ) : (
        <>
          <CasesList>
            {cases.map((caseItem) => (
              <CaseItem
                key={caseItem.id}
                onClick={() => onViewCase?.(caseItem)}
              >
                <CaseContent>
                  <CaseTitle size="sm">{caseItem.title}</CaseTitle>

                  <CaseMeta>
                    <StatusBadge
                      content={caseItem.status?.name || "Unknown"}
                      size="xs"
                      style={getColorStyles(
                        caseItem.status?.color || "--color-grey-200"
                      )}
                    />
                    <StatusBadge
                      content={caseItem.priority?.name || "Unknown"}
                      size="xs"
                      style={getColorStyles(
                        caseItem.priority?.color || "--color-grey-200"
                      )}
                    />
                    <Text size="xs" color="muted">
                      {formatRelativeTime(caseItem.createdAt)}
                    </Text>
                  </CaseMeta>

                  <Text size="xs" color="muted">
                    {caseItem.providerDetails?.organizationName ||
                      (caseItem.providerDetails?.contactPersonName
                        ? `${caseItem.providerDetails.contactPersonName}`
                        : caseItem.submittedBy
                        ? getUserDisplayName(caseItem.submittedBy)
                        : "Anonymous")}
                  </Text>

                  {caseItem.assignedTo && (
                    <Text size="xs" color="muted">
                      Assigned to: {getUserDisplayName(caseItem.assignedTo)}
                    </Text>
                  )}
                </CaseContent>

                <CaseActions>
                  <IconButton
                    variant="ghost"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewCase?.(caseItem);
                    }}
                  >
                    <HiOutlineEye />
                  </IconButton>

                  <Text size="xs" color="muted">
                    #{caseItem.caseNumber}
                  </Text>
                </CaseActions>
              </CaseItem>
            ))}
          </CasesList>

          <ViewAllButton
            variant="secondary"
            size="small"
            onClick={handleViewAll}
          >
            <HiOutlineArrowTopRightOnSquare />
            View All Cases
          </ViewAllButton>
        </>
      )}
    </RecentCard>
  );
}

RecentCases.propTypes = {
  cases: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
  onViewCase: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default RecentCases;
