import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HiOutlinePlus, HiOutlineArrowPath } from "react-icons/hi2";
import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import LoadingSpinner from "../ui/LoadingSpinner";
import DashboardStats from "../features/dashboard/DashboardStats";
import DashboardFilters from "../features/dashboard/DashboardFilters";
import DashboardCharts from "../features/dashboard/DashboardCharts";
import RecentCases from "../features/dashboard/RecentCases";
import QuickActions from "../features/dashboard/QuickActions";
import { useCaseStats, useCases } from "../features/cases/useCase";
import { useDashboardFilters } from "../features/dashboard/useDashboard";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-2xl);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--spacing-0);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: 0 var(--spacing-0);
  }
`;

const PageHeader = styled.div`
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

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  gap: var(--spacing-6);
  grid-template-areas:
    "filters filters"
    "stats stats"
    "charts recent"
    "actions actions";
  grid-template-columns: 2fr 1fr;

  @media (max-width: 1200px) {
    grid-template-areas:
      "filters"
      "stats"
      "charts"
      "recent"
      "actions";
    grid-template-columns: 1fr;
  }
`;

const FiltersArea = styled.div`
  grid-area: filters;
`;

const StatsArea = styled.div`
  grid-area: stats;
`;

const ChartsArea = styled.div`
  grid-area: charts;
`;

const RecentArea = styled.div`
  grid-area: recent;
`;

const ActionsArea = styled.div`
  grid-area: actions;
`;

const ErrorContainer = styled.div`
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  min-height: 40rem;
`;

function Dashboard() {
  const navigate = useNavigate();

  // Get filters and converted stats filters
  const { filters, updateFilter, resetFilters, statsFilters } =
    useDashboardFilters();

  // Fetch stats with applied filters
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useCaseStats({
    filters: statsFilters, // Pass converted filters to useCaseStats
  });

  // Fetch recent cases with applied filters (except date range for recent items)
  const recentCasesFilters = {
    ...(filters.statusId !== "all" && { statusId: filters.statusId }),
    ...(filters.priorityId !== "all" && { priorityId: filters.priorityId }),
    ...(filters.categoryId !== "all" && { categoryId: filters.categoryId }),
  };

  const {
    data: recentResponse,
    isLoading: recentLoading,
    error: recentError,
    refetch: refetchRecent,
  } = useCases({
    ...recentCasesFilters,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const recentCases = recentResponse?.data || [];

  const handleRefresh = () => {
    refetchStats();
    refetchRecent();
  };

  const handleCreateCase = () => {
    navigate("/cases/add");
  };

  const handleViewCase = (caseItem) => {
    navigate(`/cases/view/${caseItem.id}`);
  };

  const isLoading = statsLoading || recentLoading;
  const hasError = statsError || recentError;

  if (hasError && !stats && !recentCases.length) {
    return (
      <PageContainer>
        <ErrorContainer>
          <Text size="lg" weight="semibold" color="error">
            Failed to load dashboard
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            {statsError?.message ||
              recentError?.message ||
              "Something went wrong."}
          </Text>
          <Button
            variant="primary"
            size="small"
            onClick={handleRefresh}
            style={{ marginTop: "var(--spacing-3)" }}
          >
            Try Again
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <HeaderContent>
          <Heading as="h1" size="h1">
            Dashboard
          </Heading>
          <Text size="lg" color="muted">
            Overview of case management activity and key metrics
          </Text>
        </HeaderContent>

        <HeaderActions>
          <IconButton
            variant="ghost"
            size="medium"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Refresh dashboard"
          >
            <HiOutlineArrowPath />
          </IconButton>

          <Button variant="primary" size="medium" onClick={handleCreateCase}>
            <HiOutlinePlus />
            New Case
          </Button>
        </HeaderActions>
      </PageHeader>

      {/* Main Content */}
      {isLoading && !stats && !recentCases.length ? (
        <LoadingContainer>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading dashboard...
          </Text>
        </LoadingContainer>
      ) : (
        <ContentGrid aria-label="Dashboard Content">
          {/* Filters */}
          <FiltersArea>
            <DashboardFilters
              filters={filters}
              onFilterChange={updateFilter}
              onReset={resetFilters}
            />
          </FiltersArea>

          {/* Stats Cards */}
          <StatsArea>
            <DashboardStats
              stats={stats}
              isLoading={statsLoading}
              error={statsError}
            />
          </StatsArea>

          {/* Charts */}
          <ChartsArea>
            <DashboardCharts
              stats={stats}
              filters={filters}
              isLoading={statsLoading}
              error={statsError}
            />
          </ChartsArea>

          {/* Recent Cases */}
          <RecentArea>
            <RecentCases
              cases={recentCases}
              isLoading={recentLoading}
              error={recentError}
              onViewCase={handleViewCase}
              onRefresh={refetchRecent}
            />
          </RecentArea>

          {/* Quick Actions */}
          <ActionsArea>
            <QuickActions
              stats={stats}
              onCreateCase={handleCreateCase}
              onViewAll={() => navigate("/cases")}
            />
          </ActionsArea>
        </ContentGrid>
      )}
    </PageContainer>
  );
}

export default Dashboard;
