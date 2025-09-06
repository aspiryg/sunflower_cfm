import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineArrowPath,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineUser,
} from "react-icons/hi2";

import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import Heading from "../../../ui/Heading";
import Avatar from "../../../ui/Avatar";
import { formatRelativeTime } from "../../../utils/dateUtils";
import { getUserDisplayName, getUserRole } from "../../../utils/userUtils";

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const StatCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  background: linear-gradient(
    135deg,
    var(--color-grey-0),
    var(--color-grey-25)
  );
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    border-color: var(--color-brand-200);
    box-shadow: var(--shadow-md);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  border-radius: var(--border-radius-md);
  background: linear-gradient(
    135deg,
    var(--color-brand-500),
    var(--color-brand-400)
  );
  color: var(--color-grey-0);

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const StatValue = styled.div`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
`;

const StatLabel = styled(Text)`
  color: var(--color-grey-600);
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-sm);
`;

const CurrentAssigneeCard = styled(Card)`
  padding: var(--spacing-4);
  border: 2px solid var(--color-success-200);
  background: linear-gradient(
    135deg,
    var(--color-success-25),
    var(--color-success-50)
  );
`;

const AssigneeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-top: var(--spacing-3);
`;

const AssigneeDetails = styled.div`
  flex: 1;
`;

/**
 * Case Assignment Statistics Component
 *
 * Displays key metrics and current assignment information
 */
function CaseAssignmentStats({ assignmentData, case: caseData }) {
  if (!assignmentData) {
    return (
      <StatsContainer>
        <StatCard>
          <Text color="muted" size="sm">
            No assignment data available
          </Text>
        </StatCard>
      </StatsContainer>
    );
  }

  const { stats, assignments = [] } = assignmentData;
  //   console.log("Assignment Stats:", assignmentData);

  const currentAssignee = caseData?.assignedTo;
  const totalAssignments = assignments.length;
  const uniqueAssignees = [
    ...new Set(assignments.map((a) => a.assignedTo?.id).filter(Boolean)),
  ].length;

  // Calculate assignment duration
  const firstAssignment = assignments[assignments.length - 1]; // oldest first (reversed)
  const lastAssignment = assignments[0]; // newest first

  //   console.log("First Assignment:", firstAssignment.createdAt);
  //   console.log("Last Assignment:", lastAssignment.createdAt);
  const totalDurationMs =
    firstAssignment && lastAssignment
      ? new Date(lastAssignment.createdAt) - new Date(firstAssignment.createdAt)
      : 0;

  const totalDurationDays = Math.floor(totalDurationMs / (1000 * 60 * 60 * 24));
  const averageDurationDays =
    totalAssignments > 1
      ? Math.floor(totalDurationDays / (totalAssignments - 1))
      : 0;

  return (
    <StatsContainer>
      {/* Current Assignee */}
      {currentAssignee && (
        <CurrentAssigneeCard>
          <StatHeader>
            <StatIcon
              style={{
                background:
                  "linear-gradient(135deg, var(--color-success-500), var(--color-success-400))",
              }}
            >
              <HiOutlineUser />
            </StatIcon>
            <div>
              <Heading as="h4" size="h5">
                Current Assignee
              </Heading>
              <StatLabel size="sm">Active assignment</StatLabel>
            </div>
          </StatHeader>

          <AssigneeInfo>
            <Avatar
              src={currentAssignee?.profilePicture}
              name={getUserDisplayName(currentAssignee)}
              size="md"
              status={currentAssignee?.isOnline ? "online" : "offline"}
              showStatus={true}
            />
            <AssigneeDetails>
              <Text size="md" weight="semibold">
                {getUserDisplayName(currentAssignee)}
              </Text>
              <Text size="sm" color="muted">
                {getUserRole(currentAssignee) || "No role specified"}
              </Text>
              <Text size="xs" color="muted">
                Assigned {formatRelativeTime(lastAssignment?.createdAt)}
              </Text>
            </AssigneeDetails>
          </AssigneeInfo>
        </CurrentAssigneeCard>
      )}

      {/* Assignment Count */}
      <StatCard>
        <StatHeader>
          <StatIcon>
            <HiOutlineArrowPath />
          </StatIcon>
          <div>
            <Heading as="h4" size="h5">
              Total Assignments
            </Heading>
            <StatLabel size="sm">Assignment changes</StatLabel>
          </div>
        </StatHeader>

        <StatContent>
          <StatValue>{totalAssignments}</StatValue>
          <Text size="sm" color="muted">
            {totalAssignments === 1 ? "assignment" : "assignments"} throughout
            case lifetime
          </Text>
        </StatContent>

        <DetailsList>
          <DetailItem>
            <Text size="sm">Unique assignees</Text>
            <Text size="sm" weight="medium">
              {uniqueAssignees}
            </Text>
          </DetailItem>
          <DetailItem>
            <Text size="sm">First assigned</Text>
            <Text size="sm" weight="medium">
              {firstAssignment
                ? formatRelativeTime(firstAssignment.createdAt)
                : "Never"}
            </Text>
          </DetailItem>
          <DetailItem>
            <Text size="sm">Last change</Text>
            <Text size="sm" weight="medium">
              {lastAssignment
                ? formatRelativeTime(lastAssignment.createdAt)
                : "Never"}
            </Text>
          </DetailItem>
        </DetailsList>
      </StatCard>

      {/* Assignment Duration */}
      <StatCard>
        <StatHeader>
          <StatIcon
            style={{
              background:
                "linear-gradient(135deg, var(--color-warning-500), var(--color-warning-400))",
            }}
          >
            <HiOutlineClock />
          </StatIcon>
          <div>
            <Heading as="h4" size="h5">
              Assignment Timeline
            </Heading>
            <StatLabel size="sm">Duration metrics</StatLabel>
          </div>
        </StatHeader>

        <StatContent>
          <StatValue>
            {totalDurationDays > 0 ? `${totalDurationDays} days` : "< 1 day"}
          </StatValue>
          <Text size="sm" color="muted">
            Total time since first assignment
          </Text>
        </StatContent>

        <DetailsList>
          <DetailItem>
            <Text size="sm">Average per assignee</Text>
            <Text size="sm" weight="medium">
              {averageDurationDays > 0
                ? `${averageDurationDays} days`
                : "< 1 day"}
            </Text>
          </DetailItem>
          {currentAssignee && lastAssignment && (
            <DetailItem>
              <Text size="sm">Current duration</Text>
              <Text size="sm" weight="medium">
                {Math.floor(
                  (new Date() - new Date(lastAssignment.updatedAt)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </Text>
            </DetailItem>
          )}
        </DetailsList>
      </StatCard>

      {/* Case Progress */}
      <StatCard>
        <StatHeader>
          <StatIcon
            style={{
              background:
                "linear-gradient(135deg, var(--color-info-500), var(--color-info-400))",
            }}
          >
            <HiOutlineChartBar />
          </StatIcon>
          <div>
            <Heading as="h4" size="h5">
              Case Progress
            </Heading>
            <StatLabel size="sm">Current status</StatLabel>
          </div>
        </StatHeader>

        <StatContent>
          <StatValue>
            {caseData.status?.name?.toUpperCase() || "UNKNOWN"}
          </StatValue>
          <Text size="sm" color="muted">
            Priority: {caseData.priority?.name || "Normal"} • Category:{" "}
            {caseData.category?.name || "Uncategorized"}
          </Text>
        </StatContent>

        <DetailsList>
          <DetailItem>
            <Text size="sm">Case created</Text>
            <Text size="sm" weight="medium">
              {formatRelativeTime(caseData.createdAt)}
            </Text>
          </DetailItem>
          <DetailItem>
            <Text size="sm">Last updated</Text>
            <Text size="sm" weight="medium">
              {formatRelativeTime(caseData.updatedAt)}
            </Text>
          </DetailItem>
          <DetailItem>
            <Text size="sm">Case number</Text>
            <Text
              size="sm"
              weight="medium"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {caseData.caseNumber}
            </Text>
          </DetailItem>
        </DetailsList>
      </StatCard>
    </StatsContainer>
  );
}

CaseAssignmentStats.propTypes = {
  assignmentData: PropTypes.shape({
    assignments: PropTypes.array,
    stats: PropTypes.object,
  }),
  case: PropTypes.object.isRequired,
};

export default CaseAssignmentStats;
