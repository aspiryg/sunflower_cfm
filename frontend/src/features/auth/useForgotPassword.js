import { useMutation } from "@tanstack/react-query";
import { forgotPassword as forgotPasswordApi } from "../../services/authApi";

/**
 * Custom hook for forgot password functionality
 * @returns {Object} - forgot password function and loading/error states
 */
export function useForgotPassword() {
  const {
    mutate: forgotPassword,
    isPending,
    error,
    isError,
    isSuccess,
    data,
  } = useMutation({
    mutationFn: (email) => forgotPasswordApi(email),
    onSuccess: (data) => {
      console.log("Password reset email sent successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to send password reset email:", error);
    },
  });

  return {
    forgotPassword,
    isPending,
    isSuccess,
    error: error?.message || error,
    isError,
    data,
  };
}
