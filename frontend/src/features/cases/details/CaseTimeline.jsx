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
  HiOutlineScale,
  HiOutlineArrowTrendingUp,
  HiOutlineChartBarSquare,
  HiOutlineEye,
  HiOutlineFunnel,
  HiArrowRight,
} from "react-icons/hi2";

import Text from "../../../ui/Text";
import Card from "../../../ui/Card";
import StatusBadge from "../../../ui/StatusBadge";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import Button from "../../../ui/Button";
import Avatar from "../../../ui/Avatar";
import StyledSelect from "../../../ui/StyledSelect";
import Heading from "../../../ui/Heading";
import { useCaseHistory } from "../useCase";
import { useAllCaseLookupData } from "../useCaseData";
import { formatRelativeTime, formatDate } from "../../../utils/dateUtils";
import { getUserDisplayName, getUserRole } from "../../../utils/userUtils";
import { getColorStyles } from "../../../utils/caseUtils";

const TimelineContainer = styled.div`
  padding: var(--spacing-6);
  max-width: 100%;
  width: 100%;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
  }
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  flex: 1;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-grey-25);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterLabel = styled(Text)`
  font-weight: var(--font-weight-medium);
  color: var(--color-grey-600);
  white-space: nowrap;
`;

const TimelineList = styled.div`
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 2rem;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      var(--color-success-400),
      var(--color-brand-400),
      var(--color-warning-400),
      var(--color-grey-300)
    );
    border-radius: var(--border-radius-full);

    @media (max-width: 768px) {
      left: 1.8rem;
      width: 2px;
    }
  }
`;

const TimelineItem = styled.div`
  position: relative;
  padding: 0 0 var(--spacing-6) 6rem;
  min-height: 8rem;

  &:last-child {
    padding-bottom: 0;
  }

  @media (max-width: 768px) {
    padding-left: 5rem;
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
  z-index: 3;
  box-shadow: var(--shadow-md);
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) => {
    switch (props.$variant) {
      case "creation":
        return `
          background: linear-gradient(135deg, var(--color-success-500), var(--color-success-600));
          color: var(--color-grey-0);
        `;
      case "status_change":
        return `
          background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600));
          color: var(--color-grey-0);
        `;
      case "assignment_change":
        return `
          background: linear-gradient(135deg, var(--color-warning-500), var(--color-warning-600));
          color: var(--color-grey-0);
        `;
      case "priority_change":
        return `
          background: linear-gradient(135deg, var(--color-info-500), var(--color-info-600));
          color: var(--color-grey-0);
        `;
      case "category_change":
        return `
          background: linear-gradient(135deg, var(--color-purple-500), var(--color-purple-600));
          color: var(--color-grey-0);
        `;
      case "escalation":
        return `
          background: linear-gradient(135deg, var(--color-error-500), var(--color-error-600));
          color: var(--color-grey-0);
        `;
      case "resolution":
        return `
          background: linear-gradient(135deg, var(--color-success-600), var(--color-success-700));
          color: var(--color-grey-0);
        `;
      case "comment_added":
        return `
          background: linear-gradient(135deg, var(--color-blue-500), var(--color-blue-600));
          color: var(--color-grey-0);
        `;
      default:
        return `
          background: linear-gradient(135deg, var(--color-grey-500), var(--color-grey-600));
          color: var(--color-grey-0);
        `;
    }
  }}

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  @media (max-width: 768px) {
    width: 3.6rem;
    height: 3.6rem;
  }

  svg {
    width: 2rem;
    height: 2rem;

    @media (max-width: 768px) {
      width: 1.8rem;
      height: 1.8rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

const TimelineContent = styled(Card)`
  padding: var(--spacing-4);
  margin-left: var(--spacing-3);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-200);
    transform: translateX(4px);
  }

  @media (max-width: 768px) {
    margin-left: 0;
    padding: var(--spacing-3);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

const TimelineHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-3);
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-2);
  }
`;

const TimelineTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const TimelineTimestamp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

const TimelineDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
`;

const TimelineUser = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);
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
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  font-size: var(--font-size-sm);
`;

const CommentBubble = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-blue-25),
    var(--color-blue-50)
  );
  border: 1px solid var(--color-blue-200);
  border-left: 4px solid var(--color-blue-500);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-3);
  margin-top: var(--spacing-2);
  font-style: italic;
  position: relative;

  &::before {
    content: '"';
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-blue-400);
    position: absolute;
    top: -4px;
    left: var(--spacing-2);
  }

  &::after {
    content: '"';
    font-size: 2rem;
    font-weight: bold;
    color: var(--color-blue-400);
    position: absolute;
    bottom: -12px;
    right: var(--spacing-2);
  }
`;

const EmptyState = styled(Card)`
  padding: var(--spacing-8);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  border: 2px dashed var(--color-grey-300);
  background: var(--color-grey-25);
`;

const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  background: linear-gradient(
    135deg,
    var(--color-grey-100),
    var(--color-grey-200)
  );
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

const ShowMoreContainer = styled.div`
  text-align: center;
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-grey-200);
`;

const ActionTypeIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-brand-100);
  color: var(--color-brand-700);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
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
    case "priority_change":
      return HiOutlineArrowTrendingUp;
    case "category_change":
      return HiOutlineScale;
    case "escalation":
      return HiOutlineExclamationTriangle;
    case "resolution":
      return HiOutlineCheckCircle;
    case "comment_added":
      return HiOutlineDocumentText;
    default:
      return HiOutlineArrowPath;
  }
};

// Helper function to get action variant for styling
const getActionVariant = (actionType) => {
  return actionType?.toLowerCase() || "default";
};

// Helper function to get action type display name
const getActionTypeDisplayName = (actionType) => {
  switch (actionType?.toLowerCase()) {
    case "creation":
      return "Creation";
    case "status_change":
      return "Status Change";
    case "assignment_change":
      return "Assignment";
    case "priority_change":
      return "Priority Change";
    case "category_change":
      return "Category Change";
    case "escalation":
      return "Escalation";
    case "resolution":
      return "Resolution";
    case "comment_added":
      return "Comment";
    default:
      return "Activity";
  }
};

/**
 * Case Timeline Component
 *
 * Displays a comprehensive timeline of all case activities,
 * including status changes, assignments, comments, and other updates
 * with improved filtering and visual design
 */
function CaseTimeline({ case: caseData, caseId, onRefresh }) {
  const [showAll, setShowAll] = useState(false);
  const [actionTypeFilter, setActionTypeFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);

  const { statusOptions } = useAllCaseLookupData();

  function getStatusById(value) {
    const status = statusOptions.find(
      (status) => status.value === Number(value)
    );
    return status;
  }

  // get change description items

  const getChangeDescriptionItems = (changeDescription) => {
    if (!changeDescription) return [];
    const items = changeDescription.split(";").map((item) => item.trim());
    return items.map((item, index) => (
      <li key={index}>
        <Text size="sm">{item}</Text>
      </li>
    ));
  };

  // Helper function to format action description
  const getActionDescription = (historyItem) => {
    const { actionType, status, oldValue, newValue, assignedTo } = historyItem;

    switch (actionType?.toLowerCase()) {
      case "creation":
        return "Case was created";
      case "status_change":
        if (oldValue && newValue) {
          return `Status changed from ${getStatusById(oldValue)?.label} to ${
            getStatusById(newValue)?.label
          }`;
        }
        return `Status updated to ${
          status?.name || getStatusById(newValue)?.label
        }`;
      case "assignment_change":
        if (assignedTo) {
          return `Assigned to ${getUserDisplayName(assignedTo)}`;
        }
        return "Assignment updated";
      case "priority_change":
        if (oldValue && newValue) {
          return `Priority changed from ${oldValue} to ${newValue}`;
        }
        return "Priority updated";
      case "category_change":
        if (oldValue && newValue) {
          return `Category changed from ${oldValue} to ${newValue}`;
        }
        return "Category updated";
      case "escalation":
        return "Case was escalated";
      case "resolution":
        return "Case was resolved";
      case "comment_added":
        return "Added a comment";
      default:
        return "Activity recorded";
    }
  };

  const {
    data: historyData,
    isLoading,
    error,
    refetch,
    isError,
  } = useCaseHistory(caseId);

  const handleRefresh = () => {
    refetch();
    if (onRefresh) onRefresh();
  };

  const history =
    historyData?.data?.data?.filter(
      (item) => item.actionType !== "COMMENT_ADDED"
    ) || [];

  // Filter history based on action type
  const filteredHistory = history.filter((item) => {
    if (actionTypeFilter === "all") return true;
    return item.actionType?.toLowerCase() === actionTypeFilter.toLowerCase();
  });

  const displayedHistory = showAll
    ? filteredHistory
    : filteredHistory.slice(0, 10);

  // console.log("Displayed History:", displayedHistory);

  // Get unique action types for filter dropdown
  const actionTypes = [
    { value: "all", label: "All Activities" },
    ...Array.from(
      new Set(history.map((item) => item.actionType?.toLowerCase()))
    )
      .filter(Boolean)
      .map((type) => ({
        value: type,
        label: getActionTypeDisplayName(type),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  // console.log("Action Types for Filter:", actionTypes);

  const handleCardClick = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Loading state
  if (isLoading) {
    return (
      <TimelineContainer>
        <LoadingState>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading timeline...
          </Text>
          <Text size="sm" color="muted">
            Retrieving case activity history
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--spacing-2)",
              marginBottom: "var(--spacing-3)",
            }}
          >
            <HiOutlineXCircle
              size={24}
              style={{ color: "var(--color-error-500)" }}
            />
            <Text size="lg" weight="semibold" color="error">
              Failed to load timeline
            </Text>
          </div>
          <Text
            size="sm"
            color="muted"
            style={{ marginBottom: "var(--spacing-4)" }}
          >
            {error?.message ||
              "Something went wrong while loading the timeline."}
          </Text>
          <Button variant="primary" onClick={handleRefresh}>
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
          <Heading as="h3" size="h4" color="muted">
            No timeline data available
          </Heading>
          <Text size="sm" color="muted">
            Timeline activities will appear here as the case progresses.
          </Text>
          <Button variant="secondary" size="medium" onClick={handleRefresh}>
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
        <HeaderContent>
          <Heading as="h2" size="h3">
            Activity Timeline
          </Heading>
          <Text size="md" color="muted">
            {filteredHistory.length} of {history.length}{" "}
            {history.length === 1 ? "activity" : "activities"} shown
            {actionTypeFilter !== "all" && (
              <span>
                {" "}
                • Filtered by{" "}
                <strong>{getActionTypeDisplayName(actionTypeFilter)}</strong>
              </span>
            )}
          </Text>
        </HeaderContent>

        <HeaderActions>
          <Button variant="ghost" size="medium" onClick={handleRefresh}>
            <HiOutlineArrowPath />
            Refresh
          </Button>
        </HeaderActions>
      </TimelineHeader>

      {/* Filter Controls */}
      {actionTypes.length > 1 && (
        <FilterControls>
          <FilterGroup>
            <HiOutlineFunnel
              size={20}
              style={{ color: "var(--color-grey-500)" }}
            />
            <FilterLabel size="sm">Filter by activity type:</FilterLabel>
            <StyledSelect
              value={actionTypeFilter}
              onChange={(value) => setActionTypeFilter(value)}
              style={{ minWidth: "200px" }}
              options={actionTypes.map((type) => ({
                value: type.value,
                label: type.label,
              }))}
            />
          </FilterGroup>

          {actionTypeFilter !== "all" && (
            <Button
              variant="ghost"
              size="small"
              onClick={() => setActionTypeFilter("all")}
            >
              Clear Filter
            </Button>
          )}
        </FilterControls>
      )}

      {/* Timeline */}
      <TimelineList>
        {displayedHistory.map((item, index) => {
          const IconComponent = getActionIcon(item.actionType);
          const variant = getActionVariant(item.actionType);
          const isExpanded = expandedCard === item.id;

          return (
            <TimelineItem key={item.id || index}>
              <TimelineIcon $variant={variant}>
                <IconComponent />
              </TimelineIcon>

              <TimelineContent onClick={() => handleCardClick(item.id)}>
                <TimelineHeader2>
                  <div style={{ flex: 1 }}>
                    <TimelineTitle size="sm">
                      <ActionTypeIndicator>
                        {getActionTypeDisplayName(item.actionType)}
                      </ActionTypeIndicator>
                      {getActionDescription(item)}
                    </TimelineTitle>
                  </div>

                  <TimelineTimestamp>
                    <Text size="xs" color="muted">
                      {formatRelativeTime(item.createdAt)}
                    </Text>
                    <Text size="xs" color="muted">
                      {formatDate(item.createdAt, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </TimelineTimestamp>
                </TimelineHeader2>

                <TimelineDetails>
                  {/* User who performed the action */}
                  <TimelineUser>
                    <Avatar
                      src={item.createdBy?.profilePicture}
                      name={getUserDisplayName(item.createdBy)}
                      size="sm"
                      status={item.createdBy?.isOnline ? "online" : "offline"}
                      showStatus={true}
                    />
                    <div style={{ flex: 1 }}>
                      <Text size="sm" weight="medium">
                        {getUserDisplayName(item.createdBy)}
                      </Text>
                      <Text size="xs" color="muted">
                        {getUserRole(item.createdBy) || "User"}
                      </Text>
                    </div>
                    <Text size="xs" color="muted">
                      <HiOutlineEye size={12} style={{ marginRight: "4px" }} />
                      {isExpanded ? "Hide details" : "View details"}
                    </Text>
                  </TimelineUser>

                  {/* Status change details */}
                  {item.actionType?.toLowerCase() === "status_change" && (
                    <ChangeDetails>
                      {item.oldValue && (
                        <ChangeItem>
                          <Text size="xs" color="muted">
                            From:
                          </Text>
                          <StatusBadge
                            content={getStatusById(item.oldValue)?.label}
                            size="xs"
                            style={getColorStyles(
                              getStatusById(item.oldValue)?.color ||
                                "--color-grey-200"
                            )}
                          />
                        </ChangeItem>
                      )}
                      <HiArrowRight
                        size={14}
                        style={{ color: "var(--color-grey-400)" }}
                      />
                      <ChangeItem>
                        <Text size="xs" color="muted">
                          To:
                        </Text>
                        <StatusBadge
                          content={
                            getStatusById(item.newValue)?.label ||
                            item.status?.name
                          }
                          size="xs"
                          style={getColorStyles(
                            getStatusById(item.newValue)?.color ||
                              "--color-grey-200"
                          )}
                        />
                      </ChangeItem>
                    </ChangeDetails>
                  )}

                  {/* Priority change details */}
                  {item.actionType?.toLowerCase() === "priority_change" && (
                    <ChangeDetails>
                      {item.oldValue && (
                        <ChangeItem>
                          <Text size="xs" color="muted">
                            From:
                          </Text>
                          <StatusBadge content={item.oldValue} size="xs" />
                        </ChangeItem>
                      )}
                      <HiArrowRight
                        size={14}
                        style={{ color: "var(--color-grey-400)" }}
                      />
                      <ChangeItem>
                        <Text size="xs" color="muted">
                          To:
                        </Text>
                        <StatusBadge content={item.newValue} size="xs" />
                      </ChangeItem>
                    </ChangeDetails>
                  )}

                  {/* Assignment details */}
                  {item.actionType?.toLowerCase() === "assignment_change" &&
                    item.assignedTo && (
                      <ChangeDetails>
                        <ChangeItem>
                          <HiOutlineUser size={14} />
                          <Avatar
                            src={item.assignedTo?.profilePicture}
                            name={getUserDisplayName(item.assignedTo)}
                            size="xs"
                          />
                          <Text size="xs" weight="medium">
                            {getUserDisplayName(item.assignedTo)}
                          </Text>
                        </ChangeItem>
                      </ChangeDetails>
                    )}

                  {/* Comments */}
                  {item.comments && (
                    <CommentBubble>
                      <Text size="sm">{item.comments}</Text>
                    </CommentBubble>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: "var(--spacing-3)",
                        padding: "var(--spacing-3)",
                        background: "var(--color-grey-25)",
                        borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--color-grey-200)",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "var(--spacing-2)",
                          marginBottom: "var(--spacing-2)",
                        }}
                      >
                        <div>
                          <Text size="xs" weight="medium" color="muted">
                            Action ID
                          </Text>
                          <Text
                            size="xs"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {item.id}
                          </Text>
                        </div>
                        <div>
                          <Text size="xs" weight="medium" color="muted">
                            Timestamp
                          </Text>
                          <Text
                            size="xs"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {formatDate(item.createdAt)}
                          </Text>
                        </div>
                        {item.fieldName && (
                          <div>
                            <Text size="xs" weight="medium" color="muted">
                              Field Changed
                            </Text>
                            <Text size="xs">{item.fieldName}</Text>
                          </div>
                        )}
                      </div>

                      {item.changeDescription && (
                        <div style={{ marginTop: "var(--spacing-2)" }}>
                          <Text size="xs" weight="medium" color="muted">
                            Description
                          </Text>
                          <Text
                            size="xs"
                            as="ul"
                            style={{
                              marginTop: "4px",
                              paddingLeft: "var(--spacing-4)",
                              listStyleType: "disc",
                            }}
                          >
                            {getChangeDescriptionItems(item.changeDescription)}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Case context for reference */}
                  <Text size="xs" color="muted">
                    Case #{caseData?.caseNumber} • {caseData?.title}
                  </Text>
                </TimelineDetails>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </TimelineList>

      {/* Show more button */}
      {filteredHistory.length > 10 && (
        <ShowMoreContainer>
          <Button
            variant="ghost"
            size="medium"
            onClick={() => setShowAll(!showAll)}
          >
            <HiOutlineChartBarSquare />
            {showAll
              ? "Show Less"
              : `Show All ${filteredHistory.length} Activities`}
          </Button>
        </ShowMoreContainer>
      )}
    </TimelineContainer>
  );
}

CaseTimeline.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default CaseTimeline;
