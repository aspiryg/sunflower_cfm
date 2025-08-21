import styled from "styled-components";
import PropTypes from "prop-types";

const StyledMenuItemGroup = styled.div`
  padding: var(--spacing-2) 0;

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }
`;

const GroupLabel = styled.div`
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

/**
 * Reusable MenuItemGroup component for organizing menu items
 *
 * Features:
 * - Optional group label
 * - Automatic separator between groups
 * - Consistent spacing
 */
function MenuItemGroup({ children, label, className = "", ...props }) {
  return (
    <StyledMenuItemGroup className={className} {...props}>
      {label && <GroupLabel>{label}</GroupLabel>}
      {children}
    </StyledMenuItemGroup>
  );
}

MenuItemGroup.propTypes = {
  children: PropTypes.node.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default MenuItemGroup;
