import { PermissionService } from "../services/permissionService.js";

import { ROLES_HIERARCHY } from "../config/rolesConfig.js";

/**
 * Middleware to check basic permissions
 * @param {string} resource - Resource type
 * @param {string} action - Action to perform
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
export const requirePermission = (resource, action, options = {}) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        });
      }

      // Get target resource if getResource function provided
      let targetResource = null;
      if (options.getResource && typeof options.getResource === "function") {
        try {
          targetResource = await options.getResource(req);
          req.targetResource = targetResource; // Attach to request
        } catch (error) {
          if (options.requireResource !== false) {
            return res.status(404).json({
              success: false,
              message: "Resource not found",
              error: "RESOURCE_NOT_FOUND",
            });
          }
        }
      }

      // Perform authorization check
      const authResult = PermissionService.authorize(
        user,
        resource,
        action,
        targetResource
      );

      if (!authResult.allowed) {
        const statusCode = authResult.code === "UNAUTHORIZED" ? 401 : 403;
        return res.status(statusCode).json({
          success: false,
          message: authResult.reason,
          error: authResult.code,
        });
      }

      // Generate query filters based on permissions
      const queryFilters = PermissionService.generateQueryFilters(
        user,
        resource,
        action
      );

      // Attach to request for use in controllers
      req.permissionFilters = queryFilters;

      req.authResult = authResult;

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error: "AUTHORIZATION_ERROR",
      });
    }
  };
};

/**
 * Middleware to apply resource filters based on permissions
 * @param {string} resourceType - Type of resources
 * @param {string} action - Action being performed
 */
export const applyResourceFilter = (resourceType, action = "read") => {
  return (req, res, next) => {
    // If filters are already attached, just continue
    if (req.permissionFilters) {
      return next();
    }

    try {
      const user = req.user;
      if (!user) {
        return next();
      }

      // Generate and attach query filters
      req.permissionFilters = PermissionService.generateQueryFilters(
        user,
        resourceType,
        action
      );

      next();
    } catch (error) {
      console.error("Filter generation error:", error);
      next();
    }
  };
};

// /**
//  * Middleware to filter query results based on permissions
//  * @param {string} resourceType - Type of resources
//  * @param {string} action - Action being performed
//  * @returns {Function} Express middleware
//  */
// export const applyResourceFilter = (resourceType, action = "read") => {
//   return (req, res, next) => {
//     // Store original response methods
//     const originalJson = res.json;
//     const originalSend = res.send;

//     // Override res.json
//     res.json = function (data) {
//       const filteredData = filterResponseData(
//         req.user,
//         data,
//         resourceType,
//         action
//       );
//       return originalJson.call(this, filteredData);
//     };

//     // Override res.send for string responses
//     res.send = function (data) {
//       if (typeof data === "string") {
//         try {
//           const jsonData = JSON.parse(data);
//           const filteredData = filterResponseData(
//             req.user,
//             jsonData,
//             resourceType,
//             action
//           );
//           return originalSend.call(this, JSON.stringify(filteredData));
//         } catch (e) {
//           // Not JSON, send as is
//           return originalSend.call(this, data);
//         }
//       }
//       return originalSend.call(this, data);
//     };

//     next();
//   };
// };

// /**
//  * Helper function to filter response data
//  * @private
//  */
// function filterResponseData(user, data, resourceType, action) {
//   try {
//     if (!user || !data) return data;

//     // Handle array response
//     if (Array.isArray(data)) {
//       return PermissionService.filterResources(
//         user,
//         data,
//         resourceType,
//         action
//       );
//     }

//     // Handle object with data array
//     if (data.data && Array.isArray(data.data)) {
//       return {
//         ...data,
//         data: PermissionService.filterResources(
//           user,
//           data.data,
//           resourceType,
//           action
//         ),
//       };
//     }

//     // Handle single resource
//     if (typeof data === "object" && data.id) {
//       const filtered = PermissionService.filterResources(
//         user,
//         [data],
//         resourceType,
//         action
//       );
//       return filtered.length > 0 ? data : null;
//     }

//     return data;
//   } catch (error) {
//     console.error("Response filtering error:", error);
//     return data;
//   }
// }

/**
 * Simple role check middleware
 * @param {string} requiredRole - Minimum required role
 * @returns {Function} Express middleware
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
      });
    }

    const userLevel = ROLES_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLES_HIERARCHY[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Role '${requiredRole}' or higher required`,
        error: "INSUFFICIENT_ROLE",
        requiredRole,
        userRole: user.role,
      });
    }

    next();
  };
};
