import styled from "styled-components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  HiOutlinePlus,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import Button from "../../ui/Button";

const ActionsCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const ActionsHeader = styled.div`
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Enhanced action button with variant-aware text styling
const ActionButton = styled(Button)`
  justify-content: flex-start;
  padding: var(--spacing-3);
  height: auto;
  text-align: left;

  svg {
    flex-shrink: 0;
    margin-right: var(--spacing-3);
  }
`;

const ActionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  align-items: flex-start;
`;

// Action title with dynamic color based on button variant
const ActionTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);

  /* Dynamic color based on parent button variant */
  ${ActionButton}[data-variant="primary"] & {
    color: var(--color-grey-0); /* White text for primary buttons */
  }

  ${ActionButton}[data-variant="secondary"] & {
    color: var(--color-grey-800); /* Dark text for secondary buttons */
  }

  ${ActionButton}[data-variant="ghost"] & {
    color: var(--color-grey-700); /* Medium text for ghost buttons */
  }

  ${ActionButton}:disabled & {
    color: var(--color-grey-500); /* Muted text for disabled buttons */
  }
`;

// Action description with dynamic color based on button variant
const ActionDescription = styled(Text)`
  /* Dynamic color based on parent button variant */
  ${ActionButton}[data-variant="primary"] & {
    color: var(--color-grey-100); /* Light grey text for primary buttons */
  }

  ${ActionButton}[data-variant="secondary"] & {
    color: var(--color-grey-600); /* Medium grey for secondary buttons */
  }

  ${ActionButton}[data-variant="ghost"] & {
    color: var(--color-grey-500); /* Light grey for ghost buttons */
  }

  ${ActionButton}:disabled & {
    color: var(--color-grey-400); /* Very muted text for disabled buttons */
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-sm);
`;

function QuickActions({ stats, onCreateFeedback, onViewAll }) {
  const navigate = useNavigate();
  const actions = [
    {
      id: "create",
      title: "New Feedback",
      description: "Submit new feedback entry",
      icon: HiOutlinePlus,
      variant: "primary",
      onClick: onCreateFeedback,
    },
    {
      id: "view-all",
      title: "View All Feedback",
      description: "Browse all feedback entries",
      icon: HiOutlineClipboardDocumentList,
      variant: "secondary",
      onClick: onViewAll,
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      description: "View detailed reports",
      icon: HiOutlineChartBarSquare,
      variant: "secondary",
      onClick: () => console.log("Reports coming soon"),
      disabled: true,
    },
    {
      id: "settings",
      title: "System Settings",
      description: "Configure feedback system",
      icon: HiOutlineCog6Tooth,
      variant: "ghost",
      onClick: () => navigate("/settings"),
    },
  ];

  // Helper function to calculate average processing time in days
  const getAverageProcessingDays = () => {
    if (!stats || stats.caseProcessed === 0) return 0;
    const avgMs = stats.totalProcessingTime / stats.caseProcessed;
    return Math.round(avgMs / (1000 * 60 * 60 * 24));
  };

  const quickStats = [
    {
      label: "Open Cases",
      value: stats?.byStatus?.open || 0,
    },
    {
      label: "Today's Submissions",
      value: stats?.dailySubmissions?.[new Date().toDateString()] || 0,
    },
    {
      label: "Average Processing Time (Days)",
      value: getAverageProcessingDays(),
    },
    {
      label: "Sensitive Cases",
      value: stats?.sensitive || 0,
    },
  ];

  return (
    <ActionsCard>
      <ActionsHeader>
        <Text size="md" weight="semibold">
          Quick Actions
        </Text>
        <Text size="sm" color="muted">
          Common tasks and system overview
        </Text>
      </ActionsHeader>

      <ActionsGrid>
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            variant={action.variant}
            onClick={action.onClick}
            disabled={action.disabled}
            // Add data attribute for CSS targeting
            data-variant={action.variant}
          >
            <action.icon size={20} />
            <ActionContent>
              <ActionTitle size="sm">{action.title}</ActionTitle>
              <ActionDescription size="xs">
                {action.description}
              </ActionDescription>
            </ActionContent>
          </ActionButton>
        ))}
      </ActionsGrid>

      <StatsRow>
        {quickStats.map((stat) => (
          <StatItem key={stat.label}>
            <Text size="xs" color="muted">
              {stat.label}
            </Text>
            <Text size="sm" weight="semibold">
              {stat.value}
            </Text>
          </StatItem>
        ))}
      </StatsRow>
    </ActionsCard>
  );
}

QuickActions.propTypes = {
  stats: PropTypes.object,
  onCreateFeedback: PropTypes.func.isRequired,
  onViewAll: PropTypes.func.isRequired,
};

export default QuickActions;
