import { useState, useRef, useEffect } from "react";
import styled /*,{ css }*/ from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
} from "react-icons/hi2";
import Avatar from "./Avatar";
import Text from "./Text";
import { useLogout } from "../features/auth/useAuth";
import { useNavigate } from "react-router-dom";

const UserMenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
  }

  &:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;

  @media (max-width: 640px) {
    display: none;
  }
`;

const ChevronIcon = styled(HiOutlineChevronDown)`
  width: 1.6rem;
  height: 1.6rem;
  color: var(--color-grey-500);
  transition: transform var(--duration-normal) var(--ease-in-out);
  transform: ${(props) => (props.$isOpen ? "rotate(180deg)" : "rotate(0deg)")};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  min-width: 20rem;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-8px)"};
  transition: all var(--duration-normal) var(--ease-in-out);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    transform: none;
  }
`;

const DropdownHeader = styled.div`
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const DropdownHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const DropdownList = styled.ul`
  padding: var(--spacing-2) 0;
  list-style: none;
`;

const DropdownItem = styled.li`
  margin: 0;
`;

const DropdownLink = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-800);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 1.8rem;
    height: 1.8rem;
    color: var(--color-grey-500);
  }

  &:hover svg {
    color: var(--color-grey-600);
  }

  &.logout-item {
    color: var(--color-error-600);

    &:hover {
      background-color: var(--color-error-50);
      color: var(--color-error-700);
    }

    svg {
      color: var(--color-error-500);
    }

    &:hover svg {
      color: var(--color-error-600);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

function UserMenu({ user, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();
  const { logout, isPending: isLoggingOut } = useLogout();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsOpen(false);

    switch (action) {
      case "profile":
        navigate("/my-profile");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "logout":
        logout();
        break;
      default:
        console.warn(`Unknown menu action: ${action}`);
    }
  };

  // Generate menu items
  const menuItems = [
    {
      icon: HiOutlineUser,
      label: "My Profile",
      action: "profile",
    },
    {
      icon: HiOutlineCog6Tooth,
      label: "Settings",
      action: "settings",
    },
    {
      icon: HiOutlineArrowRightOnRectangle,
      label: isLoggingOut ? "Signing Out..." : "Sign Out",
      action: "logout",
      className: "logout-item",
      disabled: isLoggingOut,
    },
  ];

  return (
    <UserMenuContainer className={className}>
      <UserMenuTrigger
        ref={triggerRef}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
        disabled={isLoggingOut}
      >
        <Avatar
          src={user?.profilePicture}
          name={user?.fullName || user?.username}
          size="sm"
          status={user?.isOnline ? "online" : "offline"}
          showStatus={true}
        />
        <UserInfo>
          <Text size="sm" weight="medium" color="default">
            {user?.fullName || user?.firstName || user?.username || "User"}
          </Text>
          <Text size="xs" color="muted">
            {user?.email || "user@example.com"}
          </Text>
        </UserInfo>
        <ChevronIcon $isOpen={isOpen} />
      </UserMenuTrigger>

      <DropdownMenu ref={menuRef} $isOpen={isOpen} role="menu">
        <DropdownHeader>
          <Avatar
            src={user?.avatar}
            name={user?.fullName || user?.username}
            size="md"
            status={user?.isOnline ? "online" : "offline"}
            showStatus={true}
          />
          <DropdownHeaderInfo>
            <Text size="sm" weight="semibold">
              {user?.fullName || user?.firstName || user?.username || "User"}
            </Text>
            <Text size="xs" color="muted">
              {user?.email || "user@example.com"}
            </Text>
            <Text size="xs" color="muted">
              {user?.role || "User"}
            </Text>
          </DropdownHeaderInfo>
        </DropdownHeader>

        <DropdownList>
          {menuItems.map((item) => (
            <DropdownItem key={item.action}>
              <DropdownLink
                role="menuitem"
                onClick={() => handleMenuItemClick(item.action)}
                className={item.className}
                disabled={item.disabled}
              >
                <item.icon />
                {item.label}
              </DropdownLink>
            </DropdownItem>
          ))}
        </DropdownList>
      </DropdownMenu>
    </UserMenuContainer>
  );
}

UserMenu.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string,
    firstName: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    avatar: PropTypes.string,
    role: PropTypes.string,
    isOnline: PropTypes.bool,
  }),
  className: PropTypes.string,
};

export default UserMenu;
