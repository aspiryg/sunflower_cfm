import {
  ROLES_HIERARCHY,
  ACTIONS,
  RESOURCES,
  ACTION_RESTRICTIONS,
  ROLE_PERMISSIONS,
  OWNERSHIP_FIELDS,
} from "../config/rolesConfig.js";

/**
 * Simple and flexible permission service
 */
export class PermissionService {
  /**
   * Check if user has permission to perform action on resource type
   * @param {string} userRole - User's role
   * @param {string} resource - Resource type
   * @param {string} action - Action to perform
   * @returns {Object} Permission result with restriction level
   */
  static checkPermission(userRole, resource, action) {
    try {
      // Super admin can do anything
      if (userRole === "super_admin") {
        return {
          allowed: true,
          restriction: ACTION_RESTRICTIONS.ALL,
          reason: "Super admin access",
        };
      }

      // Get role permissions
      const rolePermissions = ROLE_PERMISSIONS[userRole];
      if (!rolePermissions) {
        return {
          allowed: false,
          restriction: ACTION_RESTRICTIONS.NONE,
          reason: `Role '${userRole}' not found`,
        };
      }

      // Get resource permissions
      const resourcePermissions = rolePermissions[resource];
      if (!resourcePermissions) {
        return {
          allowed: false,
          restriction: ACTION_RESTRICTIONS.NONE,
          reason: `No permissions for resource '${resource}'`,
        };
      }

      // Get action permission
      const actionRestriction = resourcePermissions[action];
      if (!actionRestriction) {
        return {
          allowed: false,
          restriction: ACTION_RESTRICTIONS.NONE,
          reason: `No permission for action '${action}' on resource '${resource}'`,
        };
      }

      if (actionRestriction === ACTION_RESTRICTIONS.NONE) {
        return {
          allowed: false,
          restriction: ACTION_RESTRICTIONS.NONE,
          reason: `No permission for action '${action}' on resource '${resource}'`,
        };
      }

      return {
        allowed: true,
        restriction: actionRestriction,
        reason: `Permission granted with '${actionRestriction}' restriction`,
      };
    } catch (error) {
      console.error("Permission check error:", error);
      return {
        allowed: false,
        restriction: ACTION_RESTRICTIONS.NONE,
        reason: "Permission check failed",
      };
    }
  }

  /**
   * Check if user can access specific resource based on ownership
   * @param {Object} user - User object
   * @param {Object} resource - Resource object
   * @param {string} resourceType - Type of resource
   * @param {string} restriction - Restriction level (all, own, assigned)
   * @returns {boolean} True if user can access the resource
   */
  static canAccessResource(user, resource, resourceType, restriction) {
    try {
      // If restriction is 'all', user can access any resource of this type
      if (restriction === ACTION_RESTRICTIONS.ALL) {
        return true;
      }

      // If restriction is 'none', user cannot access
      if (restriction === ACTION_RESTRICTIONS.NONE) {
        return false;
      }

      const ownership = OWNERSHIP_FIELDS[resourceType];
      if (!ownership) {
        // If no ownership rules defined, default to allowing access
        return true;
      }

      // Check ownership
      if (restriction === ACTION_RESTRICTIONS.OWN && ownership.ownerField) {
        return this._checkOwnership(user, resource, ownership.ownerField);
      }

      // Check assignee access
      if (
        restriction === ACTION_RESTRICTIONS.ASSIGNED &&
        ownership.assigneeField
      ) {
        return this._checkOwnership(user, resource, ownership.assigneeField);
      }

      // If restriction is 'own' or 'assigned' but resource doesn't support it, deny access
      return false;
    } catch (error) {
      console.error("Resource access check error:", error);
      return false;
    }
  }

  /**
   * Filter array of resources based on user permissions
   * @param {Object} user - User object
   * @param {Array} resources - Array of resources
   * @param {string} resourceType - Type of resources
   * @param {string} action - Action being performed
   * @returns {Array} Filtered resources
   */
  static filterResources(user, resources, resourceType, action = ACTIONS.READ) {
    try {
      if (!user || !resources || !Array.isArray(resources)) {
        return [];
      }

      // Check permission first
      const permission = this.checkPermission(user.role, resourceType, action);
      if (!permission.allowed) {
        return [];
      }

      // If restriction is 'all', return all resources
      if (permission.restriction === ACTION_RESTRICTIONS.ALL) {
        return resources;
      }

      // Filter based on restriction
      return resources.filter((resource) =>
        this.canAccessResource(
          user,
          resource,
          resourceType,
          permission.restriction
        )
      );
    } catch (error) {
      console.error("Resource filtering error:", error);
      return [];
    }
  }

  /**
   * Complete authorization check for user action on specific resource
   * @param {Object} user - User object
   * @param {string} resource - Resource type
   * @param {string} action - Action to perform
   * @param {Object} [targetResource] - Specific resource being accessed
   * @returns {Object} Complete authorization result
   */
  static authorize(user, resource, action, targetResource = null) {
    try {
      // Basic user validation
      if (!user || !user.isActive) {
        return {
          allowed: false,
          reason: "User not authenticated or inactive",
          code: "UNAUTHORIZED",
        };
      }

      // Check basic permission
      const permission = this.checkPermission(user.role, resource, action);
      if (!permission.allowed) {
        return {
          allowed: false,
          reason: permission.reason,
          code: "INSUFFICIENT_PERMISSIONS",
        };
      }

      // If no specific resource to check, permission is sufficient
      if (!targetResource) {
        return {
          allowed: true,
          reason: permission.reason,
          code: "AUTHORIZED",
          restriction: permission.restriction,
        };
      }

      // Check access to specific resource
      const canAccess = this.canAccessResource(
        user,
        targetResource,
        resource,
        permission.restriction
      );

      if (!canAccess) {
        return {
          allowed: false,
          reason: `Access denied: ${permission.restriction} restriction not met`,
          code: "RESOURCE_ACCESS_DENIED",
        };
      }

      return {
        allowed: true,
        reason: "Access granted to specific resource",
        code: "AUTHORIZED",
        restriction: permission.restriction,
      };
    } catch (error) {
      console.error("Authorization error:", error);
      return {
        allowed: false,
        reason: "Authorization check failed",
        code: "AUTHORIZATION_ERROR",
      };
    }
  }

  /**
   * Generates database filter conditions based on user's permissions
   * @param {Object} user - User object
   * @param {string} resourceType - Type of resource
   * @param {string} action - Action being performed
   * @returns {Object} Filter conditions for database query
   */
  static generateQueryFilters(user, resourceType, action = ACTIONS.READ) {
    try {
      if (!user) {
        return {};
      }

      // Super admin can access everything
      if (user.role === "super_admin") {
        return {};
      }

      // Check permission first
      const permission = this.checkPermission(user.role, resourceType, action);
      if (!permission.allowed) {
        // Return a filter that will yield n  o results
        return { impossible: true };
      }

      // If restriction is 'all', no filters needed
      if (permission.restriction === ACTION_RESTRICTIONS.ALL) {
        return {};
      }

      // If restriction is 'none', return impossible filter
      if (permission.restriction === ACTION_RESTRICTIONS.NONE) {
        return { impossible: true };
      }

      // Get ownership fields for the resource
      const ownership = OWNERSHIP_FIELDS[resourceType];
      if (!ownership) {
        return {};
      }

      // Build filter based on restriction type
      const filters = {};

      if (permission.restriction === ACTION_RESTRICTIONS.OWN) {
        if (resourceType === RESOURCES.USERS) {
          // for users, "own" means thier own user record
          filters.id = user.id;
        } else if (resourceType === RESOURCES.NOTIFICATIONS) {
          // for notifications, "own" means notifications sent to the user
          filters.userId = user.id;
        } else if (ownership.ownerField) {
          // For other resources, use the owner field
          // Extract actual field name from path (e.g., "submittedBy.id" -> "submittedBy")
          const fieldName = ownership.ownerField.split(".")[0];
          filters[fieldName] = user.id;
        }
      }

      if (
        permission.restriction === ACTION_RESTRICTIONS.ASSIGNED &&
        ownership.assigneeField
      ) {
        // Extract actual field name from path (e.g., "assignedTo.id" -> "assignedTo")
        const fieldName = ownership.assigneeField.split(".")[0];
        filters[fieldName] = user.id;
      }

      return filters;
    } catch (error) {
      console.error("Filter generation error:", error);
      return {};
    }
  }

  /**
   * Get all permissions for a role
   * @param {string} role - Role name
   * @returns {Object} Role permissions
   */
  static getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || {};
  }

  /**
   * Check if user can manage another user (role hierarchy)
   * @param {Object} managerUser - User performing the action
   * @param {Object} targetUser - User being managed
   * @returns {boolean} True if can manage
   */
  static canManageUser(managerUser, targetUser) {
    if (!managerUser || !targetUser) {
      return false;
    }

    // Can't manage yourself for role changes
    if (managerUser.id === targetUser.id) {
      return false;
    }

    const managerLevel = ROLES_HIERARCHY[managerUser.role] || 0;
    const targetLevel = ROLES_HIERARCHY[targetUser.role] || 0;

    // Can only manage users with lower role level
    return managerLevel > targetLevel;
  }

  /**
   * Get roles that user can assign to others
   * @param {Object} user - User object
   * @returns {Array} Array of assignable roles
   */
  static getAssignableRoles(user) {
    if (!user) return [];

    const userLevel = ROLES_HIERARCHY[user.role] || 0;

    return Object.keys(ROLES_HIERARCHY).filter((role) => {
      const roleLevel = ROLES_HIERARCHY[role];
      return roleLevel < userLevel;
    });
  }

  // Private helper methods

  /**
   * Check ownership using field path
   * @private
   */
  static _checkOwnership(user, resource, fieldPath) {
    try {
      if (!fieldPath) return false;

      // Handle nested field paths (e.g., "submittedBy.id")
      const fieldValue = fieldPath.split(".").reduce((obj, field) => {
        return obj && obj[field];
      }, resource);

      return fieldValue === user.id;
    } catch (error) {
      console.error("Ownership check error:", error);
      return false;
    }
  }

  /**
   * Get field value using dot notation
   * @private
   */
  static _getNestedFieldValue(obj, fieldPath) {
    return fieldPath.split(".").reduce((current, field) => {
      return current && current[field];
    }, obj);
  }
}
