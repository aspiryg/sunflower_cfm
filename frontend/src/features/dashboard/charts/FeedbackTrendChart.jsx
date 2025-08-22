import { useMemo } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Text from "../../../ui/Text";

const ChartContainer = styled.div`
  width: 100%;
  height: 32rem; /* Explicit height */
  min-height: 16rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    height: 28rem;
  }
`;

const CustomTooltip = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-3);
  box-shadow: var(--shadow-md);
`;

const TooltipLabel = styled(Text)`
  color: var(--color-grey-700);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-1);
`;

const TooltipValue = styled(Text)`
  color: var(--color-brand-600);
  font-weight: var(--font-weight-semibold);
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

function FeedbackTrendChart({ stats /*filters*/ }) {
  // console.log("FeedbackTrendChart - stats:", stats);
  // console.log(
  //   "FeedbackTrendChart - dailySubmissions:",
  //   stats?.dailySubmissions
  // );
  const chartData = useMemo(() => {
    if (!stats?.dailySubmissions) {
      console.log("No dailySubmissions data available");
      return [];
    }

    const submissions = stats.dailySubmissions;
    // console.log("Processing submissions:", submissions);
    // Convert the date string keys to proper Date objects for sorting
    const dateEntries = Object.entries(submissions).map(([dateStr, count]) => {
      const date = new Date(dateStr);
      return {
        date,
        dateStr,
        count,
      };
    });
    // Sort by date
    dateEntries.sort((a, b) => a.date - b.date);

    // Take the last 30 entries or all if less than 30
    const recentEntries = dateEntries.slice(-30);
    // Format for chart display
    const chartData = recentEntries.map(({ date, count }) => ({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: date.toDateString(),
      submissions: count || 0,
    }));

    // console.log("Processed chartData:", chartData);
    return chartData;
  }, [stats?.dailySubmissions]);
  // console.log("FeedbackTrendChart - chartData:", chartData);

  const CustomTooltipContent = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltip>
          <TooltipLabel size="sm">{label}</TooltipLabel>
          <TooltipValue>
            {payload[0].value}{" "}
            {payload[0].value === 1 ? "submission" : "submissions"}
          </TooltipValue>
        </CustomTooltip>
      );
    }
    return null;
  };

  if (!chartData.length) {
    return (
      <EmptyState>
        <Text color="grey-400">No trend data available</Text>
        <Text size="sm" color="grey-400">
          Submit feedback to see the trend
        </Text>
      </EmptyState>
    );
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-grey-200)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--color-grey-600)",
              fontSize: 10,
              fontFamily: "inherit",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--color-grey-600)",
              fontSize: 12,
              fontFamily: "inherit",
            }}
          />
          <Tooltip content={<CustomTooltipContent />} />
          <Line
            type="monotone"
            dataKey="submissions"
            stroke="var(--color-brand-500)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-brand-500)",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: "var(--color-success-600)",
              stroke: "var(--color-grey-0)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export default FeedbackTrendChart;
