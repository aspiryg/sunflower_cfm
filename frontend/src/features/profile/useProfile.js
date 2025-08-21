import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthActions } from "../../contexts/AuthContext";
import {
  getCurrentProfile,
  updateProfile,
  updateContactInfo,
  updateUsername,
  updateEmail,
  changePassword,
  uploadProfilePicture,
  deleteProfilePicture,
  getProfileCompletion,
  updateTwoFactorAuth,
  deactivateAccount,
} from "../../services/profileApi";

// Query Keys
export const profileKeys = {
  all: ["profile"],
  detail: () => [...profileKeys.all, "detail"],
  completion: () => [...profileKeys.all, "completion"],
};

/**
 * Hook to get current user profile
 */
export function useProfile(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getCurrentProfile,
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
    onError: (error) => {
      console.error("Failed to fetch profile:", error);
    },
  });
}

/**
 * Hook to get profile completion status
 */
export function useProfileCompletion(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: profileKeys.completion(),
    queryFn: getProfileCompletion,
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    onError: (error) => {
      console.error("Failed to fetch profile completion:", error);
    },
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the profile cache
      queryClient.setQueryData(profileKeys.detail(), data);

      // Update auth context
      if (data.data) {
        updateUser(data.data);
      }

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success("Profile updated successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
      toast.error(error?.message || "Failed to update profile");
    },
  });
}

/**
 * Hook to update contact information
 */
export function useUpdateContactInfo(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: updateContactInfo,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);

      if (data.data) {
        updateUser(data.data);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success("Contact information updated successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Contact info update failed:", error);
      toast.error(error?.message || "Failed to update contact information");
    },
  });
}

/**
 * Hook to update username
 */
export function useUpdateUsername(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: updateUsername,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);

      if (data.data) {
        updateUser(data.data);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success("Username updated successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Username update failed:", error);
      toast.error(error?.message || "Failed to update username");
    },
  });
}

/**
 * Hook to update email
 */
export function useUpdateEmail(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: updateEmail,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);

      if (data.data) {
        updateUser(data.data);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success(
          "Email updated successfully! Please check your email to verify."
        );
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Email update failed:", error);
      toast.error(error?.message || "Failed to update email");
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword(options = {}) {
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      if (showSuccessToast) {
        toast.success("Password changed successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Password change failed:", error);
      toast.error(error?.message || "Failed to change password");
    },
  });
}

/**
 * Hook to upload profile picture
 */
export function useUploadProfilePicture(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: uploadProfilePicture,
    onSuccess: (data) => {
      // Update caches
      queryClient.setQueryData(profileKeys.detail(), (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: data.data.user,
        };
      });

      if (data.data?.user) {
        updateUser(data.data.user);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success("Profile picture uploaded successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Profile picture upload failed:", error);
      toast.error(error?.message || "Failed to upload profile picture");
    },
  });
}

/**
 * Hook to delete profile picture
 */
export function useDeleteProfilePicture(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: deleteProfilePicture,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);

      if (data.data) {
        updateUser(data.data);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        toast.success("Profile picture deleted successfully!");
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Profile picture deletion failed:", error);
      toast.error(error?.message || "Failed to delete profile picture");
    },
  });
}

/**
 * Hook to update two-factor authentication
 */
export function useUpdateTwoFactorAuth(options = {}) {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: updateTwoFactorAuth,
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(), data);

      if (data.data) {
        updateUser(data.data);
      }

      queryClient.invalidateQueries({ queryKey: profileKeys.all });

      if (showSuccessToast) {
        const message = data.data?.twoFactorEnabled
          ? "Two-factor authentication enabled successfully!"
          : "Two-factor authentication disabled successfully!";
        toast.success(message);
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Two-factor auth update failed:", error);
      toast.error(
        error?.message || "Failed to update two-factor authentication"
      );
    },
  });
}

/**
 * Hook to deactivate account
 */
export function useDeactivateAccount(options = {}) {
  const { logout } = useAuthActions();
  const { onSuccess, showSuccessToast = true } = options;

  return useMutation({
    mutationFn: deactivateAccount,
    onSuccess: (data) => {
      if (showSuccessToast) {
        toast.success(
          "Account deactivated successfully. You will be logged out."
        );
      }

      // Log out the user after successful deactivation
      setTimeout(() => {
        logout();
      }, 2000);

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      console.error("Account deactivation failed:", error);
      toast.error(error?.message || "Failed to deactivate account");
    },
  });
}
