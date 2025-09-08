import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineXMark,
} from "react-icons/hi2";

import {
  useCaseStatuses,
  useCasePriorities,
  useCaseCategories,
} from "../useCaseData";
import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import StyledSelect from "../../../ui/StyledSelect";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Row from "../../../ui/Row";

const FiltersCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const FiltersContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const SearchSection = styled.div`
  display: flex;
  gap: var(--spacing-3);
  align-items: end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchField = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
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

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);
`;

const ToggleButton = styled(Button)`
  border-radius: var(--border-radius-md);
`;

function AssignedCaseFilters({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onReset,
  totalResults,
  filteredResults,
  isLoading,
  currentUser,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get lookup data
  const { data: statuses, isLoading: isLoadingStatuses } = useCaseStatuses();
  const { data: priorities, isLoading: isLoadingPriorities } =
    useCasePriorities();
  const { data: categories, isLoading: isLoadingCategories } =
    useCaseCategories();

  // Filter options (simplified for assigned cases)
  const statusOptions = isLoadingStatuses
    ? [{ value: "loading", label: "Loading...", disabled: true }]
    : [
        { value: "all", label: "All Statuses" },
        ...(statuses?.openStatuses
          ?.map((s) => ({
            value: s.id,
            label: s.name,
          }))
          ?.sort((a, b) => a.value - b.value) || []),
      ];

  const priorityOptions = isLoadingPriorities
    ? [{ value: "loading", label: "Loading...", disabled: true }]
    : [
        { value: "all", label: "All Priorities" },
        ...(priorities?.activeOptions?.sort((a, b) => a.value - b.value) || []),
      ];

  const categoryOptions = isLoadingCategories
    ? [{ value: "loading", label: "Loading...", disabled: true }]
    : [
        { value: "all", label: "All Categories" },
        ...(categories?.activeOptions?.sort((a, b) => a.value - b.value) || []),
      ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
  ];

  const hasActiveFilters =
    Object.values(filters).some((value) => value !== "all") ||
    searchQuery?.trim();

  const handleToggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <FiltersCard>
      <FiltersContent>
        {/* Search Section - Always Visible */}
        <SearchSection>
          <SearchField>
            <FilterLabel size="sm">Search My Assigned Cases</FilterLabel>
            <Input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by case title, number, submitter..."
              leftIcon={<HiOutlineMagnifyingGlass />}
              size="medium"
            />
          </SearchField>

          <ToggleButton
            variant="ghost"
            size="medium"
            onClick={handleToggleFilters}
          >
            <HiOutlineFunnel />
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </ToggleButton>
        </SearchSection>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text size="md" weight="semibold">
                Filter Options
              </Text>
              {hasActiveFilters && (
                <Button variant="ghost" size="small" onClick={onReset}>
                  <HiOutlineXMark />
                  Clear All
                </Button>
              )}
            </div>

            <FiltersGrid>
              <FilterField>
                <FilterLabel size="sm">Status</FilterLabel>
                <StyledSelect
                  value={filters.statusId}
                  onChange={(value) => onFilterChange("statusId", value)}
                  options={statusOptions}
                  size="medium"
                  disabled={isLoadingStatuses}
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Priority</FilterLabel>
                <StyledSelect
                  value={filters.priorityId}
                  onChange={(value) => onFilterChange("priorityId", value)}
                  options={priorityOptions}
                  size="medium"
                  disabled={isLoadingPriorities}
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Category</FilterLabel>
                <StyledSelect
                  value={filters.categoryId}
                  onChange={(value) => onFilterChange("categoryId", value)}
                  options={categoryOptions}
                  size="medium"
                  disabled={isLoadingCategories}
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Assignment Period</FilterLabel>
                <StyledSelect
                  value={filters.dateRange}
                  onChange={(value) => onFilterChange("dateRange", value)}
                  options={dateRangeOptions}
                  size="medium"
                />
              </FilterField>
            </FiltersGrid>
          </>
        )}

        {/* Results Info */}
        <ResultsInfo>
          <Text size="sm" color="muted">
            {isLoading ? (
              "Loading your assigned cases..."
            ) : hasActiveFilters ? (
              <>
                Showing <strong>{filteredResults}</strong> of{" "}
                <strong>{totalResults}</strong> assigned cases
              </>
            ) : (
              <>
                <strong>{totalResults}</strong> cases assigned to{" "}
                <strong>
                  {currentUser?.firstName} {currentUser?.lastName}
                </strong>
              </>
            )}
          </Text>

          {hasActiveFilters && (
            <Text size="xs" color="brand">
              Filters active
            </Text>
          )}
        </ResultsInfo>
      </FiltersContent>
    </FiltersCard>
  );
}

AssignedCaseFilters.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  totalResults: PropTypes.number,
  filteredResults: PropTypes.number,
  isLoading: PropTypes.bool,
  currentUser: PropTypes.object,
};

export default AssignedCaseFilters;
