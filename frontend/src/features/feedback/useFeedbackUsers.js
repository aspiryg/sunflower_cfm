import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUsers } from "../../services/userApi";

import toast from "react-hot-toast";

// Query Keys
export const feedbackUserKeys = {
  allUsers: ["feedback", "users"],
  user: (userId) => ["feedback", "users", userId],
};

export function useFeedbackUsers(option = {}) {
  const { filters = {} } = option;
  return useQuery({
    queryKey: feedbackUserKeys.allUsers,
    queryFn: () => getUsers(filters),
    onError: (error) => {
      toast.error(`Error fetching users: ${error.message}`);
    },
  });
}
