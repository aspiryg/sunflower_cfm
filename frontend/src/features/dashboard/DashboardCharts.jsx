import styled from "styled-components";
import PropTypes from "prop-types";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import Card from "../../ui/Card";
import Text from "../../ui/Text";
import LoadingSpinner from "../../ui/LoadingSpinner";
import {
  FeedbackTrendChart,
  StatusDistributionChart,
  CategoryBreakdownChart,
} from "./charts";

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
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-brand-500);
  }
`;

const ChartContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 300px; /* Add explicit height */
  min-height: 16rem;
`;

const LoadingState = styled.div`
  width: 100%;
  height: 100%;
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  color: var(--color-grey-400);
`;

const ErrorState = styled.div`
  width: 100%;
  height: 100%;
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  color: var(--color-error-500);
  background-color: var(--color-error-25);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-4);
`;

function DashboardCharts({ stats, filters, isLoading, error }) {
  if (error) {
    return (
      <ChartsContainer>
        <ChartCard>
          <ErrorState>
            <Text color="error-600" weight="medium">
              Failed to load chart data
            </Text>
            <Text size="sm" color="error-500">
              {error.message || "Please try again later"}
            </Text>
          </ErrorState>
        </ChartCard>
      </ChartsContainer>
    );
  }

  return (
    <ChartsContainer>
      {/* Feedback Trend Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            <TrendingUp />
            Feedback Trend
          </ChartTitle>
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <LoadingState>
              <LoadingSpinner size="large" />
              <Text color="grey-400">Loading trend data...</Text>
            </LoadingState>
          ) : (
            <FeedbackTrendChart stats={stats} filters={filters} />
          )}
        </ChartContent>
      </ChartCard>

      {/* Status Distribution Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            <PieChart />
            Status Distribution
          </ChartTitle>
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <LoadingState>
              <LoadingSpinner size="large" />
              <Text color="grey-400">Loading status data...</Text>
            </LoadingState>
          ) : (
            <StatusDistributionChart stats={stats} />
          )}
        </ChartContent>
      </ChartCard>

      {/* Category Breakdown Chart */}
      <ChartCard>
        <ChartHeader>
          <ChartTitle>
            <BarChart3 />
            Category Breakdown
          </ChartTitle>
        </ChartHeader>
        <ChartContent>
          {isLoading ? (
            <LoadingState>
              <LoadingSpinner size="large" />
              <Text color="grey-400">Loading category data...</Text>
            </LoadingState>
          ) : (
            <CategoryBreakdownChart stats={stats} />
          )}
        </ChartContent>
      </ChartCard>
    </ChartsContainer>
  );
}

DashboardCharts.propTypes = {
  stats: PropTypes.object,
  filters: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.any,
};

export default DashboardCharts;
