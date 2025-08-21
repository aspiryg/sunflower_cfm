import { useAuth } from "../contexts/AuthContext";
import {
  FrontendPermissionService,
  ACTIONS,
  RESOURCES,
} from "../services/permissionService";

/**
 * Enhanced hook for role-based authorization using permission service
 */
export function useRoleBasedAuth() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if user has permission for action on resource type
   * @param {string} resource - Resource type
   * @param {string} action - Action to perform
   * @returns {boolean}
   */
  const hasPermission = (resource, action) => {
    const permission = FrontendPermissionService.checkPermission(
      user,
      resource,
      action
    );
    return permission.allowed;
  };

  /**
   * Check if user can access specific resource instance
   * @param {Object} resource - Resource object
   * @param {string} resourceType - Type of resource
   * @param {string} action - Action to perform
   * @returns {boolean}
   */
  const canAccessResource = (resource, resourceType, action) => {
    return FrontendPermissionService.canAccessResource(
      user,
      resource,
      resourceType,
      action
    );
  };

  /**
   * Check if user has role or higher
   * @param {string} requiredRole - Required role
   * @returns {boolean}
   */
  const hasRole = (requiredRole) => {
    return FrontendPermissionService.hasRole(user, requiredRole);
  };

  /**
   * Get permission details for debugging
   * @param {string} resource - Resource type
   * @param {string} action - Action to perform
   * @returns {Object}
   */
  const getPermissionDetails = (resource, action) => {
    return FrontendPermissionService.checkPermission(user, resource, action);
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasPermission,
    canAccessResource,
    getPermissionDetails,
    currentRole: user?.role,
  };
}

// Convenience hooks for common checks
export function useCommentPermissions() {
  const { canAccessResource, hasPermission } = useRoleBasedAuth();

  return {
    canCreateComment: () => hasPermission(RESOURCES.COMMENTS, ACTIONS.CREATE),
    canEditComment: (comment) =>
      canAccessResource(comment, RESOURCES.COMMENTS, ACTIONS.UPDATE),
    canDeleteComment: (comment) =>
      canAccessResource(comment, RESOURCES.COMMENTS, ACTIONS.DELETE),
    canReadComments: () => hasPermission(RESOURCES.COMMENTS, ACTIONS.READ),
  };
}

export function useFeedbackPermissions() {
  const { canAccessResource, hasPermission } = useRoleBasedAuth();

  return {
    canCreateFeedback: () => hasPermission(RESOURCES.FEEDBACK, ACTIONS.CREATE),
    canEditFeedback: (feedback) =>
      canAccessResource(feedback, RESOURCES.FEEDBACK, ACTIONS.UPDATE),
    canDeleteFeedback: (feedback) =>
      canAccessResource(feedback, RESOURCES.FEEDBACK, ACTIONS.DELETE),
    canAssignFeedback: (feedback) =>
      canAccessResource(feedback, RESOURCES.FEEDBACK, ACTIONS.ASSIGN),
    canReadFeedback: (feedback) =>
      canAccessResource(feedback, RESOURCES.FEEDBACK, ACTIONS.READ),
  };
}
