// Create this file: /frontend/src/features/cases/CaseTableControls.jsx
import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineArrowsUpDown,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from "react-icons/hi2";

import Button from "../../ui/Button";
import IconButton from "../../ui/IconButton";
import Text from "../../ui/Text";
import StyledSelect from "../../ui/StyledSelect";
import Row from "../../ui/Row";

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-3);
  }
`;

const SortingControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 480px) {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: stretch;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 480px) {
    flex-direction: column;
    gap: var(--spacing-2);
    align-items: stretch;
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const PageSizeControl = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const SortButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  min-width: fit-content;
`;

function CaseTableControls({
  // Sorting props
  sortBy,
  sortOrder,
  onSort,

  // Pagination props
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
    { value: "caseNumber", label: "Case Number" },
    { value: "status", label: "Status" },
    { value: "priority", label: "Priority" },
    { value: "urgencyLevel", label: "Urgency Level" },
    { value: "category", label: "Category" },
    { value: "submittedBy", label: "Submitted By" },
    { value: "assignedTo", label: "Assigned To" },
    { value: "submittedAt", label: "Submitted Date" },
    { value: "assignedAt", label: "Assigned Date" },
    { value: "escalatedAt", label: "Escalated Date" },
    { value: "resolvedAt", label: "Resolved Date" },
  ];

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle order if same field
      onSort(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Default to desc for new field
      onSort(field, "desc");
    }
  };

  const getSortIcon = () => {
    if (sortOrder === "asc") return <HiOutlineArrowUp />;
    if (sortOrder === "desc") return <HiOutlineArrowDown />;
    return <HiOutlineArrowsUpDown />;
  };

  const getCurrentSortLabel = () => {
    const option = sortOptions.find((opt) => opt.value === sortBy);
    return option ? option.label : "Date Created";
  };

  return (
    <ControlsContainer>
      {/* Sorting Controls */}
      <SortingControls>
        <Text size="sm" weight="medium" color="muted">
          Sort by:
        </Text>
        <StyledSelect
          value={sortBy}
          onChange={handleSortChange}
          options={sortOptions}
          size="small"
          style={{ minWidth: "18rem" }}
        />
        <SortButton
          variant="ghost"
          size="small"
          onClick={() => handleSortChange(sortBy)}
          aria-label={`Sort ${getCurrentSortLabel()} ${
            sortOrder === "asc" ? "descending" : "ascending"
          }`}
        >
          {getSortIcon()}
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </SortButton>
      </SortingControls>

      {/* Pagination Controls */}
      <PaginationControls>
        <PaginationInfo>
          <Text size="sm" color="muted">
            Showing {startItem}-{endItem} of {totalItems} cases
          </Text>
        </PaginationInfo>

        <PaginationButtons>
          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <HiOutlineChevronDoubleLeft />
          </IconButton>

          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <HiOutlineChevronLeft />
          </IconButton>

          <Text
            size="sm"
            color="muted"
            style={{ minWidth: "8rem", textAlign: "center" }}
          >
            Page {currentPage} of {totalPages}
          </Text>

          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <HiOutlineChevronRight />
          </IconButton>

          <IconButton
            variant="ghost"
            size="small"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
          >
            <HiOutlineChevronDoubleRight />
          </IconButton>
        </PaginationButtons>

        <PageSizeControl>
          <StyledSelect
            value={pageSize}
            onChange={onPageSizeChange}
            options={pageSizeOptions}
            size="small"
            style={{ minWidth: "18rem" }}
          />
        </PageSizeControl>
      </PaginationControls>
    </ControlsContainer>
  );
}

CaseTableControls.propTypes = {
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

export default CaseTableControls;
