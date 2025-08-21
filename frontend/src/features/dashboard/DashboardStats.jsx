import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineChartBarSquare,
  HiOutlineCalendarDays,
} from "react-icons/hi2";

import { HiOutlineClipboardList } from "react-icons/hi";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import LoadingSpinner from "../../ui/LoadingSpinner";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: var(--spacing-3);
  }
`;

const StatCard = styled(Card)`
  padding: var(--spacing-3);
  border: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-2);
    gap: var(--spacing-2);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

const StatIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--border-radius-lg);
  flex-shrink: 0;

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  ${(props) => {
    switch (props.$variant) {
      case "total":
        return `
          background-color: var(--color-brand-100);
          color: var(--color-brand-600);
        `;
      case "open":
        return `
          background-color: var(--color-warning-100);
          color: var(--color-warning-600);
        `;
      case "resolved":
        return `
          background-color: var(--color-success-100);
          color: var(--color-success-600);
        `;
      case "urgent":
        return `
          background-color: var(--color-error-100);
          color: var(--color-error-600);
        `;
      case "processing":
        return `
          background-color: var(--color-info-100);
          color: var(--color-info-600);
        `;
      case "submissions":
        return `
          background-color: var(--color-purple-100);
          color: var(--color-purple-600);
        `;
      case "active":
        return `
          background-color: var(--color-blue-100);
          color: var(--color-blue-600);
        `;
      default:
        return `
          background-color: var(--color-grey-100);
          color: var(--color-grey-600);
        `;
    }
  }}

  @media (max-width: 768px) {
    width: 4rem;
    height: 4rem;

    svg {
      width: 2rem;
      height: 2rem;
    }
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
`;

const StatValue = styled(Text)`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

const StatLabel = styled(Text)`
  color: var(--color-grey-600);
  font-weight: var(--font-weight-medium);
`;

const StatTrend = styled(Text)`
  color: var(--color-grey-500);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

function DashboardStats({ stats, isLoading, error }) {
  // Helper function to get today's submissions
  const getTodaySubmissions = () => {
    if (!stats?.dailySubmissions) return 0;
    const today = new Date().toDateString();
    return stats.dailySubmissions[today] || 0;
  };

  const statItems = [
    {
      id: "total",
      variant: "total",
      icon: HiOutlineClipboardDocumentList,
      value: stats?.total || 0,
      label: "Total Feedback",
      trend: null,
    },
    {
      id: "active",
      variant: "active",
      icon: HiOutlineClipboardList,
      value: stats?.active || 0,
      label: "Active Cases",
      trend: null,
    },
    {
      id: "open",
      variant: "open",
      icon: HiOutlineClock,
      value: stats?.byStatus?.open || 0,
      label: "Open Cases",
      trend: "Pending review",
    },
    {
      id: "resolved",
      variant: "resolved",
      icon: HiOutlineCheckCircle,
      value: (stats?.byStatus?.resolved || 0) + (stats?.byStatus?.closed || 0),
      label: "Resolved",
      trend: "Completed cases",
    },
    {
      id: "urgent",
      variant: "urgent",
      icon: HiOutlineExclamationTriangle,
      value: stats?.byPriority?.high || stats?.byPriority?.urgent || 0,
      label: "High Priority",
      trend: "Needs attention",
    },
    {
      id: "today",
      variant: "submissions",
      icon: HiOutlineCalendarDays,
      value: getTodaySubmissions(),
      label: "Today's Submissions",
      trend: "New cases",
    },
  ];

  if (isLoading) {
    return (
      <StatsGrid>
        {statItems.map((item) => (
          <StatCard key={item.id}>
            <StatIcon $variant={item.variant}>
              <item.icon />
            </StatIcon>
            <StatContent>
              <LoadingSpinner size="small" />
              <StatLabel size="sm">{item.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>
    );
  }

  if (error) {
    return (
      <StatsGrid>
        {statItems.map((item) => (
          <StatCard key={item.id}>
            <StatIcon $variant="default">
              <item.icon />
            </StatIcon>
            <StatContent>
              <StatValue>--</StatValue>
              <StatLabel size="sm">{item.label}</StatLabel>
              <StatTrend size="xs">Data unavailable</StatTrend>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>
    );
  }

  return (
    <StatsGrid>
      {statItems.map((item) => (
        <StatCard key={item.id}>
          <StatIcon $variant={item.variant}>
            <item.icon />
          </StatIcon>
          <StatContent>
            <StatValue>{item.value.toLocaleString()}</StatValue>
            <StatLabel size="sm">{item.label}</StatLabel>
            {item.trend && <StatTrend size="xs">{item.trend}</StatTrend>}
          </StatContent>
        </StatCard>
      ))}
    </StatsGrid>
  );
}

DashboardStats.propTypes = {
  stats: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
};

export default DashboardStats;
