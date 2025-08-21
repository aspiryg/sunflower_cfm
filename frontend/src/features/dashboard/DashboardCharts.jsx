import styled from "styled-components";
import PropTypes from "prop-types";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import LoadingSpinner from "../../ui/LoadingSpinner";

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const ChartCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  min-height: 24rem;
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--color-grey-200);
`;

const ChartTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
`;

const ChartContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  min-height: 16rem;
  border: 2px dashed var(--color-grey-300);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  color: var(--color-grey-400);
  background-color: var(--color-grey-50);
`;

const StatusDistribution = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-3);
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
`;

const StatusValue = styled(Text)`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
`;

const StatusLabel = styled(Text)`
  color: var(--color-grey-600);
  text-align: center;
`;

const TrendList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
`;

const TrendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-sm);
`;

function DashboardCharts({ stats, recentFeedback, filters, isLoading, error }) {
  const charts = [
    {
      id: "trend",
      title: "Feedback Trend",
      subtitle: "Daily submissions over time",
      type: "line",
    },
    {
      id: "status",
      title: "Status Distribution",
      subtitle: "Current status breakdown",
      type: "status",
    },
    {
      id: "categories",
      title: "Category Breakdown",
      subtitle: "Most common feedback types",
      type: "categories",
    },
  ];

  if (isLoading) {
    return (
      <ChartsContainer>
        {charts.map((chart) => (
          <ChartCard key={chart.id}>
            <ChartHeader>
              <div>
                <ChartTitle size="md">{chart.title}</ChartTitle>
                <Text size="sm" color="muted">
                  {chart.subtitle}
                </Text>
              </div>
            </ChartHeader>
            <ChartContent>
              <LoadingSpinner size="medium" />
            </ChartContent>
          </ChartCard>
        ))}
      </ChartsContainer>
    );
  }

  if (error) {
    return (
      <ChartsContainer>
        {charts.map((chart) => (
          <ChartCard key={chart.id}>
            <ChartHeader>
              <div>
                <ChartTitle size="md">{chart.title}</ChartTitle>
                <Text size="sm" color="muted">
                  {chart.subtitle}
                </Text>
              </div>
            </ChartHeader>
            <ChartContent>
              <ChartPlaceholder>
                <Text size="sm" color="muted">
                  Data unavailable
                </Text>
                <Text size="xs" color="muted">
                  Charts will appear when data loads
                </Text>
              </ChartPlaceholder>
            </ChartContent>
          </ChartCard>
        ))}
      </ChartsContainer>
    );
  }

  return (
    <ChartsContainer>
      {/* Daily Trend Chart */}
      <ChartCard>
        <ChartHeader>
          <div>
            <ChartTitle size="md">Feedback Trend</ChartTitle>
            <Text size="sm" color="muted">
              Daily submissions over {filters.dateRange}
            </Text>
          </div>
        </ChartHeader>
        <ChartContent>
          <ChartPlaceholder>
            <Text size="sm" weight="medium">
              Line Chart Placeholder
            </Text>
            <Text size="xs" color="muted">
              Daily submission trends will be visualized here
            </Text>
            <Text size="xs" color="muted">
              {Object.keys(stats?.dailySubmissions || {}).length} days of data
              available
            </Text>
          </ChartPlaceholder>
        </ChartContent>
      </ChartCard>

      {/* Status Distribution */}
      <ChartCard>
        <ChartHeader>
          <div>
            <ChartTitle size="md">Status Distribution</ChartTitle>
            <Text size="sm" color="muted">
              Current status breakdown
            </Text>
          </div>
        </ChartHeader>
        <ChartContent>
          <StatusDistribution>
            {Object.entries(stats?.byStatus || {}).map(([status, count]) => (
              <StatusItem key={status}>
                <StatusValue>{count}</StatusValue>
                <StatusLabel size="sm" weight="medium">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </StatusLabel>
              </StatusItem>
            ))}
          </StatusDistribution>
        </ChartContent>
      </ChartCard>

      {/* Category Breakdown */}
      <ChartCard>
        <ChartHeader>
          <div>
            <ChartTitle size="md">Category Breakdown</ChartTitle>
            <Text size="sm" color="muted">
              Most common feedback types
            </Text>
          </div>
        </ChartHeader>
        <ChartContent>
          <TrendList>
            {Object.entries(stats?.byCategory || {})
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <TrendItem key={category}>
                  <Text size="sm" weight="medium">
                    {category || "Uncategorized"}
                  </Text>
                  <Text size="sm" weight="bold">
                    {count}
                  </Text>
                </TrendItem>
              ))}
            {Object.keys(stats?.byCategory || {}).length === 0 && (
              <ChartPlaceholder>
                <Text size="sm" color="muted">
                  No category data available
                </Text>
              </ChartPlaceholder>
            )}
          </TrendList>
        </ChartContent>
      </ChartCard>
    </ChartsContainer>
  );
}

DashboardCharts.propTypes = {
  stats: PropTypes.object,
  recentFeedback: PropTypes.array,
  filters: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
};

export default DashboardCharts;
