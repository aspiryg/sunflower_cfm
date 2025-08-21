import { useMutation } from "@tanstack/react-query";
import { verifyEmail as verifyEmailApi } from "../../services/authApi";

/**
 * Custom hook for email verification functionality
 * @returns {Object} - verify email function and loading/error states
 */
export function useEmailVerification() {
  const {
    mutate: verifyEmail,
    isPending: isLoading,
    error,
    isError,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: (token) => verifyEmailApi(token),
    onSuccess: (data) => {
      console.log("Email verified successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to verify email:", error);
    },
  });

  return {
    verifyEmail,
    isLoading,
    isSuccess,
    error,
    isError,
    data,
  };
}
