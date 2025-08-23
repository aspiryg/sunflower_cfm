import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  HiOutlineBell,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineArrowTopRightOnSquare,
} from "react-icons/hi2";

import { HiOutlineFilter } from "react-icons/hi";

import Heading from "../ui/Heading";
import Text from "../ui/Text";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Card from "../ui/Card";
import LoadingSpinner from "../ui/LoadingSpinner";
import Badge from "../ui/Badge";
import StyledSelect from "../ui/StyledSelect";
import EnhancedCheckbox from "../ui/EnhancedCheckbox";
import Empty from "../ui/Empty";

import { useUserNotifications } from "../features/notifications/useNotification";
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useBulkMarkAsRead,
} from "../features/notifications/useNotificationActions";
import { formatRelativeTime } from "../utils/dateUtils";
import { notificationsIcons } from "../features/notifications/notificationCONST";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
  max-width: var(--container-xl);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--spacing-4);

  @media (max-width: 768px) {
    gap: var(--spacing-4);
    padding: 0 var(--spacing-2);
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);

  @media (max-width: 768px) {
    justify-content: space-between;
    flex-wrap: wrap;
  }
`;

const FiltersSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;

  @media (max-width: 640px) {
    flex: 1;
    min-width: 0;
  }
`;

const FilterLabel = styled(Text)`
  white-space: nowrap;
  color: var(--color-grey-600);
  font-weight: var(--font-weight-medium);
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const NotificationCard = styled(Card)`
  padding: var(--spacing-4);
  border: 1px solid
    ${(props) =>
      props.$isRead ? "var(--color-grey-200)" : "var(--color-brand-200)"};
  background-color: ${(props) =>
    props.$isRead ? "var(--color-grey-0)" : "var(--color-brand-25)"};
  transition: all var(--duration-normal) var(--ease-in-out);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-brand-300);
  }

  /* Enhanced unread indicator */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: ${(props) => (props.$isRead ? "0" : "4px")};
    background: linear-gradient(
      to bottom,
      var(--color-brand-500),
      var(--color-brand-600)
    );
    transition: width var(--duration-normal) var(--ease-in-out);
    border-radius: 0 2px 2px 0;
  }

  /* Additional unread visual cue */
  ${(props) =>
    !props.$isRead &&
    `
    &::after {
      content: "";
      position: absolute;
      right: var(--spacing-3);
      top: var(--spacing-3);
      width: 8px;
      height: 8px;
      background-color: var(--color-brand-500);
      border-radius: var(--border-radius-full);
      box-shadow: 0 0 0 2px var(--color-grey-0);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 2px var(--color-grey-0), 0 0 0 4px transparent;
      }
      50% {
        box-shadow: 0 0 0 2px var(--color-grey-0), 0 0 0 4px var(--color-brand-200);
      }
      100% {
        box-shadow: 0 0 0 2px var(--color-grey-0), 0 0 0 4px transparent;
      }
    }
  `}

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }

    &::after {
      animation: none !important;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`;

const NotificationInfo = styled.div`
  display: flex;
  gap: var(--spacing-3);
  flex: 1;
  min-width: 0;
`;

const NotificationIcon = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: var(--color-brand-100);
  color: var(--color-brand-600);
  border: 2px solid var(--color-brand-200);
  transition: all var(--duration-fast) var(--ease-in-out);

  ${NotificationCard}:hover & {
    background-color: var(--color-brand-200);
    border-color: var(--color-brand-300);
    transform: scale(1.05);
  }

  svg {
    width: 2.4rem;
    height: 2.4rem;
  }

  @media (prefers-reduced-motion: reduce) {
    ${NotificationCard}:hover & {
      transform: none;
    }
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-width: 0;
`;

const NotificationTitle = styled(Text)`
  font-weight: var(--font-weight-semibold);
  color: var(--color-grey-800);
  line-height: 1.4;
`;

const NotificationMessage = styled(Text)`
  color: var(--color-grey-600);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  margin-top: var(--spacing-1);
`;

const FeedbackNumber = styled(Badge)`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
`;

const NotificationTime = styled(Text)`
  color: var(--color-grey-500);
  font-weight: var(--font-weight-medium);
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  opacity: 0.7;
  transition: opacity var(--duration-fast) var(--ease-in-out);

  ${NotificationCard}:hover & {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-8);
  min-height: 40rem;
`;

const ErrorContainer = styled.div`
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  text-align: center;
`;

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3);
  background-color: var(--color-grey-50);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const BulkActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: linear-gradient(
    135deg,
    var(--color-brand-50),
    var(--color-brand-25)
  );
  border: 1px solid var(--color-brand-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-4);
  box-shadow: var(--shadow-sm);
`;

const SelectAllContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-grey-50);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-2);
`;

function Notifications() {
  const navigate = useNavigate();
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [filters, setFilters] = useState({
    isRead: "all",
    type: "all",
    priority: "all",
  });

  // Hooks for notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useUserNotifications();

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const bulkMarkAsReadMutation = useBulkMarkAsRead();

  const notifications = notificationsData?.data || [];
  const summary = notificationsData?.summary || {
    total: 0,
    unread: 0,
    isRead: 0,
  };

  // Filter notifications based on current filters
  const filteredNotifications = notifications.filter((notification) => {
    if (filters.isRead !== "all") {
      const isReadFilter = filters.isRead === "read";
      if (notification.isRead !== isReadFilter) return false;
    }

    if (filters.type !== "all" && notification.type !== filters.type) {
      return false;
    }

    if (
      filters.priority !== "all" &&
      notification.priority !== filters.priority
    ) {
      return false;
    }

    return true;
  });

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    navigate(`/feedback/view/${notification.feedbackId}`);
  };

  const handleMarkAsRead = (notificationId, event) => {
    event.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId, event) => {
    event.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    markAllAsReadMutation.mutate(unreadIds);
  };

  const handleBulkMarkAsRead = () => {
    const ids = Array.from(selectedNotifications);
    bulkMarkAsReadMutation.mutate(ids, {
      onSuccess: () => {
        setSelectedNotifications(new Set());
      },
    });
  };

  const handleSelectNotification = (notificationId, isSelected) => {
    const newSelected = new Set(selectedNotifications);
    if (isSelected) {
      newSelected.add(notificationId);
    } else {
      newSelected.delete(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    } else {
      setSelectedNotifications(new Set());
    }
  };

  const filterOptions = {
    isRead: [
      { value: "all", label: "All Status" },
      { value: "unread", label: "Unread" },
      { value: "read", label: "Read" },
    ],
    type: [
      { value: "all", label: "All Types" },
      { value: "FEEDBACK_SUBMITTED", label: "Feedback Submitted" },
      { value: "FEEDBACK_ASSIGNED", label: "Feedback Assigned" },
      { value: "FEEDBACK_STATUS_CHANGED", label: "Status Changed" },
      { value: "FEEDBACK_UNASSIGNED", label: "Feedback Unassigned" },
    ],
    priority: [
      { value: "all", label: "All Priorities" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
  };

  const isAllSelected =
    filteredNotifications.length > 0 &&
    selectedNotifications.size === filteredNotifications.length;
  const isPartiallySelected =
    selectedNotifications.size > 0 &&
    selectedNotifications.size < filteredNotifications.length;

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner size="large" />
          <Text size="lg" color="muted">
            Loading notifications...
          </Text>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorContainer>
          <Text size="lg" weight="semibold" color="error">
            Failed to load notifications
          </Text>
          <Text
            size="sm"
            color="muted"
            style={{ marginTop: "var(--spacing-2)" }}
          >
            {error?.message ||
              "Something went wrong while loading notifications."}
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={() => refetch()}
            style={{ marginTop: "var(--spacing-3)" }}
          >
            Try Again
          </Button>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader>
        <HeaderContent>
          <Heading as="h1" size="h1">
            Notifications
          </Heading>
          <Text size="lg" color="muted">
            Manage your notification preferences and view all notifications
          </Text>
        </HeaderContent>

        <HeaderActions>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>

          {summary.unread > 0 && (
            <Button
              variant="primary"
              size="medium"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <HiOutlineCheckCircle />
              Mark All Read
            </Button>
          )}
        </HeaderActions>
      </PageHeader>

      {/* Stats Bar */}
      <StatsBar>
        <StatItem>
          <HiOutlineBell style={{ color: "var(--color-brand-600)" }} />
          <Text size="sm" weight="medium">
            Total: {summary.total}
          </Text>
        </StatItem>
        <StatItem>
          <Badge
            variant="error"
            size="sm"
            content={summary.unread}
            zeroTolerance={true}
          />
          <Text size="sm">Unread</Text>
        </StatItem>
        <StatItem>
          <Badge
            variant="success"
            size="sm"
            content={summary.isRead}
            zeroTolerance={true}
          />
          <Text size="sm">Read</Text>
        </StatItem>
      </StatsBar>

      {/* Filters */}
      <FiltersSection>
        <FilterGroup>
          <HiOutlineFilter />
          <Text size="sm" weight="medium">
            Filters:
          </Text>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel size="sm">Status:</FilterLabel>
          <StyledSelect
            value={filters.isRead}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, isRead: value }))
            }
            options={filterOptions.isRead}
            size="small"
            placeholder="Select status..."
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel size="sm">Type:</FilterLabel>
          <StyledSelect
            value={filters.type}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
            options={filterOptions.type}
            size="small"
            placeholder="Select type..."
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel size="sm">Priority:</FilterLabel>
          <StyledSelect
            value={filters.priority}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, priority: value }))
            }
            options={filterOptions.priority}
            size="small"
            placeholder="Select priority..."
          />
        </FilterGroup>
      </FiltersSection>

      {/* Select All */}
      {filteredNotifications.length > 0 && (
        <SelectAllContainer>
          <EnhancedCheckbox
            id="select-all-notifications"
            checked={isAllSelected}
            onChange={handleSelectAll}
            label={`Select all ${filteredNotifications.length} notification${
              filteredNotifications.length !== 1 ? "s" : ""
            }`}
            size="medium"
          />
          {isPartiallySelected && (
            <Text size="sm" color="muted">
              ({selectedNotifications.size} selected)
            </Text>
          )}
        </SelectAllContainer>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <BulkActions>
          <Text size="sm" weight="medium">
            {selectedNotifications.size} notification
            {selectedNotifications.size !== 1 ? "s" : ""} selected
          </Text>
          <Button
            variant="secondary"
            size="small"
            onClick={handleBulkMarkAsRead}
            disabled={bulkMarkAsReadMutation.isPending}
          >
            <HiOutlineEye />
            Mark as Read
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setSelectedNotifications(new Set())}
          >
            Clear Selection
          </Button>
        </BulkActions>
      )}

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Empty
          icon={HiOutlineBell}
          title="No notifications found"
          description={
            filters.isRead !== "all" ||
            filters.type !== "all" ||
            filters.priority !== "all"
              ? "Try adjusting your filters to see more notifications."
              : "You're all caught up! No notifications to display."
          }
        />
      ) : (
        <NotificationsList>
          {filteredNotifications.map((notification) => {
            const IconComponent =
              notificationsIcons[notification.type] || HiOutlineBell;
            const isSelected = selectedNotifications.has(notification.id);

            return (
              <NotificationCard
                key={notification.id}
                $isRead={notification.isRead}
                // onClick={() => handleNotificationClick(notification)}
              >
                <NotificationHeader>
                  <NotificationInfo>
                    <EnhancedCheckbox
                      id={`notification-${notification.id}`}
                      checked={isSelected}
                      onChange={(checked, e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id, checked);
                      }}
                      size="medium"
                    />

                    <NotificationIcon>
                      <IconComponent />
                    </NotificationIcon>

                    <NotificationContent>
                      <NotificationTitle size="md">
                        {notification.title}
                      </NotificationTitle>

                      <NotificationMessage size="sm">
                        {notification.message}
                      </NotificationMessage>

                      <NotificationMeta>
                        {notification.metadata?.feedbackNumber && (
                          <FeedbackNumber
                            variant="secondary"
                            size="sm"
                            content={notification.metadata.feedbackNumber}
                          />
                        )}

                        <Badge
                          variant={
                            notification.priority === "urgent"
                              ? "error"
                              : notification.priority === "high"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                          content={notification.priority}
                        />

                        <NotificationTime size="xs">
                          {formatRelativeTime(notification.createdAt)}
                        </NotificationTime>
                      </NotificationMeta>
                    </NotificationContent>
                  </NotificationInfo>

                  <NotificationActions>
                    {notification.actionUrl && (
                      <IconButton
                        variant="ghost"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // navigate(notification.actionUrl);
                          handleNotificationClick(notification);
                        }}
                        aria-label="Go to action"
                        tooltip="Go to action"
                      >
                        <HiOutlineArrowTopRightOnSquare />
                      </IconButton>
                    )}

                    {!notification.isRead && (
                      <IconButton
                        variant="ghost"
                        size="small"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        aria-label="Mark as read"
                        tooltip="Mark as read"
                        disabled={markAsReadMutation.isPending}
                      >
                        <HiOutlineEye />
                      </IconButton>
                    )}

                    <IconButton
                      variant="ghost"
                      size="small"
                      onClick={(e) =>
                        handleDeleteNotification(notification.id, e)
                      }
                      aria-label="Delete notification"
                      tooltip="Delete"
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <HiOutlineTrash />
                    </IconButton>
                  </NotificationActions>
                </NotificationHeader>
              </NotificationCard>
            );
          })}
        </NotificationsList>
      )}
    </PageContainer>
  );
}

export default Notifications;
