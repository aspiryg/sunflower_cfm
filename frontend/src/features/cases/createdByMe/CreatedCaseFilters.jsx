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
import { useUsers } from "../../user/useUsers";
import Card from "../../../ui/Card";
import Text from "../../../ui/Text";
import StyledSelect from "../../../ui/StyledSelect";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";

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

function CreatedCaseFilters({
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
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();

  const users = usersData?.data || [];

  // Filter options (customized for created cases)
  const statusOptions = isLoadingStatuses
    ? [{ value: "loading", label: "Loading...", disabled: true }]
    : [
        { value: "all", label: "All Statuses" },
        ...(statuses?.activeOptions?.sort((a, b) => a.value - b.value) || []),
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

  const assignedToOptions = isLoadingUsers
    ? [{ value: "loading", label: "Loading...", disabled: true }]
    : [
        { value: "all", label: "All Cases" },
        { value: "unassigned", label: "Unassigned", disabled: true },
        ...users
          .filter((user) => user.isActive)
          .map((user) => ({
            value: user.id,
            label: `${user.firstName} ${user.lastName}`.trim() || user.username,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last year" },
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
            <FilterLabel size="sm">Search My Created Cases</FilterLabel>
            <Input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by case title, number, assignee, provider..."
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
                <FilterLabel size="sm">Assigned To</FilterLabel>
                <StyledSelect
                  value={filters.assignedTo}
                  onChange={(value) => onFilterChange("assignedTo", value)}
                  options={assignedToOptions}
                  size="medium"
                  disabled={isLoadingUsers}
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Creation Period</FilterLabel>
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
              "Loading your created cases..."
            ) : hasActiveFilters ? (
              <>
                Showing <strong>{filteredResults}</strong> of{" "}
                <strong>{totalResults}</strong> created cases
              </>
            ) : (
              <>
                <strong>{totalResults}</strong> cases created by{" "}
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

CreatedCaseFilters.propTypes = {
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

export default CreatedCaseFilters;
