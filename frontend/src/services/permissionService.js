/**
 * Frontend Permission Service
 * Mirrors backend permissions for UI decisions only
 * Server-side validation remains authoritative
 */

// Role hierarchy matching backend
const ROLES_HIERARCHY = {
  user: 1,
  staff: 2,
  manager: 3,
  admin: 4,
  super_admin: 5,
};

const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  ASSIGN: "assign",
};

const RESOURCES = {
  FEEDBACK: "feedback",
  USERS: "users",
  COMMENTS: "comments",
  NOTIFICATIONS: "notifications",
};

const ACTION_RESTRICTIONS = {
  ALL: "all",
  OWN: "own",
  ASSIGNED: "assigned",
  NONE: "none",
};

// Simplified permissions for frontend (matching your backend)
const ROLE_PERMISSIONS = {
  user: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
  },

  staff: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ASSIGNED,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
  },

  manager: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.ASSIGN]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
  },

  admin: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.ASSIGN]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
  },

  super_admin: {
    // Super admin has all permissions
    "*": "*",
  },
};

export class FrontendPermissionService {
  /**
   * Check if user has permission to perform action on resource type
   * @param {Object} user - User object
   * @param {string} resource - Resource type
   * @param {string} action - Action to perform
   * @returns {Object} Permission result
   */
  static checkPermission(user, resource, action) {
    if (!user || !user.role) {
      return { allowed: false, restriction: ACTION_RESTRICTIONS.NONE };
    }

    // Super admin can do anything
    if (user.role === "super_admin") {
      return { allowed: true, restriction: ACTION_RESTRICTIONS.ALL };
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) {
      return { allowed: false, restriction: ACTION_RESTRICTIONS.NONE };
    }

    // Handle super admin wildcard
    if (rolePermissions["*"] === "*") {
      return { allowed: true, restriction: ACTION_RESTRICTIONS.ALL };
    }

    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) {
      return { allowed: false, restriction: ACTION_RESTRICTIONS.NONE };
    }

    const actionRestriction = resourcePermissions[action];
    if (!actionRestriction) {
      return { allowed: false, restriction: ACTION_RESTRICTIONS.NONE };
    }

    if (actionRestriction === ACTION_RESTRICTIONS.NONE) {
      return { allowed: false, restriction: ACTION_RESTRICTIONS.NONE };
    }

    return { allowed: true, restriction: actionRestriction };
  }

  /**
   * Check if user can access specific resource based on ownership
   * @param {Object} user - User object
   * @param {Object} resource - Resource object
   * @param {string} resourceType - Type of resource
   * @param {string} action - Action to perform
   * @returns {boolean} True if user can access the resource
   */
  static canAccessResource(user, resource, resourceType, action) {
    const permission = this.checkPermission(user, resourceType, action);

    if (!permission.allowed) {
      return false;
    }

    // If restriction is 'all', user can access any resource
    if (permission.restriction === ACTION_RESTRICTIONS.ALL) {
      return true;
    }

    // Check ownership for 'own' restriction
    if (permission.restriction === ACTION_RESTRICTIONS.OWN) {
      return this._checkOwnership(user, resource, resourceType);
    }

    // Check assignment for 'assigned' restriction
    if (permission.restriction === ACTION_RESTRICTIONS.ASSIGNED) {
      return this._checkAssignment(user, resource, resourceType);
    }

    return false;
  }

  /**
   * Check if user has role or higher
   * @param {Object} user - User object
   * @param {string} requiredRole - Required role
   * @returns {boolean}
   */
  static hasRole(user, requiredRole) {
    if (!user || !user.role) return false;

    const userLevel = ROLES_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLES_HIERARCHY[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Private method to check ownership
   * @private
   */
  static _checkOwnership(user, resource, resourceType) {
    if (!resource || !user) return false;

    switch (resourceType) {
      case RESOURCES.COMMENTS:
        return resource.createdBy?.id === user.id;
      case RESOURCES.FEEDBACK:
        return (
          resource.createdBy?.id === user.id ||
          resource.submittedBy?.id === user.id
        );
      default:
        return false;
    }
  }

  /**
   * Private method to check assignment
   * @private
   */
  static _checkAssignment(user, resource, resourceType) {
    if (!resource || !user) return false;

    switch (resourceType) {
      case RESOURCES.FEEDBACK:
        return resource.assignedTo?.id === user.id;
      default:
        return false;
    }
  }
}

// Export constants for use in components
export { ACTIONS, RESOURCES, ACTION_RESTRICTIONS, ROLES_HIERARCHY };
