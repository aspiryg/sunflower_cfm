import { Link } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";
import { HiOutlineHome, HiOutlineChevronRight } from "react-icons/hi2";
import Text from "./Text";

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-3) 0;
  overflow-x: auto;
  white-space: nowrap;

  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-2) 0;
  }
`;

const BreadcrumbList = styled.ol`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  list-style: none;
  margin: 0;
  padding: 0;
`;

const BreadcrumbItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const BreadcrumbLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-fast) var(--ease-in-out);
  min-width: 0; /* Allow shrinking */

  &:hover {
    color: var(--color-brand-600);
    background-color: var(--color-brand-50);
  }

  &:focus {
    outline: 2px solid var(--color-brand-200);
    outline-offset: 2px;
    color: var(--color-brand-600);
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const BreadcrumbText = styled(Text)`
  color: var(--color-grey-800);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  svg {
    width: 1.4rem;
    height: 1.4rem;
    flex-shrink: 0;
  }
`;

const Separator = styled(HiOutlineChevronRight)`
  width: 1.2rem;
  height: 1.2rem;
  color: var(--color-grey-400);
  flex-shrink: 0;
`;

const HomeIcon = styled(HiOutlineHome)`
  width: 1.4rem;
  height: 1.4rem;
`;

/**
 * Breadcrumb Navigation Component
 *
 * Provides clear navigation context and allows users to understand their current location
 * within the application hierarchy.
 *
 * @param {Array} items - Array of breadcrumb items
 * @param {string} className - Additional CSS classes
 *
 * Each item should have:
 * - label: Display text
 * - to: Link path (optional for current page)
 * - icon: Optional icon component
 */
function Breadcrumb({ items = [], className = "", ...props }) {
  // Always include home as the first item if not explicitly provided
  const breadcrumbItems =
    items[0]?.to === "/"
      ? items
      : [{ label: "Dashboard", to: "/dashboard", icon: HomeIcon }, ...items];

  return (
    <BreadcrumbContainer
      className={className}
      aria-label="Breadcrumb navigation"
      {...props}
    >
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const IconComponent = item.icon;

          return (
            <BreadcrumbItem key={item.to || index}>
              {!isLast ? (
                <BreadcrumbLink
                  to={item.to}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {IconComponent && <IconComponent />}
                  <span>{item.label}</span>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbText
                  as="span"
                  aria-current="page"
                  title={item.label}
                >
                  {IconComponent && <IconComponent />}
                  <span>{item.label}</span>
                </BreadcrumbText>
              )}

              {!isLast && <Separator aria-hidden="true" />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbContainer>
  );
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default Breadcrumb;
