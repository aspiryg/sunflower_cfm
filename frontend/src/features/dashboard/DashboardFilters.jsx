import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineXMark,
} from "react-icons/hi2";

// Import case data hooks instead of feedback hooks
import {
  useCaseCategories,
  useCaseStatuses,
  useCasePriorities,
} from "../cases/useCaseData";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import StyledSelect from "../../ui/StyledSelect";
import Button from "../../ui/Button";

const FiltersCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--spacing-4);
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-3);
  }
`;

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const FilterLabel = styled(Text)`
  color: var(--color-grey-700);
  font-weight: var(--font-weight-medium);
`;

function DashboardFilters({ filters, onFilterChange, onReset }) {
  // Get case data from useCaseData hooks
  const { data: categories, isLoading: isLoadingCategories } =
    useCaseCategories();
  const { data: statuses, isLoading: isLoadingStatuses } = useCaseStatuses();
  const { data: priorities, isLoading: isLoadingPriorities } =
    useCasePriorities();

  const dateRangeOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All time" },
  ];

  // Create status options with loading state handling
  const statusOptions = isLoadingStatuses
    ? [{ value: "loading", label: "Loading statuses...", disabled: true }]
    : [
        { value: "all", label: "All Statuses" },
        ...(statuses?.activeOptions?.sort((a, b) => a.value - b.value) || []),
      ];

  // Create priority options with loading state handling
  const priorityOptions = isLoadingPriorities
    ? [{ value: "loading", label: "Loading priorities...", disabled: true }]
    : [
        { value: "all", label: "All Priorities" },
        ...(priorities?.activeOptions?.sort((a, b) => a.value - b.value) || []),
      ];

  // Create category options with loading state handling
  const categoryOptions = isLoadingCategories
    ? [{ value: "loading", label: "Loading categories...", disabled: true }]
    : [
        { value: "all", label: "All Categories" },
        ...(categories?.activeOptions?.sort((a, b) => a.value - b.value) || []),
      ];

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "all" && value !== "30d"
  );

  return (
    <FiltersCard>
      <FiltersHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
          }}
        >
          <HiOutlineAdjustmentsHorizontal />
          <Text size="md" weight="semibold">
            Filters
          </Text>
          {/* Show active filter count */}
          {hasActiveFilters && (
            <Text
              size="xs"
              style={{
                backgroundColor: "var(--color-brand-100)",
                color: "var(--color-brand-700)",
                padding: "var(--spacing-1) var(--spacing-2)",
                borderRadius: "var(--border-radius-full)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {
                Object.values(filters).filter((v) => v !== "all" && v !== "30d")
                  .length
              }
            </Text>
          )}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="small" onClick={onReset}>
            <HiOutlineXMark />
            Clear All
          </Button>
        )}
      </FiltersHeader>

      <FiltersGrid>
        <FilterField>
          <FilterLabel size="sm">Date Range</FilterLabel>
          <StyledSelect
            value={filters.dateRange}
            onChange={(value) => onFilterChange("dateRange", value)}
            options={dateRangeOptions}
            placeholder="Select date range"
            size="medium"
          />
        </FilterField>

        <FilterField>
          <FilterLabel size="sm">Status</FilterLabel>
          <StyledSelect
            value={filters.statusId}
            onChange={(value) => onFilterChange("statusId", value)}
            options={statusOptions}
            placeholder="Select status"
            size="medium"
            disabled={isLoadingStatuses}
            emptyMessage="No statuses found"
          />
        </FilterField>

        <FilterField>
          <FilterLabel size="sm">Priority</FilterLabel>
          <StyledSelect
            value={filters.priorityId}
            onChange={(value) => onFilterChange("priorityId", value)}
            options={priorityOptions}
            placeholder="Select priority"
            size="medium"
            disabled={isLoadingPriorities}
            emptyMessage="No priorities found"
          />
        </FilterField>

        <FilterField>
          <FilterLabel size="sm">Category</FilterLabel>
          <StyledSelect
            value={filters.categoryId}
            onChange={(value) => onFilterChange("categoryId", value)}
            options={categoryOptions}
            placeholder="Select category"
            size="medium"
            disabled={isLoadingCategories}
            emptyMessage="No categories found"
          />
        </FilterField>
      </FiltersGrid>
    </FiltersCard>
  );
}

DashboardFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default DashboardFilters;
