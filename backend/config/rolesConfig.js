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

  // Special actions
  ASSIGN: "assign",
  EXPORT: "export",
  IMPORT: "import",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_USERS: "manage_users",
};

const RESOURCES = {
  FEEDBACK: "feedback",
  USERS: "users",
  CATEGORIES: "categories",
  NOTIFICATIONS: "notifications",
  SYSTEM: "system",
  COMMENTS: "comments",
  FEEDBACK_HISTORY: "feedback_history",
};

const ACTION_RESTRICTIONS = {
  ALL: "all", // Can access all resources of this type
  OWN: "own", // Can only access resources they own
  ASSIGNED: "assigned", // Can access resources assigned to them
  NONE: "none", // No access
};

// Main permission configuration - Role -> Resource -> Action -> Restriction
const ROLE_PERMISSIONS = {
  user: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL, // Can create any feedback
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN, // Can only read own feedback
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN, // Can only update own feedback
    },
    [RESOURCES.USERS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN, // Can only read own profile
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN, // Can only update own profile
    },
    [RESOURCES.CATEGORIES]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read all categories
    },
    [RESOURCES.NOTIFICATIONS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN, // Can read own notifications
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL, // Can create notifications
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL, // Can comment on any feedback
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read comments
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN, // Can update own comments
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN, // Can delete own comments
    },
  },

  staff: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read all feedback
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ASSIGNED, // Can update all feedback
    },
    [RESOURCES.USERS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read all user profiles
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN, // Can only update own profile
    },
    [RESOURCES.CATEGORIES]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.NOTIFICATIONS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL, // Can create notifications
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL, // Can update any comments
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN, // Can only delete own comments
    },
  },

  manager: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.ASSIGN]: ACTION_RESTRICTIONS.ALL, // Can assign feedback
    },
    [RESOURCES.USERS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read all user profiles
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN, // Can only update own profile
    },
    [RESOURCES.CATEGORIES]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.NOTIFICATIONS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN, // Can delete own comments
    },
  },

  admin: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL, // Can delete feedback
      [ACTIONS.ASSIGN]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.USERS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL, // Can create users
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL, // Can update any user
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL, // Can delete users
      [ACTIONS.MANAGE_USERS]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.CATEGORIES]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.NOTIFICATIONS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL, // Can read all notifications
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL, // Can delete any notification
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.OWN,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.OWN,
    },
  },

  super_admin: {
    [RESOURCES.FEEDBACK]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.ASSIGN]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.EXPORT]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.IMPORT]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.USERS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.MANAGE_USERS]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.CATEGORIES]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.NOTIFICATIONS]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.COMMENTS]: {
      [ACTIONS.CREATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.DELETE]: ACTION_RESTRICTIONS.ALL,
    },
    [RESOURCES.SYSTEM]: {
      [ACTIONS.READ]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.UPDATE]: ACTION_RESTRICTIONS.ALL,
      [ACTIONS.MANAGE_SETTINGS]: ACTION_RESTRICTIONS.ALL,
    },
  },
};

// Define how ownership is determined for each resource
const OWNERSHIP_FIELDS = {
  [RESOURCES.FEEDBACK]: {
    ownerField: "createdBy", // Field that identifies the owner
    assigneeField: "assignedTo", // Field that identifies assignee (for staff access)
  },
  [RESOURCES.USERS]: {
    ownerField: "id", // Users own their own user record
  },
  [RESOURCES.NOTIFICATIONS]: {
    ownerField: "userId",
  },
  [RESOURCES.COMMENTS]: {
    ownerField: "createdBy.id",
  },
  [RESOURCES.CATEGORIES]: {
    // Categories don't have individual ownership - they're system-wide
  },
};

export {
  ROLES_HIERARCHY,
  ACTIONS,
  RESOURCES,
  ACTION_RESTRICTIONS,
  ROLE_PERMISSIONS,
  OWNERSHIP_FIELDS,
};
