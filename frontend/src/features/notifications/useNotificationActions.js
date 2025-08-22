import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationsApi";

// Mark single notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (data) => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success("Notification marked as read");
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    },
  });
}

// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (unreadIds) => markMultipleNotificationsAsRead(unreadIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success(`${variables.length} notification(s) marked as read`);
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    },
  });
}

// Bulk mark notifications as read
export function useBulkMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds) =>
      markMultipleNotificationsAsRead(notificationIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success(`${variables.length} notification(s) marked as read`);
    },
    onError: (error) => {
      console.error("Failed to mark notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userNotifications"] });
      toast.success("Notification deleted");
    },
    onError: (error) => {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    },
  });
}
