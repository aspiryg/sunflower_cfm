import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { getUserNotifications } from "../../services/notificationsApi";

export function useUserNotifications() {
  return useQuery({
    queryKey: ["userNotifications"],
    queryFn: getUserNotifications,
    staleTime: 0, // 0 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch when the browser regains internet connection
    // refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
    onError: (error) => {
      console.error(`Failed to fetch user notifications:`, error);
      if (error?.response?.status !== 404) {
        toast.error("Failed to load notifications");
      }
    },
  });
}
