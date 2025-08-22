import { useMemo } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
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
  max-width: 20rem;
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

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
  max-height: 12rem;
  overflow-y: auto;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-grey-200);
`;

const CategoryName = styled(Text)`
  color: var(--color-grey-700);
  font-weight: var(--font-weight-medium);
  flex: 1;
  margin-right: var(--spacing-2);
`;

const CategoryCount = styled(Text)`
  color: var(--color-brand-600);
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-brand-50);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
`;

function CategoryBreakdownChart({ stats }) {
  const { chartData, listData } = useMemo(() => {
    if (!stats?.byCategory) return { chartData: [], listData: [] };

    const categoryData = stats.byCategory;

    // Sort categories by count (descending) and take top 10 for chart
    const sortedEntries = Object.entries(categoryData)
      .filter(([_, count]) => count > 0)
      .sort(([, a], [, b]) => b - a);

    // For chart - top 8 categories to avoid overcrowding
    const topCategories = sortedEntries.slice(0, 8);
    const chartData = topCategories.map(([category, count]) => ({
      name: category.length > 15 ? `${category.substring(0, 15)}...` : category,
      fullName: category,
      value: count,
    }));

    // For list - all categories
    const listData = sortedEntries.map(([category, count]) => ({
      name: category,
      count: count,
    }));

    return { chartData, listData };
  }, [stats?.byCategory]);

  const CustomTooltipContent = ({ active, payload /*label*/ }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <CustomTooltip>
          <TooltipLabel size="sm">{data.fullName}</TooltipLabel>
          <TooltipValue>
            {data.value} {data.value === 1 ? "submission" : "submissions"}
          </TooltipValue>
        </CustomTooltip>
      );
    }
    return null;
  };

  if (!chartData.length && !listData.length) {
    return (
      <EmptyState>
        <Text color="grey-400">No category data available</Text>
        <Text size="sm" color="grey-400">
          Submit feedback to see category breakdown
        </Text>
      </EmptyState>
    );
  }

  // If we have few categories, show chart. If many, show list.
  const showChart = chartData.length <= 8 && chartData.length > 0;

  return (
    <ChartContainer>
      {showChart ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-grey-200)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--color-grey-600)",
                fontSize: 11,
                fontFamily: "inherit",
              }}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Bar
              dataKey="value"
              fill="var(--color-brand-500)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <CategoryList>
          {listData.map((category) => (
            <CategoryItem key={category.name}>
              <CategoryName size="sm">{category.name}</CategoryName>
              <CategoryCount size="sm">{category.count}</CategoryCount>
            </CategoryItem>
          ))}
        </CategoryList>
      )}
    </ChartContainer>
  );
}

export default CategoryBreakdownChart;
