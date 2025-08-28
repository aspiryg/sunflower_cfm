import { useState, useRef, useEffect, use } from "react";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import {
  HiChevronDown,
  HiCheck,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import { useClickOutside } from "../hooks/useClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import Avatar from "./Avatar";
import Text from "./Text";
import Input from "./Input";

const SelectContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const SelectTrigger = styled.div`
  width: 100%;
  min-height: var(--input-height-md);
  padding: var(--spacing-3) var(--spacing-10) var(--spacing-3) var(--spacing-3);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background-color: var(--color-grey-0);
  color: var(--color-grey-700);
  transition: all var(--duration-normal) var(--ease-in-out);
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;

  &:hover:not(:disabled) {
    border-color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-grey-100);
    color: var(--color-grey-500);
    cursor: not-allowed;
    border-color: var(--color-grey-200);
  }

  ${(props) =>
    props.$hasError &&
    css`
      border-color: var(--color-error-500);
      background-color: var(--color-error-50);

      &:hover:not(:disabled) {
        border-color: var(--color-error-600);
      }

      &:focus {
        border-color: var(--color-error-500);
        box-shadow: 0 0 0 3px var(--color-error-100);
      }
    `}

  ${(props) =>
    props.$isOpen &&
    css`
      border-color: var(--color-brand-500);
      box-shadow: 0 0 0 3px var(--color-brand-100);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SelectedUserDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
`;

const SelectedUserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  flex: 1;
`;

const SelectedUserName = styled(Text)`
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SelectedUserEmail = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlaceholderText = styled(Text)`
  color: var(--color-grey-500);
  font-style: italic;
`;

const ChevronIcon = styled(HiChevronDown)`
  width: 1.6rem;
  height: 1.6rem;
  color: var(--color-grey-500);
  transition: transform var(--duration-normal) var(--ease-in-out);
  flex-shrink: 0;
  margin-left: var(--spacing-2);

  ${(props) =>
    props.$isOpen &&
    css`
      transform: rotate(180deg);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ClearButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  border-radius: var(--border-radius-sm);
  color: var(--color-grey-500);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  margin-right: var(--spacing-1);

  &:hover {
    background-color: var(--color-grey-100);
    color: var(--color-grey-700);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-100);
    color: var(--color-brand-700);
  }

  svg {
    width: 1.4rem;
    height: 1.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-1));
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: all var(--duration-fast) var(--ease-in-out);
  max-height: 40rem;

  ${(props) =>
    props.$isOpen &&
    css`
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--duration-fast) ease;
    transform: none;
  }
`;

const SearchContainer = styled.div`
  padding: var(--spacing-3);
  border-bottom: 1px solid var(--color-grey-200);
  background-color: var(--color-grey-25);
`;

const SearchInput = styled(Input)`
  width: 100%;
`;

const UsersList = styled.div`
  max-height: 32rem;
  overflow-y: auto;
  padding: var(--spacing-2);

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-grey-50);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-300);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--color-grey-400);
  }
`;

const UserOption = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-in-out);
  position: relative;

  &:hover {
    background-color: var(--color-brand-50);
    transform: translateX(2px);
  }

  &:focus {
    outline: none;
    background-color: var(--color-brand-100);
  }

  ${(props) =>
    props.$isSelected &&
    css`
      background-color: var(--color-brand-100);
      color: var(--color-brand-800);

      &:hover {
        background-color: var(--color-brand-100);
      }
    `}

  ${(props) =>
    props.$isFocused &&
    css`
      background-color: var(--color-brand-50);
      outline: 2px solid var(--color-brand-200);
      outline-offset: -2px;
    `}

    ${(props) =>
    props.disabled &&
    css`
      background-color: var(--color-grey-100);
      color: var(--color-grey-500);
      cursor: not-allowed;

      &:hover {
        background-color: var(--color-grey-100);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: background-color var(--duration-fast) ease;

    &:hover {
      transform: none;
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  flex: 1;
  min-width: 0;
`;

const UserName = styled(Text)`
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserEmail = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserRole = styled(Text)`
  background-color: var(--color-grey-100);
  color: var(--color-grey-600);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

const CheckIcon = styled(HiCheck)`
  width: 1.6rem;
  height: 1.6rem;
  color: var(--color-brand-600);
  opacity: 0;
  transform: scale(0.8);
  transition: all var(--duration-fast) var(--ease-in-out);

  ${(props) =>
    props.$isVisible &&
    css`
      opacity: 1;
      transform: scale(1);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: opacity var(--duration-fast) ease;
    transform: none;
  }
`;

const EmptyState = styled.div`
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
  color: var(--color-grey-500);
`;

const LoadingState = styled.div`
  padding: var(--spacing-6) var(--spacing-4);
  text-align: center;
  color: var(--color-grey-500);
`;

const CurrentlySelectedIndicator = styled.span`
  background-color: var(--color-brand-100);
  color: var(--color-brand-800);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

/**
 * Enhanced UserSelect Component
 *
 * A specialized select component for choosing users with:
 * - Avatar display
 * - Name and email information
 * - Role badges
 * - Search functionality
 * - Keyboard navigation
 * - Accessibility features
 */
function UserSelect({
  users = [],
  value,
  onChange,
  placeholder = "Select a user...",
  emptyMessage = "No users available",
  searchPlaceholder = "Search users...",
  allowClear = true,
  disabled = false,
  isLoading = false,
  hasError = false,
  className = "",
  currentlyAssignedUserId = null,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const optionsRef = useRef(null);

  // Get selected user
  const selectedUser = users.find((user) => user.id === value);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = (
      user.fullName ||
      user.firstName ||
      user.username ||
      ""
    ).toLowerCase();
    const email = (user.email || "").toLowerCase();
    const role = (user.role || "").toLowerCase();

    return (
      name.includes(query) || email.includes(query) || role.includes(query)
    );
  });

  // Handle clicking outside to close dropdown
  useClickOutside([containerRef], () => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
    }
  });

  // Handle escape key
  useEscapeKey(() => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
      triggerRef.current?.focus();
    }
  }, isOpen);

  // Handle keyboard navigation
  useKeyboardNavigation(optionsRef, '[role="option"]', isOpen, {
    onEnter: (element, index) => {
      const userId = element.getAttribute("data-user-id");
      if (userId) {
        handleUserSelect(parseInt(userId));
      }
    },
  });

  // Reset search and focus when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setFocusedIndex(-1);
      // Focus search input after a short delay
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleUserSelect = (userId) => {
    if (onChange) {
      onChange(userId);
    }
    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange("");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setFocusedIndex(-1);
  };

  const getUserDisplayName = (user) => {
    return (
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.username ||
      "Unknown User"
    );
  };

  return (
    <SelectContainer ref={containerRef} className={className}>
      <SelectTrigger
        ref={triggerRef}
        type="button"
        $isOpen={isOpen}
        $hasError={hasError}
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={placeholder}
        {...props}
      >
        {selectedUser ? (
          <SelectedUserDisplay>
            <Avatar
              src={selectedUser?.profilePicture}
              name={getUserDisplayName(selectedUser)}
              size="sm"
              status={selectedUser.isOnline ? "online" : "offline"}
              showStatus={true}
            />
            <SelectedUserInfo>
              <SelectedUserName size="sm">
                {getUserDisplayName(selectedUser)}
              </SelectedUserName>
              <SelectedUserEmail size="xs" color="muted">
                {selectedUser.email || "No email"}
              </SelectedUserEmail>
            </SelectedUserInfo>
            {allowClear && !disabled && (
              <ClearButton
                type="button"
                onClick={handleClear}
                aria-label="Clear selection"
                tabIndex={-1}
              >
                <HiXMark />
              </ClearButton>
            )}
          </SelectedUserDisplay>
        ) : (
          <PlaceholderText size="sm">{placeholder}</PlaceholderText>
        )}

        <ChevronIcon $isOpen={isOpen} />
      </SelectTrigger>

      <DropdownContainer $isOpen={isOpen}>
        <SearchContainer>
          <SearchInput
            ref={searchRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<HiMagnifyingGlass />}
            size="small"
          />
        </SearchContainer>

        <UsersList ref={optionsRef} role="listbox">
          {isLoading ? (
            <LoadingState>
              <Text size="sm">Loading users...</Text>
            </LoadingState>
          ) : filteredUsers.length === 0 ? (
            <EmptyState>
              <Text size="sm">
                {searchQuery
                  ? `No users found for "${searchQuery}"`
                  : emptyMessage}
              </Text>
            </EmptyState>
          ) : (
            filteredUsers.map((user, index) => {
              const isSelected = user.id === value;
              const isFocused = index === focusedIndex;

              if (currentlyAssignedUserId === user.id) {
                return null; // Skip rendering this user
              }

              return (
                <UserOption
                  key={user.id}
                  role="option"
                  data-user-id={user.id}
                  aria-selected={isSelected}
                  $isSelected={isSelected}
                  $isFocused={isFocused}
                  onClick={() => handleUserSelect(user.id)}
                  tabIndex={isOpen ? 0 : -1}
                  // disabled={currentlyAssignedUserId === user.id}
                >
                  <Avatar
                    src={user?.profilePicture}
                    name={getUserDisplayName(user)}
                    size="sm"
                    status={user.isOnline ? "online" : "offline"}
                    showStatus={true}
                  />

                  <UserInfo>
                    <UserName size="sm">{getUserDisplayName(user)}</UserName>
                    <UserEmail size="xs" color="muted">
                      {user.email || "No email"}
                    </UserEmail>
                  </UserInfo>

                  {user.role && <UserRole size="xs">{user.role}</UserRole>}

                  <CheckIcon $isVisible={isSelected} />
                </UserOption>
              );
            })
          )}
        </UsersList>
      </DropdownContainer>
    </SelectContainer>
  );
}

UserSelect.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      fullName: PropTypes.string,
      email: PropTypes.string,
      avatar: PropTypes.string,
      role: PropTypes.string,
      isOnline: PropTypes.bool,
    })
  ),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  emptyMessage: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  allowClear: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  hasError: PropTypes.bool,
  className: PropTypes.string,
};

export default UserSelect;
