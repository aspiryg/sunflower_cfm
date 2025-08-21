import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/AuthContext";
import { useRoleBasedAuth } from "../hooks/useRoleBasedAuth";
import LoadingSpinner from "../ui/LoadingSpinner";
import Text from "../ui/Text";

function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole = null,
  requiredRoles = null, // Accept array of roles
  exactRole = false, // Require exact role match
  redirectTo = "/login",
  fallback = null, // Custom fallback component
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasAnyRole, hasExactRole } = useRoleBasedAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Redirect if user is authenticated but trying to access auth pages
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check role-based access
  if (isAuthenticated) {
    let hasAccess = true;

    if (requiredRole) {
      hasAccess = exactRole
        ? hasExactRole(requiredRole)
        : hasRole(requiredRole);
    }

    if (requiredRoles && requiredRoles.length > 0) {
      hasAccess = hasAnyRole(requiredRoles);
    }

    if (!hasAccess) {
      if (fallback) {
        return fallback;
      }

      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <Text size="xl" color="danger">
            Access Denied: You do not have permission to view this page.
          </Text>
        </div>
      );
    }
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAuth: PropTypes.bool,
  requiredRole: PropTypes.string,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
  exactRole: PropTypes.bool,
  redirectTo: PropTypes.string,
  fallback: PropTypes.node,
};

export default ProtectedRoute;
