import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "../../services/authApi";
import { useAuth, useAuthActions } from "../../contexts/AuthContext";

/**
 * Custom hook for user login
 * @returns {Object} - login function and loading/error states
 */
export function useLogin() {
  const navigate = useNavigate();
  const { login: loginAction, setError, clearError } = useAuthActions();

  const {
    mutate: login,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSuccess: (data) => {
      // Clear any previous errors
      clearError();

      // Update auth context with user data only (no tokens)
      loginAction({
        user: data.user,
      });

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => {
      console.error("Login failed:", error);

      // Set error in context
      setError(error.message || "Login failed. Please try again.");
    },
  });

  return {
    login,
    isPending,
    isSuccess,
    error: error?.message || error,
    isError,
  };
}

/**
 * Custom hook for user registration
 * @returns {Object} - register function and loading/error states
 */
export function useRegister() {
  const { setError, clearError } = useAuthActions();

  const {
    mutate: register,
    isPending,
    error,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: (userData) => registerApi(userData),
    onSuccess: (data) => {
      // Clear any previous errors
      clearError();

      console.log("Registration successful:", data);
      // Note: We don't automatically log in the user
      // They need to verify their email first
    },
    onError: (error) => {
      console.error("Registration failed:", error);

      // Set error in context
      setError(error.message || "Registration failed. Please try again.");
    },
  });

  return {
    register,
    isPending,
    isSuccess,
    error: error?.message || error,
    isError,
  };
}

/**
 * Custom hook for user logout
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
      setError(
        error.message || "Logout failed, but you have been signed out locally."
      );
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
 * Custom hook to get current authentication state
 * @returns {Object} - current auth state
 */
export function useCurrentUser() {
  const auth = useAuth();
  return auth;
}
