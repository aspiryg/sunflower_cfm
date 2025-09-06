import styled from "styled-components";
import PropTypes from "prop-types";
import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlinePhone,
} from "react-icons/hi2";

import Text from "../../ui/Text";
import StatusBadge from "../../ui/StatusBadge2";
import ContextMenu from "../../ui/ContextMenu";
import Avatar from "../../ui/Avatar";
import { formatRelativeTime } from "../../utils/dateUtils";
import { getUserDisplayName } from "../../utils/userUtils";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const TableContainer = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: var(--color-grey-50);
  border-bottom: 1px solid var(--color-grey-200);
`;

const TableHeaderCell = styled.th`
  padding: var(--spacing-4);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-700);
  font-size: var(--font-size-sm);
  white-space: nowrap;

  &:last-child {
    text-align: center;
    width: 5rem;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-3);
    font-size: var(--font-size-xs);
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid var(--color-grey-100);
  transition: background-color var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-25);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const TableCell = styled.td`
  padding: var(--spacing-4);
  vertical-align: middle;

  @media (max-width: 768px) {
    padding: var(--spacing-3);
  }
`;

const MobileCard = styled.div`
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-3);
  box-shadow: var(--shadow-sm);
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const MobileCardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`;

const MobileCardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-2);
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);
`;

const UserName = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  cursor: pointer;

  &:hover {
    color: var(--color-brand-600);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
`;

const ActionsCell = styled(TableCell)`
  text-align: center;
  width: 5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-grey-500);
`;

// Helper function to get role color
const getRoleColor = (role) => {
  const colors = {
    super_admin: "purple",
    admin: "red",
    manager: "orange",
    staff: "blue",
    user: "green",
  };
  return colors[role] || "grey";
};

// Helper function to get role display name
const getRoleDisplayName = (role) => {
  const roleNames = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
    user: "User",
  };
  return roleNames[role] || role;
};

function UsersTable({
  usersData = [],
  isLoading = false,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onChangeRole,
  onToggleStatus,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleRowClick = (user, event) => {
    // Don't trigger row click if clicking on action buttons
    if (event.target.closest("button")) return;

    if (onViewUser) {
      onViewUser(user);
    }
  };

  const getContextMenuItems = (user) => [
    {
      key: "view",
      label: "View Profile",
      description: "View user profile details",
      icon: HiOutlineEye,
      onClick: () => onViewUser?.(user),
      variant: "primary",
      group: "primary",
    },
    {
      key: "edit",
      label: "Edit User",
      description: "Modify user information",
      icon: HiOutlinePencil,
      onClick: () => onEditUser?.(user),
      group: "primary",
    },
    {
      key: "email",
      label: "Send Email",
      description: "Send email to user",
      icon: HiOutlineEnvelope,
      onClick: () => window.open(`mailto:${user.email}`),
      group: "secondary",
    },
    {
      key: "phone",
      label: "Call User",
      description: "Make a phone call",
      icon: HiOutlinePhone,
      onClick: () => user.phone && window.open(`tel:${user.phone}`),
      disabled: !user.phone,
      group: "secondary",
    },
    {
      key: "role",
      label: "Change Role",
      description: "Modify user role and permissions",
      icon: HiOutlineShieldCheck,
      onClick: () => onChangeRole?.(user),
      group: "actions",
    },
    {
      key: "status",
      label: user.isActive ? "Deactivate" : "Activate",
      description: user.isActive
        ? "Disable user account"
        : "Enable user account",
      icon: HiOutlineShieldExclamation,
      onClick: () => onToggleStatus?.(user),
      group: "actions",
    },
    {
      key: "delete",
      label: "Delete User",
      description: "Permanently remove user",
      icon: HiOutlineTrash,
      onClick: () => onDeleteUser?.(user),
      variant: "danger",
      group: "danger",
    },
  ];

  if (isLoading) {
    return (
      <TableContainer>
        <EmptyState>
          <Text>Loading users...</Text>
        </EmptyState>
      </TableContainer>
    );
  }

  if (usersData.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <Text size="lg" color="muted">
            No users found
          </Text>
          <Text size="sm" color="muted">
            There are no users to display.
          </Text>
        </EmptyState>
      </TableContainer>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <div>
        {usersData.map((user) => (
          <MobileCard key={user.id}>
            <MobileCardHeader>
              <UserInfo>
                <Avatar
                  src={user.profilePicture}
                  name={getUserDisplayName(user)}
                  size="sm"
                  showStatus={true}
                  status={user.isActive ? "online" : "offline"}
                />
                <UserDetails>
                  <UserName
                    size="sm"
                    weight="semibold"
                    onClick={() => onViewUser?.(user)}
                  >
                    {getUserDisplayName(user)}
                  </UserName>
                  <Text size="xs" color="muted">
                    {user.email}
                  </Text>
                </UserDetails>
              </UserInfo>
              <StatusBadge
                content={getRoleDisplayName(user.role)}
                variant={getRoleColor(user.role)}
                size="sm"
              />
            </MobileCardHeader>

            <MobileCardContent>
              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Status
                </Text>
                <StatusBadge
                  content={user.isActive ? "Active" : "Inactive"}
                  variant={user.isActive ? "resolved" : "rejected"}
                  size="sm"
                />
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Last Login
                </Text>
                <Text size="sm">
                  {user.lastLogin
                    ? formatRelativeTime(user.lastLogin)
                    : "Never"}
                </Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Organization
                </Text>
                <Text size="sm">{user.organization || "N/A"}</Text>
              </MobileCardField>

              <MobileCardField>
                <Text size="xs" weight="medium" color="muted">
                  Joined
                </Text>
                <Text size="sm">{formatRelativeTime(user.createdAt)}</Text>
              </MobileCardField>
            </MobileCardContent>

            <MobileCardActions>
              <ContextMenu
                items={getContextMenuItems(user)}
                header="User Actions"
              />
            </MobileCardActions>
          </MobileCard>
        ))}
      </div>
    );
  }

  // Desktop view
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>User</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Organization</TableHeaderCell>
            <TableHeaderCell>Last Login</TableHeaderCell>
            <TableHeaderCell>Joined</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersData.map((user) => (
            <TableRow
              key={user.id}
              onClick={(e) => handleRowClick(user, e)}
              style={{ cursor: "pointer" }}
            >
              <TableCell>
                <UserInfo>
                  <Avatar
                    src={user.profilePicture}
                    name={getUserDisplayName(user)}
                    size="sm"
                    showStatus={true}
                    status={user.isActive ? "online" : "offline"}
                  />
                  <UserDetails>
                    <UserName
                      size="sm"
                      weight="semibold"
                      onClick={() => onViewUser?.(user)}
                    >
                      {getUserDisplayName(user)}
                    </UserName>
                    <Text size="xs" color="muted">
                      {user.email}
                    </Text>
                  </UserDetails>
                </UserInfo>
              </TableCell>

              <TableCell>
                <StatusBadge
                  content={getRoleDisplayName(user.role)}
                  variant={getRoleColor(user.role)}
                  size="sm"
                />
              </TableCell>

              <TableCell>
                <StatusBadge
                  content={user.isActive ? "Active" : "Inactive"}
                  variant={user.isActive ? "resolved" : "rejected"}
                  size="sm"
                />
              </TableCell>

              <TableCell>
                <Text size="sm">{user.organization || "N/A"}</Text>
              </TableCell>

              <TableCell>
                <Text size="sm" color="muted">
                  {user.lastLogin
                    ? formatRelativeTime(user.lastLogin)
                    : "Never"}
                </Text>
              </TableCell>

              <TableCell>
                <Text size="sm" color="muted">
                  {formatRelativeTime(user.createdAt)}
                </Text>
              </TableCell>

              <ActionsCell>
                <ContextMenu
                  items={getContextMenuItems(user)}
                  header="User Actions"
                />
              </ActionsCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

UsersTable.propTypes = {
  usersData: PropTypes.array,
  isLoading: PropTypes.bool,
  onViewUser: PropTypes.func,
  onEditUser: PropTypes.func,
  onDeleteUser: PropTypes.func,
  onChangeRole: PropTypes.func,
  onToggleStatus: PropTypes.func,
};

export default UsersTable;
