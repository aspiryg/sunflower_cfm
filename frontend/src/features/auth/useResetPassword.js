import { useMutation } from "@tanstack/react-query";
import { resetPassword as resetPasswordApi } from "../../services/authApi";

/**
 * Custom hook for password reset functionality
 * @returns {Object} - reset password function and loading/error states
 */
export function useResetPassword() {
  const {
    mutate: resetPassword,
    isPending: isLoading,
    error,
    isError,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: ({ token, newPassword }) =>
      resetPasswordApi(token, newPassword),
    onSuccess: (data) => {
      console.log("Password reset successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
    },
  });

  return {
    resetPassword,
    isLoading,
    isSuccess,
    error,
    isError,
    data,
  };
}
