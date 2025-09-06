import { useState, useMemo } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUsers,
  HiOutlineUserPlus,
  HiOutlineArrowPath,
  HiOutlineChartBar,
  HiOutlineXCircle,
} from "react-icons/hi2";

import Heading from "../../../ui/Heading";
import Text from "../../../ui/Text";
import Button from "../../../ui/Button";
import Card from "../../../ui/Card";
import LoadingSpinner from "../../../ui/LoadingSpinner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../ui/Tabs";

// Import assignment-specific components
import CaseAssignmentTimeline from "./CaseAssignmentTimeline";
import CaseAssignmentStats from "./CaseAssignmentStats";

// Import hooks
import { useCaseAssignmentHistory } from "../useCaseAssignmentHistory";

const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  min-height: 60rem;

  @media (max-width: 768px) {
    padding: var(--spacing-4);
    gap: var(--spacing-4);
  }
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 35rem;
  gap: var(--spacing-6);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
`;

const SidePanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);

  @media (max-width: 1200px) {
    order: -1;
  }
`;

const AssignmentTabsContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
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

/**
 * CaseAssignment Component
 *
 * Displays comprehensive assignment information for a case
 * including timeline, statistics, and management capabilities
 */
function CaseAssignment({ case: caseData, caseId, onRefresh, onAssign }) {
  const [activeSubTab, setActiveSubTab] = useState("timeline");

  // Fetch assignment history data using case history endpoint
  const {
    data: assignmentHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory,
  } = useCaseAssignmentHistory(caseId);

  // Process assignment history for display
  const assignmentData = useMemo(() => {
    if (!assignmentHistory) return null;

    // Sort assignments from oldest to newest (creation first, then chronological)
    const sortedAssignments = [...assignmentHistory].sort((a, b) => {
      // Creation always comes first
      if (a.actionType === "CREATION" && b.actionType !== "CREATION") return -1;
      if (b.actionType === "CREATION" && a.actionType !== "CREATION") return 1;

      // Then sort by date (oldest to newest)
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    });

    const stats = {
      totalAssignments: sortedAssignments.length,
      currentAssignee: caseData?.assignedTo,
      lastAssignedAt:
        sortedAssignments[sortedAssignments.length - 1]?.updatedAt,
      averageAssignmentDuration:
        calculateAverageAssignmentDuration(sortedAssignments),
    };

    return {
      assignments: sortedAssignments,
      stats,
      timeline: sortedAssignments,
    };
  }, [assignmentHistory, caseData]);

  // console.log("Assignment Data:", assignmentData);

  // Helper function to calculate average assignment duration
  function calculateAverageAssignmentDuration(assignments) {
    if (assignments.length < 2) return null;

    const durations = [];
    for (let i = 0; i < assignments.length - 1; i++) {
      const current = new Date(assignments[i].updatedAt);
      const next = new Date(assignments[i + 1].updatedAt);
      durations.push(next - current);
    }

    const avgMs =
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    return Math.round(avgMs / (1000 * 60 * 60 * 24)); // Convert to days
  }

  const handleRefresh = () => {
    refetchHistory();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Assignment sub-tabs configuration
  const assignmentTabs = [
    {
      value: "timeline",
      label: "Timeline",
      icon: HiOutlineUsers,
      component: CaseAssignmentTimeline,
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: HiOutlineChartBar,
      component: () => (
        <div style={{ padding: "var(--spacing-4)", textAlign: "center" }}>
          <HiOutlineChartBar
            size={48}
            style={{
              color: "var(--color-grey-400)",
              marginBottom: "var(--spacing-3)",
            }}
          />
          <Text size="lg" weight="semibold" color="muted">
            Analytics Coming Soon
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            Advanced assignment analytics and insights will be available in a
            future update.
          </Text>
        </div>
      ),
    },
  ];

  // Loading state
  if (isLoadingHistory) {
    return (
      <TabContainer>
        <LoadingState>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading assignment data...
          </Text>
        </LoadingState>
      </TabContainer>
    );
  }

  // Error state
  if (historyError) {
    return (
      <TabContainer>
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
              Failed to Load Assignment Data
            </Text>
          </div>
          <Text
            size="sm"
            color="muted"
            style={{ marginBottom: "var(--spacing-4)" }}
          >
            {historyError?.message ||
              "There was an error loading the assignment information."}
          </Text>
          <Button variant="primary" onClick={handleRefresh}>
            <HiOutlineArrowPath />
            Try Again
          </Button>
        </ErrorState>
      </TabContainer>
    );
  }

  return (
    <TabContainer>
      {/* Tab Header */}
      <TabHeader>
        <HeaderContent>
          <Heading as="h2" size="h3">
            Assignment Management
          </Heading>
          <Text color="muted">
            Track and manage case assignments, view assignment history, and
            analyze assignment patterns.
          </Text>
        </HeaderContent>

        <HeaderActions>
          <Button variant="secondary" onClick={handleRefresh}>
            <HiOutlineArrowPath />
            Refresh
          </Button>
          <Button variant="primary" onClick={onAssign}>
            <HiOutlineUserPlus />
            Reassign Case
          </Button>
        </HeaderActions>
      </TabHeader>

      {/* Content Grid */}
      <ContentGrid>
        {/* Main Content Area */}
        <MainContent>
          <AssignmentTabsContainer>
            {/* Assignment Sub-tabs */}
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
              <TabsList
                style={{ borderBottom: "1px solid var(--color-grey-200)" }}
              >
                {assignmentTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    icon={tab.icon}
                  >
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {assignmentTabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <tab.component
                    assignmentData={assignmentData}
                    case={caseData}
                    caseId={caseId}
                    onRefresh={handleRefresh}
                    onAssign={onAssign}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </AssignmentTabsContainer>
        </MainContent>

        {/* Side Panel - Assignment Statistics */}
        <SidePanel>
          <CaseAssignmentStats
            assignmentData={assignmentData}
            case={caseData}
          />
        </SidePanel>
      </ContentGrid>
    </TabContainer>
  );
}

CaseAssignment.propTypes = {
  case: PropTypes.object.isRequired,
  caseId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
  onAssign: PropTypes.func,
};

export default CaseAssignment;
