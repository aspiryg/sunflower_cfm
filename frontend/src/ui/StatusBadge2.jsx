import styled, { css } from "styled-components";
import PropTypes from "prop-types";

const badgeVariants = {
  // Status variants
  open: {
    background: "var(--color-blue-100)",
    color: "var(--color-blue-700)",
    border: "var(--color-blue-200)",
  },
  in_progress: {
    background: "var(--color-yellow-100)",
    color: "var(--color-yellow-700)",
    border: "var(--color-yellow-200)",
  },
  pending_response: {
    background: "var(--color-orange-100)",
    color: "var(--color-orange-700)",
    border: "var(--color-orange-200)",
  },
  resolved: {
    background: "var(--color-green-100)",
    color: "var(--color-green-700)",
    border: "var(--color-green-200)",
  },
  closed: {
    background: "var(--color-grey-100)",
    color: "var(--color-grey-700)",
    border: "var(--color-grey-200)",
  },
  archived: {
    background: "var(--color-purple-100)",
    color: "var(--color-purple-700)",
    border: "var(--color-purple-200)",
  },

  // Priority variants
  low: {
    background: "var(--color-green-100)",
    color: "var(--color-green-700)",
    border: "var(--color-green-200)",
  },
  medium: {
    background: "var(--color-yellow-100)",
    color: "var(--color-yellow-700)",
    border: "var(--color-yellow-200)",
  },
  high: {
    background: "var(--color-orange-100)",
    color: "var(--color-orange-700)",
    border: "var(--color-orange-200)",
  },
  urgent: {
    background: "var(--color-red-100)",
    color: "var(--color-red-700)",
    border: "var(--color-red-200)",
  },
};

const StyledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-weight: var(--font-weight-medium);
  border: 1px solid;
  border-radius: var(--border-radius-full);
  white-space: nowrap;
  text-transform: capitalize;

  ${(props) =>
    props.$size === "sm" &&
    css`
      padding: var(--spacing-1) var(--spacing-2);
      font-size: var(--font-size-xs);
    `}

  ${(props) =>
    props.$size === "md" &&
    css`
      padding: var(--spacing-2) var(--spacing-3);
      font-size: var(--font-size-sm);
    `}
  
  ${(props) =>
    props.$size === "lg" &&
    css`
      padding: var(--spacing-3) var(--spacing-4);
      font-size: var(--font-size-md);
    `}
  
  ${(props) => {
    const variant = badgeVariants[props.$variant] || badgeVariants.open;
    return css`
      background-color: ${variant.background};
      color: ${variant.color};
      border-color: ${variant.border};
    `;
  }}
`;

function StatusBadge({
  content,
  variant,
  size = "md",
  className = "",
  ...props
}) {
  // Auto-detect variant from content if not provided
  const detectedVariant =
    variant || content?.toLowerCase()?.replace(/\s+/g, "_");

  return (
    <StyledBadge
      $variant={detectedVariant}
      $size={size}
      className={className}
      {...props}
    >
      {content}
    </StyledBadge>
  );
}

StatusBadge.propTypes = {
  content: PropTypes.string.isRequired,
  variant: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};

export default StatusBadge;
