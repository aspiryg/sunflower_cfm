import styled from "styled-components";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

import {
  HiOutlineHome,
  HiOutlineCog8Tooth,
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
  HiOutlineUserGroup,
  HiOutlinePlusCircle,
} from "react-icons/hi2";
import Text from "./Text";
import Column from "./Column";
import { ROLES } from "../services/permissionService";
import { useRoleBasedAuth } from "../hooks/useRoleBasedAuth";
import { useLogout } from "../features/auth/useAuth";

const SidebarContainer = styled.aside`
  background-color: var(--color-grey-0);
  border-right: 1px solid var(--color-grey-200);
  width: 28rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: transform var(--duration-normal) var(--ease-in-out);

  /* Mobile: Fixed positioning with overlay */
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-sidebar);
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
    box-shadow: var(--shadow-lg);
  }

  /* Desktop: Static positioning that slides in/out */
  @media (min-width: 769px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--z-fixed);
    transform: translateX(${(props) => (props.$isOpen ? "0" : "-100%")});
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SidebarHeader = styled.div`
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  height: 7rem;

  @media (max-width: 768px) {
    height: 6rem;
    padding: var(--spacing-4);
  }
`;

const Logo = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandName = styled(Text)`
  font-weight: var(--font-weight-bold);
  color: var(--color-grey-800);
`;

const Navigation = styled.nav`
  flex: 1;
  padding: var(--spacing-4) var(--spacing-6);
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: var(--spacing-6);
`;

const NavSectionTitle = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-3);
  padding-left: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NavList = styled(Column)`
  gap: var(--spacing-1);
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &.active {
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 70%;
      background-color: var(--color-brand-600);
      border-radius: 0 2px 2px 0;
    }
  }

  svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ParentNavItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-grey-600);
  background: none;
  border: none;
  font-weight: var(--font-weight-medium);
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &:focus {
    outline: 2px solid var(--color-brand-200);
    outline-offset: 2px;
  }

  &.has-active-child {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ParentNavContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  svg:first-child {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }
`;

const ChevronIcon = styled(HiOutlineChevronDown)`
  width: 1.6rem;
  height: 1.6rem;
  transition: transform var(--duration-normal) var(--ease-in-out);
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
  color: var(--color-grey-500);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SubNavList = styled.div`
  margin-left: var(--spacing-6);
  margin-top: var(--spacing-1);
  border-left: 1px solid var(--color-grey-200);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-in-out);

  ${(props) =>
    !props.$isOpen &&
    `
    max-height: 0;
    margin-top: 0;
    opacity: 0;
  `}

  ${(props) =>
    props.$isOpen &&
    `
    max-height: 20rem;
    opacity: 1;
  `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SubNavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-4);
  padding-left: var(--spacing-6);
  color: var(--color-grey-600);
  text-decoration: none;
  font-weight: var(--font-weight-normal);
  font-size: var(--font-size-sm);
  transition: all var(--duration-normal) var(--ease-in-out);
  position: relative;
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  margin-right: var(--spacing-2);

  &::before {
    content: "";
    position: absolute;
    left: -1px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 1px;
    background-color: var(--color-grey-300);
  }

  &:hover {
    background-color: var(--color-grey-50);
    color: var(--color-grey-700);

    &::before {
      background-color: var(--color-grey-400);
    }
  }

  &.active {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
    font-weight: var(--font-weight-medium);

    &::before {
      background-color: var(--color-brand-500);
      width: 3px;
      height: 16px;
      border-radius: 0 2px 2px 0;
    }
  }

  svg {
    width: 1.6rem;
    height: 1.6rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--border-radius-md);
  color: var(--color-error-600);
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-error-50);
    color: var(--color-error-700);
  }

  &:focus {
    outline: 2px solid var(--color-error-200);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SidebarFooter = styled.div`
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-grey-200);
`;

const LoadingText = styled(Text)`
  color: var(--color-grey-500);
  font-style: italic;
`;

// Enhanced navigation configuration with sub-items
const navigation = [
  {
    section: "Main",
    items: [
      {
        name: "Dashboard",
        to: "/dashboard",
        icon: HiOutlineHome,
      },
    ],
  },
  {
    section: "Complaint Management",
    items: [
      {
        name: "Cases",
        to: "/cases",
        icon: HiOutlineChatBubbleLeftRight,
        hasSubItems: true,
        defaultOpen: true,
        subItems: [
          {
            name: "All Cases",
            to: "/cases",
            icon: HiOutlineChatBubbleLeftRight,
          },
          {
            name: "Assigned To Me",
            to: "/cases/assigned-to-me",
            icon: HiOutlineUserGroup,
          },
          {
            name: "Created By Me",
            to: "/cases/created-by-me",
            icon: HiOutlinePlusCircle,
          },
        ],
      },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        name: "Users",
        to: "/users",
        icon: HiOutlineUsers,
      },
      {
        name: "Settings",
        to: "/settings",
        icon: HiOutlineCog8Tooth,
      },
    ],
    requireAuth: true,
    requiredRole: ROLES.admin,
  },
  {
    section: "Personal",
    items: [
      {
        name: "My Profile",
        to: "/my-profile",
        icon: HiOutlineUser,
      },
    ],
  },
];

function Sidebar({ $isOpen, $isMobile, onClose }) {
  const { hasRole } = useRoleBasedAuth();
  const { logout, isPending: isLoggingOut } = useLogout();

  // State for tracking expanded sub-menus
  const [expandedItems, setExpandedItems] = useState(() => {
    // Initialize with default open items
    const initialState = {};
    navigation.forEach((section) => {
      section.items.forEach((item) => {
        if (item.hasSubItems && item.defaultOpen) {
          initialState[item.name] = true;
        }
      });
    });
    return initialState;
  });

  // Check if any sub-item is currently active
  const hasActiveSubItem = (subItems) => {
    if (!subItems) return false;
    return subItems.some(
      (subItem) =>
        window.location.pathname === subItem.to ||
        window.location.pathname.startsWith(subItem.to + "/")
    );
  };

  const handleNavClick = () => {
    if ($isMobile) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      if ($isMobile) {
        onClose();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleSubMenu = (itemName) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName],
    }));
  };

  const renderNavItem = (item) => {
    if (item.hasSubItems) {
      const isExpanded = expandedItems[item.name];
      const hasActiveChild = hasActiveSubItem(item.subItems);

      return (
        <div key={item.name}>
          <ParentNavItem
            onClick={() => toggleSubMenu(item.name)}
            className={hasActiveChild ? "has-active-child" : ""}
            aria-expanded={isExpanded}
            aria-controls={`submenu-${item.name}`}
          >
            <ParentNavContent>
              <item.icon />
              <Text size="sm">{item.name}</Text>
            </ParentNavContent>
            <ChevronIcon $isOpen={isExpanded} />
          </ParentNavItem>

          <SubNavList
            $isOpen={isExpanded}
            id={`submenu-${item.name}`}
            role="group"
            aria-labelledby={`parent-${item.name}`}
          >
            {item.subItems?.map((subItem) => (
              <SubNavItem
                key={subItem.to}
                to={subItem.to}
                onClick={handleNavClick}
                end={subItem.to === "/cases"}
              >
                {subItem.icon && <subItem.icon />}
                <Text size="sm">{subItem.name}</Text>
              </SubNavItem>
            ))}
          </SubNavList>
        </div>
      );
    }

    return (
      <NavItem
        key={item.to}
        to={item.to}
        onClick={handleNavClick}
        end={item.to === "/dashboard"}
      >
        <item.icon />
        <Text size="sm">{item.name}</Text>
      </NavItem>
    );
  };

  return (
    <SidebarContainer $isOpen={$isOpen} $isMobile={$isMobile}>
      <SidebarHeader>
        <Logo>
          <img src="/logo2.png" alt="Logo" />
        </Logo>
        <BrandName size="lg">Complaint System</BrandName>
      </SidebarHeader>

      <Navigation>
        {navigation.map((section) => {
          // Check role requirements for the entire section
          if (section.requiredRole && !hasRole(section.requiredRole)) {
            return null;
          }

          return (
            <NavSection key={section.section}>
              <NavSectionTitle size="xs">{section.section}</NavSectionTitle>
              <NavList>{section.items.map(renderNavItem)}</NavList>
            </NavSection>
          );
        })}
      </Navigation>

      <SidebarFooter>
        <LogoutButton
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label={isLoggingOut ? "Signing out..." : "Sign out"}
        >
          <HiOutlineArrowRightOnRectangle />
          {isLoggingOut ? (
            <LoadingText size="sm">Signing out...</LoadingText>
          ) : (
            <Text size="sm">Logout</Text>
          )}
        </LogoutButton>
      </SidebarFooter>
    </SidebarContainer>
  );
}

Sidebar.propTypes = {
  $isOpen: PropTypes.bool,
  $isMobile: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Sidebar;
