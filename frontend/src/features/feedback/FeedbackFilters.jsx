import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
} from "react-icons/hi2";

// Hooks
import { useFeedbackCategories } from "./useFeedbackData";

import Card from "../../ui/Card";
import Text from "../../ui/Text";
import StyledSelect from "../../ui/StyledSelect";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Row from "../../ui/Row";
import Column from "../../ui/Column";

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
// receive props
const TextSpan = styled.span`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
  display: inline;
`;

function FeedbackFilters({
  // Search props
  searchQuery,
  onSearchChange,

  // Filter props
  filters,
  onFilterChange,
  onReset,

  // Results info
  totalResults,
  filteredResults,
  isLoading,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get categories from API
  const { data: categories, isLoading: isLoadingCategories } =
    useFeedbackCategories();

  // Filter options
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "archived", label: "Archived" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "6m", label: "Last 6 months" },
    { value: "1y", label: "Last year" },
  ];

  // Create category options with loading state handling
  const categoryOptions = isLoadingCategories
    ? [{ value: "loading", label: "Loading categories...", disabled: true }]
    : [
        { value: "all", label: "All Categories" },
        ...(categories?.map((category) => ({
          value: category.id,
          label: category.name,
        })) || []),
      ];

  // Check if any filters are active
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
            <FilterLabel size="sm">Search Feedback</FilterLabel>
            <Input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, description, or feedback number..."
              leftIcon={<HiOutlineMagnifyingGlass />}
              size="medium"
            />
          </SearchField>

          <ToggleButton
            variant="ghost"
            size="medium"
            onClick={handleToggleFilters}
            aria-label={isExpanded ? "Hide filters" : "Show filters"}
          >
            <HiOutlineFunnel />
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </ToggleButton>
        </SearchSection>

        {/* Advanced Filters - Collapsible */}
        {isExpanded && (
          <>
            <FiltersHeader>
              <Row align="center" gap={2}>
                <HiOutlineAdjustmentsHorizontal />
                <Text size="md" weight="semibold">
                  Advanced Filters
                </Text>
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
                    {Object.values(filters).filter((v) => v !== "all").length +
                      (searchQuery?.trim() ? 1 : 0)}
                  </Text>
                )}
              </Row>

              {hasActiveFilters && (
                <Button variant="ghost" size="small" onClick={onReset}>
                  <HiOutlineXMark />
                  Clear All
                </Button>
              )}
            </FiltersHeader>

            <FiltersGrid>
              <FilterField>
                <FilterLabel size="sm">Status</FilterLabel>
                <StyledSelect
                  value={filters.status}
                  onChange={(value) => onFilterChange("status", value)}
                  options={statusOptions}
                  placeholder="Select status"
                  size="medium"
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Priority</FilterLabel>
                <StyledSelect
                  value={filters.priority}
                  onChange={(value) => onFilterChange("priority", value)}
                  options={priorityOptions}
                  placeholder="Select priority"
                  size="medium"
                />
              </FilterField>

              <FilterField>
                <FilterLabel size="sm">Category</FilterLabel>
                <StyledSelect
                  value={filters.category}
                  onChange={(value) => onFilterChange("category", value)}
                  options={categoryOptions}
                  placeholder="Select category"
                  size="medium"
                  disabled={isLoadingCategories}
                  emptyMessage="No categories found"
                />
              </FilterField>

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
            </FiltersGrid>
          </>
        )}

        {/* Results Info */}
        <ResultsInfo>
          <Text size="sm" color="muted">
            {isLoading ? (
              "Loading feedback..."
            ) : hasActiveFilters ? (
              <>
                Showing <TextSpan>{filteredResults}</TextSpan> of
                <TextSpan> {totalResults} </TextSpan> feedback entries
              </>
            ) : (
              <>
                <TextSpan>{totalResults}</TextSpan> feedback entries total
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

FeedbackFilters.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  totalResults: PropTypes.number,
  filteredResults: PropTypes.number,
  isLoading: PropTypes.bool,
};

export default FeedbackFilters;
