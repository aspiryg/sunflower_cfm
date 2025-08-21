import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const variants = {
  // Status variants
  open: css`
    background-color: var(--color-blue-100);
    color: var(--color-blue-700);
    border: 1px solid var(--color-blue-200);
  `,
  pending: css`
    background-color: var(--color-warning-100);
    color: var(--color-warning-700);
    border: 1px solid var(--color-warning-200);
  `,
  in_progress: css`
    background-color: var(--color-blue-100);
    color: var(--color-blue-700);
    border: 1px solid var(--color-blue-200);
  `,
  reviewing: css`
    background-color: var(--color-purple-100);
    color: var(--color-purple-700);
    border: 1px solid var(--color-purple-200);
  `,
  resolved: css`
    background-color: var(--color-success-100);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-200);
  `,
  closed: css`
    background-color: var(--color-success-100);
    color: var(--color-success-700);
    border: 1px solid var(--color-success-200);
  `,
  rejected: css`
    background-color: var(--color-error-100);
    color: var(--color-error-700);
    border: 1px solid var(--color-error-200);
  `,

  warning: css`
    background-color: var(--color-warning-100);
    color: var(--color-warning-700);
    border: 1px solid var(--color-warning-200);
  `,

  // Priority variants
  low: css`
    background-color: var(--color-green-100);
    color: var(--color-green-700);
    border: 1px solid var(--color-green-200);
  `,
  medium: css`
    background-color: var(--color-yellow-100);
    color: var(--color-yellow-700);
    border: 1px solid var(--color-yellow-200);
  `,
  high: css`
    background-color: var(--color-orange-100);
    color: var(--color-orange-700);
    border: 1px solid var(--color-orange-200);
  `,
  urgent: css`
    background-color: var(--color-error-100);
    color: var(--color-error-700);
    border: 1px solid var(--color-error-200);
  `,

  // Category variants (neutral styles)
  category: css`
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
    border: 1px solid var(--color-grey-200);
  `,

  // Default
  default: css`
    background-color: var(--color-grey-100);
    color: var(--color-grey-600);
    border: 1px solid var(--color-grey-200);
  `,
};

const sizes = {
  xs: css`
    width: 6rem;
    height: 2rem;
    font-size: var(--font-size-xxs);
    padding: 0 var(--spacing-1);
  `,
  sm: css`
    width: 8rem;
    height: 2.4rem;
    font-size: var(--font-size-xs);
    padding: 0 var(--spacing-2);
  `,
  md: css`
    width: 10rem;
    height: 2.8rem;
    font-size: var(--font-size-sm);
    padding: 0 var(--spacing-3);
  `,
  lg: css`
    width: 12rem;
    height: 3.2rem;
    font-size: var(--font-size-base);
    padding: 0 var(--spacing-4);
  `,
  privacy: css`
    width: fit-content;
    height: 2.4rem;
    font-size: var(--font-size-xs);
    padding: 0 var(--spacing-2);
  `,
};

const StatusBadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  transition: all var(--duration-normal) var(--ease-in-out);

  /* Apply size styles */
  ${(props) => sizes[props.$size]}

  /* Apply variant styles */
  ${(props) => variants[props.$variant] || variants.default}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Status display mapping for better readability
const statusDisplayMap = {
  open: "Open",
  pending: "Pending",
  in_progress: "In Progress",
  reviewing: "Reviewing",
  resolved: "Resolved",
  closed: "Closed",
  rejected: "Rejected",

  // Priority
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// Auto-detect variant based on content
const getVariantFromContent = (content) => {
  const lowerContent = content?.toLowerCase();

  // Status variants
  if (
    [
      "open",
      "pending",
      "in_progress",
      "reviewing",
      "resolved",
      "closed",
      "rejected",
    ].includes(lowerContent)
  ) {
    return lowerContent;
  }

  // Priority variants
  if (["low", "medium", "high", "urgent"].includes(lowerContent)) {
    return lowerContent;
  }

  // Default to category style for everything else
  return "category";
};

function StatusBadge({
  content,
  variant,
  size = "sm",
  className = "",
  title,
  ...props
}) {
  // Auto-detect variant if not provided
  const badgeVariant = variant || getVariantFromContent(content);

  // Get display text (with proper formatting)
  const displayText =
    statusDisplayMap[content?.toLowerCase()] || content || "N/A";

  return (
    <StatusBadgeContainer
      $variant={badgeVariant}
      $size={size}
      className={className}
      title={title || displayText}
      {...props}
    >
      {displayText}
    </StatusBadgeContainer>
  );
}

StatusBadge.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.oneOf([
    "open",
    "pending",
    "in_progress",
    "reviewing",
    "resolved",
    "closed",
    "rejected",
    "low",
    "medium",
    "high",
    "urgent",
    "category",
    "default",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  title: PropTypes.string,
};

export default StatusBadge;
