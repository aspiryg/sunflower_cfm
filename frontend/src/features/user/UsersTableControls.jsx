import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiArrowsUpDown,
  HiArrowUp,
  HiArrowDown,
} from "react-icons/hi2";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import StyledSelect from "../../ui/StyledSelect";
import Text from "../../ui/Text";

const ControlsCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-3);
  }
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    justify-content: center;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const PageSizeControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SortButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  min-width: auto;
  white-space: nowrap;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 640px) {
    width: 100%;
    justify-content: space-between;
  }
`;

function UsersTableControls({
  // Sorting
  sortBy = "createdAt",
  sortOrder = "desc",
  onSort,

  // Pagination
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  totalItems = 0,
  startItem = 0,
  endItem = 0,
}) {
  // Sort options
  const sortOptions = [
    { value: "createdAt", label: "Date Joined" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "email", label: "Email" },
    { value: "role", label: "Role" },
    { value: "lastLogin", label: "Last Login" },
    { value: "isActive", label: "Status" },
    { value: "organization", label: "Organization" },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Toggle order if same field
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      onSort?.(sortBy, newOrder);
    } else {
      // Default to desc for new field
      onSort?.(newSortBy, "desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <HiArrowsUpDown />;
    }
    return sortOrder === "asc" ? <HiArrowUp /> : <HiArrowDown />;
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return option ? option.label : sortBy;
  };

  // Generate page numbers for pagination
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <ControlsCard>
      <LeftControls>
        {/* Sort Controls */}
        <SortControls>
          <Text size="sm" color="muted" weight="medium">
            Sort by:
          </Text>
          <StyledSelect
            value={sortBy}
            options={sortOptions}
            onChange={handleSortChange}
            size="small"
          />
          <SortButton
            variant="ghost"
            size="small"
            onClick={() => handleSortChange(sortBy)}
            aria-label={`Sort ${
              sortOrder === "asc" ? "descending" : "ascending"
            }`}
          >
            {getSortIcon(sortBy)}
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </SortButton>
        </SortControls>
      </LeftControls>

      <RightControls>
        {/* Page Size Controls */}
        <PageSizeControls>
          <ControlGroup>
            <Text size="sm" color="muted" weight="medium">
              Show:
            </Text>
            <StyledSelect
              value={pageSize.toString()}
              options={pageSizeOptions}
              onChange={(value) => onPageSizeChange?.(parseInt(value))}
              size="small"
            />
          </ControlGroup>
        </PageSizeControls>

        {/* Pagination Info */}
        <PaginationInfo>
          <Text size="sm" color="muted">
            {totalItems > 0 ? (
              <>
                Showing {startItem.toLocaleString()}-{endItem.toLocaleString()}{" "}
                of {totalItems.toLocaleString()}
              </>
            ) : (
              "No results"
            )}
          </Text>
        </PaginationInfo>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <PaginationControls>
            <IconButton
              variant="ghost"
              size="small"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              <HiChevronDoubleLeft />
            </IconButton>

            <IconButton
              variant="ghost"
              size="small"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <HiChevronLeft />
            </IconButton>

            {/* Page Numbers */}
            {getVisiblePages().map((page, index) => {
              if (page === "...") {
                return (
                  <Text
                    key={`dots-${index}`}
                    size="sm"
                    style={{
                      padding: "0 var(--spacing-1)",
                      minWidth: "2rem",
                      textAlign: "center",
                    }}
                  >
                    ...
                  </Text>
                );
              }

              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="small"
                  onClick={() => onPageChange?.(page)}
                  style={{ minWidth: "2.5rem" }}
                >
                  {page}
                </Button>
              );
            })}

            <IconButton
              variant="ghost"
              size="small"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <HiChevronRight />
            </IconButton>

            <IconButton
              variant="ghost"
              size="small"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              <HiChevronDoubleRight />
            </IconButton>
          </PaginationControls>
        )}
      </RightControls>
    </ControlsCard>
  );
}

UsersTableControls.propTypes = {
  // Sorting
  sortBy: PropTypes.string,
  sortOrder: PropTypes.oneOf(["asc", "desc"]),
  onSort: PropTypes.func,

  // Pagination
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  totalItems: PropTypes.number,
  startItem: PropTypes.number,
  endItem: PropTypes.number,
};

export default UsersTableControls;
