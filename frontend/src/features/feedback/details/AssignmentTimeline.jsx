import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineCheckCircle,
  // HiOutlineClock,
  HiOutlinePlay,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineChatBubbleLeft,
  HiArrowRight,
  HiSparkles,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import Avatar from "../../../ui/Avatar";
import StatusBadge from "../../../ui/StatusBadge";
import Card from "../../../ui/Card";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";
import { getUserDisplayName } from "../../../utils/userUtils";
import { useMediaQuery } from "../../../hooks/useMediaQuery";

const TimelineContainer = styled.div`
  position: relative;
  padding: var(--spacing-6);
  min-height: 40rem;

  @media (max-width: 768px) {
    padding: var(--spacing-3);
  }
`;

const TimelinePath = styled.div`
  position: absolute;
  left: 3rem;
  top: 6rem;
  bottom: 12rem;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--color-success-400),
    var(--color-brand-400),
    var(--color-warning-400),
    var(--color-grey-300)
  );
  border-radius: var(--border-radius-full);
  z-index: 1;

  @media (max-width: 768px) {
    left: 2.4rem;
  }

  /* Animated gradient effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(99, 102, 241, 0.3),
      transparent
    );
    border-radius: var(--border-radius-full);
    animation: pulse 3s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.8;
    }
  }
`;

const TimelineItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  position: relative;

  @media (max-width: 768px) {
    gap: var(--spacing-4);
  }
`;

const TimelineItem = styled.div`
  position: relative;
  margin-left: 6rem;

  @media (max-width: 768px) {
    margin-left: 5rem;
  }
`;

const AssignmentCard = styled(Card)`
  position: relative;
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  background: var(--color-grey-0);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--color-brand-300);
    box-shadow: var(--shadow-lg);
    transform: translateX(4px) translateY(-2px);
  }

  ${(props) =>
    props.$isExpanded &&
    `
    border-color: var(--color-brand-400);
    box-shadow: var(--shadow-xl);
    transform: translateX(6px) translateY(-4px);
  `}

  /* Left border accent */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${(props) => {
      switch (props.$variant) {
        case "creation":
          return "linear-gradient(to bottom, var(--color-success-400), var(--color-success-500))";
        case "current":
          return "linear-gradient(to bottom, var(--color-warning-400), var(--color-warning-500))";
        default:
          return "linear-gradient(to bottom, var(--color-brand-400), var(--color-brand-500))";
      }
    }};
    border-radius: var(--border-radius-lg) 0 0 var(--border-radius-lg);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-3);
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -4.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--color-grey-0);
  box-shadow: var(--shadow-md);
  z-index: 3;
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) => {
    switch (props.$variant) {
      case "creation":
        return `
          background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
          color: var(--color-grey-0);
        `;
      case "assignment":
        return `
          background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
          color: var(--color-grey-0);
        `;
      case "current":
        return `
          background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
          color: var(--color-grey-0);
        `;
      default:
        return `
          background: linear-gradient(135deg, var(--color-grey-500), var(--color-grey-600));
          color: var(--color-grey-0);
        `;
    }
  }}

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 768px) {
    left: -3.8rem;
    width: 3rem;
    height: 3rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-2);
    margin-bottom: var(--spacing-2);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    gap: var(--spacing-2);
  }
`;

const AssignmentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
    padding: var(--spacing-2);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;

  @media (max-width: 768px) {
    gap: var(--spacing-2);
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const MetaInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--font-size-xs);
  color: var(--color-grey-600);

  svg {
    width: 1.2rem;
    height: 1.2rem;
    color: var(--color-grey-500);
  }

  @media (max-width: 768px) {
    font-size: var(--font-size-2xs);
  }
`;

const ExpandedContent = styled.div`
  margin-top: var(--spacing-3);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    margin-top: var(--spacing-2);
    padding-top: var(--spacing-2);
  }
`;

const CommentsBubble = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-blue-25),
    var(--color-blue-50)
  );
  border: 1px solid var(--color-blue-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-3);
  position: relative;
  margin-top: var(--spacing-2);

  &::before {
    content: "";
    position: absolute;
    top: -8px;
    left: var(--spacing-4);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid var(--color-blue-200);
  }

  &::after {
    content: "";
    position: absolute;
    top: -7px;
    left: calc(var(--spacing-4) + 1px);
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid var(--color-blue-25);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-2);
  }
`;

const NewAssignmentSection = styled.div`
  position: relative;
  margin-left: 6rem;
  margin-top: var(--spacing-6);

  @media (max-width: 768px) {
    margin-left: 5rem;
    margin-top: var(--spacing-4);
  }
`;

const NewAssignmentCard = styled(Card)`
  padding: var(--spacing-5);
  border: 2px dashed var(--color-brand-300);
  background: linear-gradient(
    135deg,
    var(--color-brand-25),
    var(--color-brand-50)
  );
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;
  text-align: center;
  border-radius: var(--border-radius-lg);
  position: relative;

  &:hover {
    border-color: var(--color-brand-500);
    background: linear-gradient(
      135deg,
      var(--color-brand-50),
      var(--color-brand-100)
    );
    transform: translateX(4px) translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const NewAssignmentIcon = styled.div`
  position: absolute;
  left: -4.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 3.6rem;
  height: 3.6rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px dashed var(--color-brand-400);
  background: linear-gradient(
    135deg,
    var(--color-grey-0),
    var(--color-brand-25)
  );
  color: var(--color-brand-500);
  z-index: 3;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background: linear-gradient(
      135deg,
      var(--color-brand-50),
      var(--color-brand-100)
    );
    border-style: solid;
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  @media (max-width: 768px) {
    left: -3.8rem;
    width: 3rem;
    height: 3rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-grey-500);

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const DurationBadge = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-grey-100),
    var(--color-grey-200)
  );
  color: var(--color-grey-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  border: 1px solid var(--color-grey-300);

  @media (max-width: 768px) {
    font-size: var(--font-size-2xs);
    padding: 2px var(--spacing-1);
  }
`;

const MobileMetaInfo = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    font-size: var(--font-size-2xs);
    color: var(--color-grey-600);
    margin-top: var(--spacing-1);
  }
`;

/**
 * Assignment Timeline Component - Clean Left-Border Design
 *
 * Visualizes the assignment history as a timeline with icons positioned
 * alongside the left border for a clean, professional look
 */
function AssignmentTimeline({
  assignmentData,
  feedback,
  // feedbackId,
  onAssign,
  // onRefresh,
}) {
  const [expandedCard, setExpandedCard] = useState(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!assignmentData?.assignments || assignmentData.assignments.length === 0) {
    return (
      <TimelineContainer>
        <EmptyState>
          <HiOutlineUsers size={isMobile ? 32 : 48} />
          <Text
            size={isMobile ? "md" : "lg"}
            weight="semibold"
            style={{ marginTop: "var(--spacing-3)" }}
          >
            No Assignment History
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            This case hasn't been assigned to anyone yet.
          </Text>
          <Button
            variant="primary"
            onClick={onAssign}
            size={isMobile ? "small" : "medium"}
            style={{ marginTop: "var(--spacing-4)" }}
          >
            <HiOutlineUserPlus />
            Assign Now
          </Button>
        </EmptyState>
      </TimelineContainer>
    );
  }

  // Filter for only CREATION and ASSIGNMENT_CHANGE actions
  const filteredAssignments = assignmentData.assignments.filter(
    (assignment) =>
      assignment.actionType === "CREATION" ||
      assignment.actionType === "ASSIGNMENT_CHANGE"
  );

  // console.log("Filtered Assignments:", filteredAssignments);

  const currentAssignee = feedback?.assignedTo;

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const getAssignmentIcon = (assignment, index) => {
    if (assignment.actionType === "CREATION") {
      return HiOutlinePlay;
    }
    if (index === filteredAssignments.length - 1 && currentAssignee) {
      return HiOutlineCheckCircle;
    }
    return HiOutlineUserPlus;
  };

  const getAssignmentVariant = (assignment, index) => {
    if (assignment.actionType === "CREATION") {
      return "creation";
    }
    if (index === filteredAssignments.length - 1 && currentAssignee) {
      return "current";
    }
    return "assignment";
  };

  const calculateAssignmentDuration = (assignment, nextAssignment) => {
    if (!nextAssignment) return null;

    const start = new Date(assignment.updatedAt);
    const end = new Date(nextAssignment.updatedAt);
    const diffMs = end - start;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    console.log("Assignment Duration:", {
      start,
      end,
      diffMs,
      diffDays,
      diffHours,
    });

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours > 0 ? `${diffHours}h` : ""}`.trim();
    }
    if (diffHours > 0) {
      return `${diffHours}h`;
    }
    return "< 1h";
  };

  return (
    <TimelineContainer>
      <TimelinePath />

      <TimelineItems>
        {filteredAssignments.map((assignment, index) => {
          const isExpanded = expandedCard === assignment.id;
          const IconComponent = getAssignmentIcon(assignment, index);
          const variant = getAssignmentVariant(assignment, index);
          const nextAssignment = filteredAssignments[index + 1];
          const duration = calculateAssignmentDuration(
            assignment,
            nextAssignment
          );
          const isCreation = assignment.actionType === "CREATION";
          const isCurrent = index === 0 && currentAssignee;

          return (
            <TimelineItem key={assignment.id}>
              <AssignmentCard
                $variant={variant}
                $isExpanded={isExpanded}
                onClick={() => handleCardClick(assignment.id)}
              >
                <TimelineIcon $variant={variant}>
                  <IconComponent />
                </TimelineIcon>

                <CardHeader>
                  <div style={{ flex: 1 }}>
                    <Text size={isMobile ? "sm" : "md"} weight="semibold">
                      {isCreation
                        ? "Case Created & Assigned"
                        : isCurrent
                        ? "Current Assignment"
                        : "Reassigned"}
                    </Text>
                    <Text
                      size="xs"
                      color="muted"
                      style={{ marginTop: "var(--spacing-1)" }}
                    >
                      {formatRelativeTime(assignment.updatedAt)}
                    </Text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                    }}
                  >
                    {isCurrent && (
                      <StatusBadge
                        content="Active"
                        variant="success"
                        size="sm"
                      />
                    )}
                    {duration && <DurationBadge>{duration}</DurationBadge>}
                  </div>
                </CardHeader>

                <CardContent>
                  <AssignmentInfo>
                    <UserInfo>
                      <Avatar
                        src={assignment.assignedTo?.profilePicture}
                        name={getUserDisplayName(assignment.assignedTo)}
                        size={isMobile ? "xs" : "sm"}
                        status={
                          assignment.assignedTo?.isOnline ? "online" : "offline"
                        }
                        showStatus={isCurrent && !isMobile}
                      />
                      <UserDetails>
                        <Text size={isMobile ? "xs" : "sm"} weight="medium">
                          {getUserDisplayName(assignment.assignedTo) ||
                            "Unassigned"}
                        </Text>
                        {!isMobile && (
                          <Text size="xs" color="muted">
                            {assignment.assignedTo?.role || "No role specified"}
                          </Text>
                        )}

                        {/* Mobile-specific meta info */}
                        <MobileMetaInfo>
                          <Text size="xs" color="muted" as="span">
                            {formatDate(assignment.updatedAt, "MMM dd")}
                          </Text>
                          {duration && (
                            <>
                              <Text size="xs" color="muted" as="span">
                                •
                              </Text>
                              <Text size="xs" color="muted" as="span">
                                {duration}
                              </Text>
                            </>
                          )}
                        </MobileMetaInfo>
                      </UserDetails>
                    </UserInfo>

                    {!isMobile && (
                      <MetaInfo>
                        <MetaRow>
                          <HiOutlineCalendar />
                          <Text size="xs">
                            {formatDate(assignment.updatedAt, "MMM dd, HH:mm")}
                          </Text>
                        </MetaRow>
                        <MetaRow>
                          <HiOutlineUser />
                          <Text size="xs">
                            by {getUserDisplayName(assignment.updatedBy)}
                          </Text>
                        </MetaRow>
                      </MetaInfo>
                    )}
                  </AssignmentInfo>

                  {/* Show assignment note when clicked */}
                  {assignment.comments && (
                    <CommentsBubble>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--spacing-2)",
                          marginBottom: "var(--spacing-2)",
                        }}
                      >
                        <HiOutlineChatBubbleLeft size={isMobile ? 12 : 14} />
                        <Text size="xs" weight="medium">
                          Assignment Note:
                        </Text>
                      </div>
                      <Text size={isMobile ? "xs" : "sm"}>
                        {assignment.comments}
                      </Text>
                    </CommentsBubble>
                  )}
                </CardContent>
              </AssignmentCard>
            </TimelineItem>
          );
        })}

        {/* New Assignment Section */}
        <NewAssignmentSection>
          <NewAssignmentCard onClick={onAssign}>
            <NewAssignmentIcon>
              <HiSparkles />
            </NewAssignmentIcon>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--spacing-3)",
              }}
            >
              <HiOutlineUserPlus
                size={isMobile ? 24 : 32}
                style={{ color: "var(--color-brand-500)" }}
              />
              <Text
                size={isMobile ? "sm" : "md"}
                weight="semibold"
                color="brand"
              >
                Reassign Case
              </Text>
              <Text size="sm" color="muted">
                Transfer this case to another team member
              </Text>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                  marginTop: "var(--spacing-1)",
                }}
              >
                <HiArrowRight style={{ color: "var(--color-brand-400)" }} />
                <Text size="sm" weight="medium" color="brand">
                  Click to assign
                </Text>
              </div>
            </div>
          </NewAssignmentCard>
        </NewAssignmentSection>
      </TimelineItems>
    </TimelineContainer>
  );
}

AssignmentTimeline.propTypes = {
  assignmentData: PropTypes.shape({
    assignments: PropTypes.array,
    stats: PropTypes.object,
    timeline: PropTypes.array,
  }),
  feedback: PropTypes.object.isRequired,
  feedbackId: PropTypes.string.isRequired,
  onAssign: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
};

export default AssignmentTimeline;
