import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import * as userApi from "../../services/userApi";

// Query Keys - Centralized for consistency
export const USER_QUERY_KEYS = {
  all: ["users"],
  lists: () => [...USER_QUERY_KEYS.all, "list"],
  list: (params) => [...USER_QUERY_KEYS.lists(), params],
  details: () => [...USER_QUERY_KEYS.all, "detail"],
  detail: (id) => [...USER_QUERY_KEYS.details(), id],
  search: (query) => [...USER_QUERY_KEYS.all, "search", query],
};

/**
 * Hook to fetch users - simplified for frontend processing
 * @param {Object} params - Query parameters (mostly ignored for frontend processing)
 * @returns {Object} React Query result
 */
export function useUsers(params = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list("all"), // Single key for all users
    queryFn: () => userApi.getUsers({ limit: 1000 }), // Fetch all users for frontend processing
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch a single user by ID
 * @param {string|number} userId - User ID
 * @param {Object} options - Query options
 * @returns {Object} React Query result
 */
export function useUser(userId, options = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(userId),
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

/**
 * Hook to search users
 * @param {string} query - Search query
 * @param {Object} options - Query options
 * @returns {Object} React Query result
 */
export function useSearchUsers(query, options = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.search(query),
    queryFn: () => userApi.searchUsers(query),
    enabled: !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}

/**
 * Hook to create a new user
 * @returns {Object} React Query mutation
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });

      toast.success("User created successfully");
      return data;
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Failed to create user";
      toast.error(message);
      throw error;
    },
  });
}

/**
 * Hook to update a user
 * @returns {Object} React Query mutation
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }) => userApi.updateUser(userId, data),
    onSuccess: (data, variables) => {
      const { userId } = variables;

      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), data);

      // Invalidate lists to refresh table data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });

      toast.success("User updated successfully");
      return data;
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Failed to update user";
      toast.error(message);
      throw error;
    },
  });
}

/**
 * Hook to delete a user
 * @returns {Object} React Query mutation
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: (data, userId) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: USER_QUERY_KEYS.detail(userId) });

      // Invalidate lists to refresh table data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });

      toast.success("User deleted successfully");
      return data;
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Failed to delete user";
      toast.error(message);
      throw error;
    },
  });
}

/**
 * Hook to toggle user status (active/inactive)
 * @returns {Object} React Query mutation
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }) =>
      userApi.updateUserStatus(userId, isActive),
    onSuccess: (data, variables) => {
      const { userId } = variables;

      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), data);

      // Invalidate lists to refresh table data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });

      toast.success(
        `User ${data.isActive ? "activated" : "deactivated"} successfully`
      );
      return data;
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Failed to update user status";
      toast.error(message);
      throw error;
    },
  });
}

/**
 * Hook to change user role
 * @returns {Object} React Query mutation
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }) => userApi.updateUserRole(userId, role),
    onSuccess: (data, variables) => {
      const { userId } = variables;

      // Update specific user in cache
      queryClient.setQueryData(USER_QUERY_KEYS.detail(userId), data);

      // Invalidate lists to refresh table data
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.lists() });

      toast.success("User role updated successfully");
      return data;
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Failed to update user role";
      toast.error(message);
      throw error;
    },
  });
}

/**
 * Hook to bulk operations on users
 * @returns {Object} React Query mutation
 */
export function useBulkUserOperations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.bulkUserOperations,
    onSuccess: (data) => {
      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all });

      toast.success(
        `Bulk operation completed: ${data.affected} users affected`
      );
      return data;
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Bulk operation failed";
      toast.error(message);
      throw error;
    },
  });
}
