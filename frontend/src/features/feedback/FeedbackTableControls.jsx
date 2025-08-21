import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineAdjustmentsVertical,
} from "react-icons/hi2";

import Text from "../../ui/Text";
import IconButton from "../../ui/IconButton";
import StyledSelect from "../../ui/StyledSelect";
import Row from "../../ui/Row";

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--color-grey-25);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-100);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-3);
  }
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 50%;

  @media (max-width: 1024px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--spacing-2);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
    width: 100%;
  }
`;

const SortFieldSelect = styled(StyledSelect)`
  @media (min-width: 1200px) {
    min-width: 18rem;
  }

  @media (min-width: 1024px) and (max-width: 1199px) {
    min-width: 16rem;
  }

  @media (min-width: 769px) and (max-width: 1023px) {
    min-width: 14rem;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SortOrderSelect = styled(StyledSelect)`
  @media (min-width: 1200px) {
    min-width: 16rem;
  }

  @media (min-width: 1024px) and (max-width: 1199px) {
    min-width: 14rem;
  }

  @media (min-width: 769px) and (max-width: 1023px) {
    min-width: 12rem;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
`;

const PageSizeControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    flex: 1;
    justify-content: flex-start;
  }
`;

const PageNavigation = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 768px) {
    flex: 1;
    justify-content: flex-end;
  }
`;

const PageInfo = styled(Text)`
  white-space: nowrap;
  font-weight: var(--font-weight-medium);

  @media (max-width: 480px) {
    font-size: var(--font-size-xs);
  }
`;

const SortLabel = styled(Row)`
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

/**
 * Get sort field type for dynamic sort order labels
 * @param {string} sortBy - current sort field
 * @returns {string} - field type (date, string, number, etc.)
 */
function getSortFieldType(sortBy) {
  const dateFields = ["createdAt", "updatedAt", "submittedAt"];
  const stringFields = [
    "title",
    "status",
    "priority",
    "category",
    "feedbackNumber",
  ];
  const numberFields = ["id", "number"];

  if (dateFields.includes(sortBy)) return "date";
  if (numberFields.includes(sortBy)) return "number";
  if (stringFields.includes(sortBy)) return "string";

  return "string"; // default
}

/**
 * Get dynamic sort order options based on field type
 * @param {string} sortBy - current sort field
 * @returns {Array} - sort order options
 */
function getSortOrderOptions(sortBy) {
  const fieldType = getSortFieldType(sortBy);

  switch (fieldType) {
    case "date":
      return [
        { value: "desc", label: "Newest First" },
        { value: "asc", label: "Oldest First" },
      ];

    case "number":
      return [
        { value: "desc", label: "Highest First" },
        { value: "asc", label: "Lowest First" },
      ];

    case "string":
    default:
      // For status, priority, and other string fields, use contextual labels
      if (sortBy === "status") {
        return [
          { value: "asc", label: "Status A-Z" },
          { value: "desc", label: "Status Z-A" },
        ];
      }

      if (sortBy === "priority") {
        return [
          { value: "desc", label: "High to Low" },
          { value: "asc", label: "Low to High" },
        ];
      }

      if (sortBy === "title") {
        return [
          { value: "asc", label: "Title A-Z" },
          { value: "desc", label: "Title Z-A" },
        ];
      }

      if (sortBy === "feedbackNumber") {
        return [
          { value: "desc", label: "Latest Numbers" },
          { value: "asc", label: "Earliest Numbers" },
        ];
      }

      // Default string sorting
      return [
        { value: "asc", label: "A to Z" },
        { value: "desc", label: "Z to A" },
      ];
  }
}

function FeedbackTableControls({
  // Sorting
  sortBy,
  sortOrder,
  onSort,

  // Pagination
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,

  // Data info
  totalItems,
  startItem,
  endItem,
}) {
  // Sort options
  const sortOptions = [
    { value: "createdAt", label: "Date Created" },
    { value: "updatedAt", label: "Last Updated" },
    { value: "title", label: "Title" },
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "feedbackNumber", label: "Feedback Number" },
  ];

  // Dynamic sort order options based on selected field
  const sortOrderOptions = getSortOrderOptions(sortBy);

  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  const handleSortChange = (field, order) => {
    onSort(field, order);
  };

  return (
    <ControlsContainer>
      {/* Sort Controls */}
      <SortControls>
        <SortLabel align="center" gap={2}>
          <HiOutlineAdjustmentsVertical />
          <Text size="sm" weight="medium">
            Sort by:
          </Text>
        </SortLabel>

        <SortFieldSelect
          value={sortBy}
          onChange={(value) => handleSortChange(value, sortOrder)}
          options={sortOptions}
          size="small"
        />

        <SortOrderSelect
          value={sortOrder}
          onChange={(value) => handleSortChange(sortBy, value)}
          options={sortOrderOptions}
          size="small"
        />
      </SortControls>

      {/* Pagination & Page Size Controls */}
      <PaginationControls>
        {/* Page Size */}
        <PageSizeControls>
          <Text size="sm" color="muted">
            Show:
          </Text>
          <StyledSelect
            value={pageSize}
            onChange={onPageSizeChange}
            options={pageSizeOptions}
            size="small"
            style={{ minWidth: "10rem" }}
          />
        </PageSizeControls>

        {/* Page Navigation */}
        <PageNavigation>
          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <HiChevronLeft />
          </IconButton>

          <PageInfo size="sm">
            {totalItems > 0 ? (
              <>
                {startItem}-{endItem} of {totalItems}
              </>
            ) : (
              "No items"
            )}
          </PageInfo>

          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            aria-label="Next page"
          >
            <HiChevronRight />
          </IconButton>
        </PageNavigation>
      </PaginationControls>
    </ControlsContainer>
  );
}

FeedbackTableControls.propTypes = {
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.oneOf(["asc", "desc"]).isRequired,
  onSort: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  startItem: PropTypes.number.isRequired,
  endItem: PropTypes.number.isRequired,
};

export default FeedbackTableControls;
