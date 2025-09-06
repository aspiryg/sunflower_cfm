export const getUserDisplayName = (user) => {
  if (!user) return "Unknown User";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.username) {
    return user.username;
  }
  return "Unknown User";
};

export const getIndividualAgeGroup = (age) => {
  switch (age) {
    case "under_18":
      return "Under 18";
    case "18_25":
      return "18-25";
    case "26_35":
      return "26-35";
    case "36_50":
      return "36-50";
    case "51_65":
      return "51-65";
    case "over_65":
      return "Over 65";
    default:
      return "Unknown";
  }
};

// Enhanced role configurations with hierarchy and permissions
export const ROLE_DEFINITIONS = {
  user: {
    label: "User",
    level: 1,
    color: "green",
    description: "Standard user with basic feedback submission rights",
    permissions: [
      "Submit feedback entries",
      "View own feedback history",
      "Update personal profile",
      "Add comments to own feedback",
    ],
  },
  staff: {
    label: "Staff Member",
    level: 2,
    color: "blue",
    description: "Staff member with assigned feedback management capabilities",
    permissions: [
      "All User permissions",
      "View and manage assigned feedback",
      "Update feedback status",
      "Add comments to any feedback",
      "Access team collaboration tools",
    ],
  },
  manager: {
    label: "Manager",
    level: 3,
    color: "orange",
    description:
      "Manager with comprehensive feedback oversight and team management",
    permissions: [
      "All Staff permissions",
      "View and manage all feedback entries",
      "Assign feedback to team members",
      "Generate reports and analytics",
      "Manage staff assignments",
      "Access advanced filtering options",
    ],
  },
  admin: {
    label: "Administrator",
    level: 4,
    color: "red",
    description: "Administrator with full system access and user management",
    permissions: [
      "All Manager permissions",
      "Manage user accounts and roles",
      "Access system configuration",
      "View audit logs and system reports",
      "Manage system categories and settings",
      "Bulk operations on feedback and users",
    ],
  },
  super_admin: {
    label: "Super Administrator",
    level: 5,
    color: "purple",
    description: "Super Administrator with unrestricted access and control",
    permissions: [
      "All Administrator permissions",
      "Manage all user accounts and roles",
      "Access all system configuration",
      "View all audit logs and system reports",
      "Manage all system categories and settings",
      "Perform bulk operations on all feedback and users",
    ],
  },
};

export const getUserRole = (user) => {
  if (!user) return "Unknown";
  return ROLE_DEFINITIONS[user.role]?.label || "Unknown";
};
