import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { login as loginApi, logout as logoutApi } from "../../services/authApi";
import { useAuth, useAuthActions } from "../../contexts/AuthContext";

/**
 * Enhanced login hook with comprehensive error handling
 * @returns {Object} - login function and loading/error states with detailed error types
 */
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    login: loginAction,
    setError,
    clearError,
    // logout: logoutAction,
  } = useAuthActions();

  const {
    mutate: login,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: async (data) => {
      // Clear any previous errors
      clearError();

      // Check if email is verified before proceeding
      if (!data.user.isEmailVerified) {
        console.log("❌ Email not verified, blocking login");

        // Logout the user immediately (server-side)
        try {
          await logoutApi();
        } catch (logoutError) {
          console.error(
            "Failed to logout after email verification check:",
            logoutError
          );
        }

        // Set special error state for email verification
        setError({
          type: "EMAIL_NOT_VERIFIED",
          message: "Email verification required",
          userEmail: data.user.email,
        });

        return;
      }

      // Email is verified, proceed with login
      loginAction({
        user: data.user,
      });
      // Clear all cached data
      queryClient.clear();

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("Login failed:", error);

      // Handle different error types with specific error objects
      let errorDetails = {
        type: "UNKNOWN_ERROR",
        message: "Login failed. Please try again.",
      };

      switch (error.error) {
        case "INVALID_CREDENTIALS":
          errorDetails = {
            type: "INVALID_CREDENTIALS",
            message:
              "Invalid email or password. Please check your credentials and try again.",
          };
          break;

        case "ACCOUNT_LOCKED":
          errorDetails = {
            type: "ACCOUNT_LOCKED",
            message:
              error.message ||
              "Account temporarily locked due to too many failed attempts.",
            // find locked until in message "'Account is locked. Try again in 23 minutes.'"
            lockUntil: error.lockUntil || null,
          };
          break;

        case "USER_NOT_FOUND":
          errorDetails = {
            type: "INVALID_CREDENTIALS", // Don't reveal that user doesn't exist
            message:
              "Invalid email or password. Please check your credentials and try again.",
          };
          break;

        case "EMAIL_NOT_VERIFIED":
          errorDetails = {
            type: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email address before logging in.",
            userEmail: error.userEmail,
          };
          break;

        default:
          errorDetails = {
            type: "UNKNOWN_ERROR",
            message:
              error.message ||
              "An unexpected error occurred. Please try again.",
          };
      }

      // Set detailed error in context
      setError(errorDetails);
    },
  });

  return {
    login,
    isPending,
    isSuccess,
    error,
    isError,
  };
}

/**
 * Enhanced logout hook
 * @returns {Object} - logout function and loading/error states
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: logoutAction, setError, clearError } = useAuthActions();

  const {
    mutate: logout,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      // Clear any previous errors
      clearError();

      // Update auth context
      logoutAction();

      // Clear all cached data
      queryClient.clear();

      // Navigate to login page
      navigate("/login", { replace: true });
    },
    onError: (error) => {
      console.error("Logout failed:", error);

      // Even if logout fails on server, clear local state
      logoutAction();
      queryClient.clear();
      navigate("/login", { replace: true });

      // Set error in context
      setError({
        type: "LOGOUT_ERROR",
        message:
          error.message ||
          "Logout failed, but you have been signed out locally.",
      });
    },
  });

  return {
    logout,
    isPending,
    isSuccess,
    error: error?.message || error,
    isError,
  };
}

/**
 * custom hook to verify the email
 */

export function useEmailVerification() {}

/**
 * Custom hook to get current authentication state
 * @returns {Object} - current auth state
 */
export function useCurrentUser() {
  const auth = useAuth();
  return auth;
}
