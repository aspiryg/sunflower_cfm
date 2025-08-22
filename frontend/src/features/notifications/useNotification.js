import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getUserNotifications,
  getAllNotifications,
} from "../../services/notificationsApi";

export function useUserNotifications(options = {}) {
  const {
    isRead,
    type,
    priority,
    limit = 100,
    offset = 0,
    enabled = true,
  } = options;

  const params = {};
  if (isRead !== undefined && isRead !== "all") {
    params.isRead = isRead === "read";
  }
  if (type && type !== "all") {
    params.type = type;
  }
  if (priority && priority !== "all") {
    params.priority = priority;
  }
  if (limit) {
    params.limit = limit;
  }
  if (offset) {
    params.offset = offset;
  }

  return useQuery({
    queryKey: ["userNotifications", params],
    queryFn: () => getUserNotifications(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    enabled,
    keepPreviousData: true,
    onError: (error) => {
      console.error(`Failed to fetch user notifications:`, error);
      if (error?.response?.status !== 404) {
        toast.error("Failed to load notifications");
      }
    },
  });
}

export function useAllNotifications(options = {}) {
  const {
    isRead,
    type,
    priority,
    limit = 50,
    offset = 0,
    enabled = true,
  } = options;

  const params = {};
  if (isRead !== undefined && isRead !== "all") {
    params.isRead = isRead === "read";
  }
  if (type && type !== "all") {
    params.type = type;
  }
  if (priority && priority !== "all") {
    params.priority = priority;
  }
  if (limit) {
    params.limit = limit;
  }
  if (offset) {
    params.offset = offset;
  }

  return useQuery({
    queryKey: ["allNotifications", params],
    queryFn: () => getAllNotifications(params),
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 5,
    enabled,
    keepPreviousData: true,
    onError: (error) => {
      console.error(`Failed to fetch all notifications:`, error);
      toast.error("Failed to load notifications");
    },
  });
}
