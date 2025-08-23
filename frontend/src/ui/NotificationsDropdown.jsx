import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { useUserNotifications } from "../features/notifications/useNotification";
import {
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "../features/notifications/useNotificationActions";
import { formatRelativeTime } from "../utils/dateUtils";
import { notificationsIcons } from "../features/notifications/notificationCONST";
import {
  HiOutlineBell,
  // HiOutlineEllipsisVertical,
  HiOutlineEye,
  HiOutlineTrash,
  // HiOutlineChatBubbleLeftRight,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import IconButton from "./IconButton";
import Text from "./Text";
import Badge from "./Badge";
import LoadingSpinner from "./LoadingSpinner";

const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationTrigger = styled.div`
  position: relative;
  display: inline-flex;
`;

const NotificationBadge = styled(Badge)`
  position: absolute;
  top: -0.4rem;
  right: -0.4rem;
  z-index: 1;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  width: 38rem;
  max-width: 90vw;
  background-color: var(--color-grey-0);
  border: 1px solid var(--color-grey-200);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: var(--z-dropdown);
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transform: ${(props) =>
    props.$isOpen ? "translateY(0)" : "translateY(-8px)"};
  transition: all var(--duration-normal) var(--ease-in-out);

  @media (max-width: 480px) {
    width: 32rem;
  }

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
  justify-content: space-between;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const NotificationList = styled.div`
  max-height: 40rem;
  overflow-y: auto;
`;

const NotificationItem = styled.div`
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-grey-100);
  display: flex;
  gap: var(--spacing-3);
  position: relative;
  cursor: pointer;
  transition: background-color var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-grey-50);
  }

  &:last-child {
    border-bottom: none;
  }

  /* Unread indicator */
  ${(props) =>
    !props.$isRead &&
    css`
      background-color: var(--color-brand-25);

      &::before {
        content: "";
        position: absolute;
        left: var(--spacing-2);
        top: 50%;
        transform: translateY(-50%);
        width: 0.6rem;
        height: 0.6rem;
        background-color: var(--color-brand-600);
        border-radius: var(--border-radius-full);
      }
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const NotificationIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: ${(props) =>
    props.$hasUnreadIndicator ? "var(--spacing-2)" : "0"};

  /* Icon colors based on type */
  ${(props) => {
    switch (props.$type) {
      case "success":
        return css`
          background-color: var(--color-success-100);
          color: var(--color-success-600);
        `;
      case "warning":
        return css`
          background-color: var(--color-warning-100);
          color: var(--color-warning-600);
        `;
      case "error":
        return css`
          background-color: var(--color-error-100);
          color: var(--color-error-600);
        `;
      case "info":
      default:
        return css`
          background-color: var(--color-brand-100);
          color: var(--color-brand-600);
        `;
    }
  }}

  svg {
    width: 2rem;
    height: 2rem;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
`;

// Feedback number
const FeedbackNumber = styled(Text)`
  background-color: var(--color-grey-100);
  color: var(--color-grey-600);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-style: italic;
  font-weight: 300;
`;

const NotificationActions = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-1);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-in-out);

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const NotificationTime = styled(Text)`
  color: var(--color-grey-500);
`;

const EmptyState = styled.div`
  padding: var(--spacing-8) var(--spacing-4);
  text-align: center;
  color: var(--color-grey-500);
`;

const DropdownFooter = styled.div`
  padding: var(--spacing-3);
  border-top: 1px solid var(--color-grey-200);
  text-align: center;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: var(--spacing-2);
  background: none;
  border: none;
  color: var(--color-brand-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: all var(--duration-normal) var(--ease-in-out);

  &:hover {
    background-color: var(--color-brand-50);
    color: var(--color-brand-700);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Types of Notification
/*
  FEEDBACK_SUBMITTED:
  FEEDBACK_ASSIGNED: 
  FEEDBACK_UNASSIGNED: 
  FEEDBACK_STATUS_CHANGED: 
*/

function NotificationsDropdown({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [optimisticNotifications, setOptimisticNotifications] = useState([]);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications with proper limit for dropdown
  const {
    data: notificationsData,
    isLoading,
    refetch,
  } = useUserNotifications({
    limit: 100, // Limit for dropdown display
  });

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = useMemo(
    () => notificationsData?.data || [],
    [notificationsData]
  );

  // Use optimistic notifications if available, otherwise use fetched data
  const displayNotifications =
    optimisticNotifications.length > 0
      ? optimisticNotifications
      : notifications;

  const unreadCount = displayNotifications.filter((n) => !n.isRead).length;

  // Update optimistic notifications when real data changes
  useEffect(() => {
    if (notifications.length > 0) {
      setOptimisticNotifications(notifications);
    }
  }, [notifications]);

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

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (notificationId) => {
    // Optimistic update
    setOptimisticNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    );

    // Perform mutation
    markAsReadMutation.mutate(notificationId, {
      onError: () => {
        // Revert optimistic update on error
        setOptimisticNotifications(notifications);
      },
      onSettled: () => {
        // Refetch to ensure consistency
        refetch();
      },
    });
  };

  const markAllAsRead = () => {
    const unreadNotifications = displayNotifications
      .filter((n) => !n.isRead)
      .map((n) => n.id);

    if (unreadNotifications.length === 0) return;

    // Optimistic update - mark all as read
    setOptimisticNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString(),
      }))
    );

    // Perform mutation
    markAllAsReadMutation.mutate(unreadNotifications, {
      onError: () => {
        // Revert optimistic update on error
        setOptimisticNotifications(notifications);
      },
      onSettled: () => {
        // Refetch to ensure consistency
        refetch();
      },
    });
  };

  const deleteNotification = (notificationId) => {
    // Optimistic update - remove notification
    setOptimisticNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );

    // Perform mutation
    deleteNotificationMutation.mutate(notificationId, {
      onError: () => {
        // Revert optimistic update on error
        setOptimisticNotifications(notifications);
      },
      onSettled: () => {
        // Refetch to ensure consistency
        refetch();
      },
    });
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate to feedback page
    if (notification.feedbackId) {
      navigate(`/feedback/view/${notification.feedbackId}`);
    } else if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <NotificationContainer className={className}>
      <NotificationTrigger>
        <IconButton
          ref={triggerRef}
          variant="ghost"
          size="medium"
          onClick={toggleDropdown}
          aria-label={`Notifications ${
            unreadCount > 0 ? `(${unreadCount} unread)` : ""
          }`}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          <HiOutlineBell />
        </IconButton>
        {unreadCount > 0 && (
          <NotificationBadge
            variant="error"
            size="sm"
            content={unreadCount > 99 ? "99+" : unreadCount.toString()}
          />
        )}
      </NotificationTrigger>

      <DropdownMenu ref={menuRef} $isOpen={isOpen} role="menu">
        <DropdownHeader>
          <Text size="lg" weight="semibold">
            Notifications
          </Text>
          <HeaderActions>
            {unreadCount > 0 && (
              <IconButton
                variant="ghost"
                size="small"
                onClick={markAllAsRead}
                aria-label="Mark all as read"
                tooltip="Mark all as read"
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <HiOutlineEye />
                )}
              </IconButton>
            )}
          </HeaderActions>
        </DropdownHeader>

        <NotificationList>
          {isLoading ? (
            <EmptyState>
              <LoadingSpinner size="medium" />
              <Text color="muted">Loading notifications...</Text>
            </EmptyState>
          ) : displayNotifications.length === 0 ? (
            <EmptyState>
              <HiOutlineBell
                style={{
                  width: "4rem",
                  height: "4rem",
                  margin: "0 auto var(--spacing-2)",
                }}
              />
              <Text color="muted">No notifications yet</Text>
            </EmptyState>
          ) : (
            displayNotifications.map((notification) => {
              const metadata = notification.metadata;
              const feedbackNumber = metadata?.feedbackNumber || "";
              const IconComponent =
                notificationsIcons[notification.type] ||
                HiOutlineInformationCircle;

              return (
                <NotificationItem
                  key={notification.id}
                  $isRead={notification.isRead}
                  onClick={() => handleNotificationClick(notification)}
                  role="menuitem"
                >
                  <NotificationIcon
                    $type={notification.type}
                    $hasUnreadIndicator={!notification.isRead}
                  >
                    <IconComponent />
                  </NotificationIcon>

                  <NotificationContent>
                    <Text size="sm" weight="medium">
                      {notification.title}
                    </Text>
                    {feedbackNumber && (
                      <FeedbackNumber size="sm" color="muted">
                        {feedbackNumber}
                      </FeedbackNumber>
                    )}
                    <Text size="sm" color="muted">
                      {notification.message}
                    </Text>
                    <NotificationTime size="xs">
                      {formatRelativeTime(notification.createdAt)}
                    </NotificationTime>
                  </NotificationContent>

                  <NotificationActions>
                    {!notification.isRead && (
                      <IconButton
                        variant="ghost"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        aria-label="Mark as read"
                        tooltip="Mark as read"
                        disabled={markAsReadMutation.isPending}
                      >
                        {markAsReadMutation.isPending ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <HiOutlineEye />
                        )}
                      </IconButton>
                    )}
                    <IconButton
                      variant="ghost"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      aria-label="Delete notification"
                      tooltip="Delete"
                      disabled={deleteNotificationMutation.isPending}
                    >
                      {deleteNotificationMutation.isPending ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        <HiOutlineTrash />
                      )}
                    </IconButton>
                  </NotificationActions>
                </NotificationItem>
              );
            })
          )}
        </NotificationList>

        {displayNotifications.length > 0 && (
          <DropdownFooter>
            <ViewAllButton onClick={handleViewAll}>
              View All Notifications
            </ViewAllButton>
          </DropdownFooter>
        )}
      </DropdownMenu>
    </NotificationContainer>
  );
}

NotificationsDropdown.propTypes = {
  className: PropTypes.string,
};

export default NotificationsDropdown;
