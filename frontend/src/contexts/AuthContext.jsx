import { createContext, useContext, useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { getCurrentUser } from "../services/authApi";

// Auth state reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state (no tokens stored in frontend)
const initialState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
};

// Create contexts
const AuthContext = createContext();
const AuthDispatchContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state by checking with server
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });

        // Try to get current user - cookies will be sent automatically
        const response = await getCurrentUser();
        // console.log("Current user response:", response);
        if (response.success && response.user) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: response.user },
          });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch (error) {
        console.log("No active session found", error);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auth actions
  const login = (userData) => {
    dispatch({
      type: "LOGIN_SUCCESS",
      payload: userData,
    });
    // No token storage needed - cookies handle this
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    // No token cleanup needed - server clears cookies
  };

  const updateUser = (userData) => {
    dispatch({
      type: "UPDATE_USER",
      payload: userData,
    });
  };

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "LOGIN_FAILURE", payload: error });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const authActions = {
    login,
    logout,
    updateUser,
    setLoading,
    setError,
    clearError,
  };

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={authActions}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  );
}

// Custom hooks remain the same
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthActions() {
  const context = useContext(AuthDispatchContext);
  if (!context) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return context;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
