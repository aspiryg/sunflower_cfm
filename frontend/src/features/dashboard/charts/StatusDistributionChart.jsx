import { useMemo } from "react";
import styled from "styled-components";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Text from "../../../ui/Text";

const ChartContainer = styled.div`
  width: 100%;
  height: 32rem;
  min-height: 16rem;
  display: flex;

  gap: var(--spacing-4);

  @media (max-width: 768px) {
    height: 28rem;
    flex-direction: row;
    gap: var(--spacing-2);
  }
`;

const LegendContainer = styled.div`
  min-width: 14rem;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-2);

  @media (max-width: 768px) {
    /* min-width: auto; */
    /* width: 100%; */
  }
`;

const ChartArea = styled.div`
  flex: 1;
  min-height: 18rem;

  @media (max-width: 768px) {
    height: 16rem;
  }
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
  transition: background-color var(--duration-fast) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-50);
  }

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const StatusIndicator = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  flex-shrink: 0;
`;

const StatusContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const StatusLabel = styled(Text)`
  color: var(--color-grey-700);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusValue = styled(Text)`
  color: var(--color-grey-800);
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-brand-50);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
`;

const CustomTooltip = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  box-shadow: var(--shadow-md);
`;

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  color: var(--color-grey-400);
  background-color: var(--color-grey-50);
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-md);
`;

// Status color mapping - updated with additional statuses
const STATUS_COLORS = {
  open: "var(--color-blue-500)",
  in_progress: "var(--color-yellow-500)",
  resolved: "var(--color-green-500)",
  closed: "var(--color-grey-500)",
  pending: "var(--color-orange-500)",
  rejected: "var(--color-red-500)",
  reviewing: "var(--color-purple-500)",
};

// Status label mapping - updated with additional statuses
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
  pending: "Pending",
  rejected: "Rejected",
  reviewing: "Reviewing",
};

function StatusDistributionChart({ stats }) {
  const { chartData /*total*/ } = useMemo(() => {
    if (!stats?.byStatus) return { chartData: [], total: 0 };

    const statusData = stats.byStatus;
    const totalCount = Object.values(statusData).reduce(
      (sum, count) => sum + count,
      0
    );

    const data = Object.entries(statusData)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status] || status,
        value: count,
        status: status,
        percentage:
          totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0,
      }));

    return { chartData: data, total: totalCount };
  }, [stats?.byStatus]);

  const CustomTooltipContent = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <CustomTooltip>
          <Text size="sm" weight="medium" color="grey-700">
            {data.name}
          </Text>
          <Text color="brand-600" weight="semibold">
            {data.value} cases ({data.percentage}%)
          </Text>
        </CustomTooltip>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <EmptyState>
        <Text color="grey-400">No status data available</Text>
        <Text size="sm" color="grey-400">
          Submit feedback to see status distribution
        </Text>
      </EmptyState>
    );
  }

  return (
    <ChartContainer>
      {/* Legend on the left */}
      <LegendContainer>
        {chartData.map((entry) => (
          <StatusItem key={entry.status}>
            <StatusIndicator $color={STATUS_COLORS[entry.status]} />
            <StatusContent>
              <StatusLabel size="sm">{entry.name}</StatusLabel>
              <StatusValue>{entry.value}</StatusValue>
            </StatusContent>
          </StatusItem>
        ))}
      </LegendContainer>

      {/* Chart on the right */}
      <ChartArea aria-label="Status Distribution Chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={STATUS_COLORS[entry.status]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartArea>
    </ChartContainer>
  );
}

export default StatusDistributionChart;
