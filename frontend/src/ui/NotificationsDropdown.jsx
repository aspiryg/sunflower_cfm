import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import PropTypes from "prop-types";
import { useUserNotifications } from "../features/notifications/useNotification";
import { formatRelativeTime } from "../utils/dateUtils";
import {
  HiOutlineBell,
  HiOutlineEllipsisVertical,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineChatBubbleLeftRight,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import IconButton from "./IconButton";
import Text from "./Text";
import Badge from "./Badge";

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
export const notificationsIcons = {
  FEEDBACK_SUBMITTED: HiOutlineCheckCircle,
  FEEDBACK_ASSIGNED: HiOutlineExclamationTriangle,
  FEEDBACK_UNASSIGNED: HiOutlineExclamationTriangle,
  FEEDBACK_STATUS_CHANGED: HiOutlineInformationCircle,
};

// Mock notifications data (replace with real data from your API)
// const mockNotifications = [
//   {
//     id: "1",
//     type: "success",
//     title: "Feedback submitted successfully",
//     message: "Your feedback has been received and is being reviewed.",
//     time: "2 minutes ago",
//     isRead: false,
//   },
//   {
//     id: "2",
//     type: "info",
//     title: "System maintenance scheduled",
//     message: "The system will be down for maintenance on Sunday at 2 AM.",
//     time: "1 hour ago",
//     isRead: false,
//   },
//   {
//     id: "3",
//     type: "message",
//     title: "New response to your feedback",
//     message:
//       "John Doe has responded to your feedback about the user interface.",
//     time: "3 hours ago",
//     isRead: true,
//   },
//   {
//     id: "4",
//     type: "warning",
//     title: "Profile completion required",
//     message: "Please complete your profile to access all features.",
//     time: "1 day ago",
//     isRead: true,
//   },
// ];

function NotificationsDropdown({ className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  // const [notifications, setNotifications] = useState(mockNotifications);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const navigate = useNavigate();
  const notifications = [];
  const { data: notificationsData } = useUserNotifications();
  if (notificationsData) {
    notifications.push(...notificationsData);
  }
  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    console.log("Marking notification as read:", notificationId);
  };

  const markAllAsRead = () => {
    console.log("Marking all notifications as read");
  };

  const deleteNotification = (notificationId) => {
    console.log("Deleting notification:", notificationId);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // You can add navigation logic here based on notification type
    console.log("Notification clicked:", notification);
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
              >
                <HiOutlineEye />
              </IconButton>
            )}
          </HeaderActions>
        </DropdownHeader>

        <NotificationList>
          {notifications.length === 0 ? (
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
            notifications.map((notification) => {
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
                    <FeedbackNumber size="sm" color="muted">
                      {feedbackNumber}
                    </FeedbackNumber>
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
                      >
                        <HiOutlineEye />
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
                    >
                      <HiOutlineTrash />
                    </IconButton>
                  </NotificationActions>
                </NotificationItem>
              );
            })
          )}
        </NotificationList>

        {notifications.length > 0 && (
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
