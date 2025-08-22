import { useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiMagnifyingGlass,
  HiXMark,
  HiAdjustmentsHorizontal,
  HiOutlineUsers,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Input from "../../ui/Input";
import StyledSelect from "../../ui/StyledSelect";
import Text from "../../ui/Text";
import Badge from "../../ui/Badge";

const FiltersCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
`;

const FiltersTitle = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const FiltersActions = styled.div`
  display: flex;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    justify-content: space-between;
  }
`;

const FiltersContent = styled.div`
  display: grid;
  gap: var(--spacing-4);
`;

const SearchSection = styled.div`
  position: relative;
`;

const SearchInput = styled(Input)`
  padding-left: var(--spacing-10);

  &::placeholder {
    color: var(--color-grey-400);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-grey-400);
  pointer-events: none;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

const ClearSearchButton = styled(IconButton)`
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
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
  gap: var(--spacing-2);
`;

const FilterLabel = styled(Text)`
  color: var(--color-grey-700);
  font-weight: var(--font-weight-medium);
`;

const ResultsInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);
  margin-top: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }
`;

const ResultsText = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  align-items: center;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const FilterBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-in-out);

  &:hover {
    opacity: 0.7;
  }
`;

function UsersFilters({
  searchQuery = "",
  onSearchChange,
  filters = {},
  onFilterChange,
  onReset,
  totalResults = 0,
  filteredResults = 0,
  isLoading = false,
  availableRoles = [],
  availableOrganizations = [],
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      super_admin: "Super Admin",
      admin: "Admin",
      manager: "Manager",
      staff: "Staff",
      user: "User",
    };
    return roleNames[role] || role;
  };

  // Build role options from available data
  const roleOptions = [
    { value: "all", label: "All Roles" },
    ...availableRoles.map((role) => ({
      value: role,
      label: getRoleDisplayName(role),
    })),
  ];

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  // Build organization options from available data
  const organizationOptions = [
    { value: "all", label: "All Organizations" },
    ...availableOrganizations
      .filter((org) => org && org.trim()) // Filter out empty/null organizations
      .sort()
      .map((org) => ({
        value: org,
        label: org.charAt(0).toUpperCase() + org.slice(1), // Capitalize first letter
      })),
  ];

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    Object.values(filters).some((value) => value && value !== "all");

  // Get active filter labels for display
  const getActiveFilterLabels = () => {
    const labels = [];

    if (searchQuery) {
      labels.push({
        key: "search",
        label: `Search: "${searchQuery}"`,
        onRemove: () => onSearchChange?.(""),
      });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        let label = "";
        let onRemove = () => onFilterChange?.(key, "all");

        switch (key) {
          case "role":
            label = `Role: ${getRoleDisplayName(value)}`;
            break;
          case "status":
            label = `Status: ${value === "active" ? "Active" : "Inactive"}`;
            break;
          case "organization":
            label = `Org: ${value.charAt(0).toUpperCase() + value.slice(1)}`;
            break;
          default:
            label = `${key}: ${value}`;
        }

        labels.push({
          key: `${key}-${value}`,
          label,
          onRemove,
        });
      }
    });

    return labels;
  };

  const handleSearchClear = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleToggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  const activeFilterLabels = getActiveFilterLabels();

  const handleKeyDown = (e) => {
    // Allow clearing search with Escape key
    if (e.key === "Escape" && searchQuery) {
      handleSearchClear();
    }
  };

  return (
    <FiltersCard>
      <FiltersHeader>
        <FiltersTitle>
          <HiAdjustmentsHorizontal />
          <Text weight="medium">Search & Filters</Text>
        </FiltersTitle>
        <FiltersActions>
          <Button variant="ghost" size="small" onClick={handleToggleFilters}>
            {isExpanded ? "Hide Filters" : "Show Filters"}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="small" onClick={onReset}>
              Clear All
            </Button>
          )}
        </FiltersActions>
      </FiltersHeader>

      <FiltersContent>
        {/* Search Section */}
        <SearchSection>
          <SearchIcon>
            <HiMagnifyingGlass />
          </SearchIcon>
          <SearchInput
            placeholder="Search users by name, email, or username..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoComplete="off"
          />
          {searchQuery && (
            <ClearSearchButton
              variant="ghost"
              size="small"
              onClick={handleSearchClear}
              aria-label="Clear search"
            >
              <HiXMark />
            </ClearSearchButton>
          )}
        </SearchSection>

        {/* Advanced Filters */}
        {isExpanded && (
          <FiltersGrid>
            <FilterField>
              <FilterLabel size="sm">Role</FilterLabel>
              <StyledSelect
                value={filters.role || "all"}
                options={roleOptions}
                onChange={(value) => onFilterChange?.("role", value)}
                disabled={isLoading}
                placeholder="Select role..."
              />
            </FilterField>

            <FilterField>
              <FilterLabel size="sm">Status</FilterLabel>
              <StyledSelect
                value={filters.status || "all"}
                options={statusOptions}
                onChange={(value) => onFilterChange?.("status", value)}
                disabled={isLoading}
                placeholder="Select status..."
              />
            </FilterField>

            <FilterField>
              <FilterLabel size="sm">Organization</FilterLabel>
              <StyledSelect
                value={filters.organization || "all"}
                options={organizationOptions}
                onChange={(value) => onFilterChange?.("organization", value)}
                disabled={isLoading}
                placeholder="Select organization..."
              />
            </FilterField>
          </FiltersGrid>
        )}

        {/* Results Info */}
        <ResultsInfo>
          <ResultsText>
            <HiOutlineUsers />
            <Text size="sm" color="muted">
              {isLoading
                ? "Loading users..."
                : filteredResults !== totalResults
                ? `Showing ${filteredResults.toLocaleString()} of ${totalResults.toLocaleString()} users`
                : `${totalResults.toLocaleString()} ${
                    totalResults === 1 ? "user" : "users"
                  } total`}
            </Text>
          </ResultsText>

          {/* Active Filters Display */}
          {activeFilterLabels.length > 0 && (
            <ActiveFilters>
              <Text size="xs" color="muted">
                Active filters:
              </Text>
              {activeFilterLabels.map((filter) => (
                <FilterBadge
                  key={filter.key}
                  variant="blue"
                  size="sm"
                  onClick={filter.onRemove}
                  title={`Click to remove: ${filter.label}`}
                >
                  {filter.label}
                  <HiXMark size={12} />
                </FilterBadge>
              ))}
            </ActiveFilters>
          )}
        </ResultsInfo>
      </FiltersContent>
    </FiltersCard>
  );
}

UsersFilters.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onReset: PropTypes.func,
  totalResults: PropTypes.number,
  filteredResults: PropTypes.number,
  isLoading: PropTypes.bool,
  availableRoles: PropTypes.array,
  availableOrganizations: PropTypes.array,
};

export default UsersFilters;
