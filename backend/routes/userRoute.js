import { Router } from "express";
import {
  createUserAsync,
  getAllUsersAsync,
  updateUserAsync,
  getUserByIdAsync,
  deleteUserAsync,
  updateUserRoleAsync,
} from "../controllers/userController.js";
import {
  validateUserCreation,
  validateProfileUpdate,
  validateRoleUpdate,
  handleValidationErrors,
} from "../middlewares/validation.js";
import { authenticateToken } from "../middlewares/auth.js";
import { requirePermission } from "../middlewares/autherization.js";
import { ResourceHelpers } from "../utils/resourceHelpers.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

/**
 * @route POST /api/users
 * @description Create a new user (Admin functionality)
 * @access Private - Admin only
 */
router.post(
  "/",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.CREATE),
  validateUserCreation(),
  handleValidationErrors,
  createUserAsync
);

/**
 * @route GET /api/users
 * @description Get all users with filtering and pagination
 * @access Private - Staff and above
 */
router.get(
  "/",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.READ),
  getAllUsersAsync
);

/**
 * @route GET /api/users/:id
 * @description Get user by ID with proper access control
 * @access Private
 */
router.get(
  "/:id",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.READ, {
    getResource: ResourceHelpers.getUser,
  }),
  getUserByIdAsync
);

/**
 * @route PUT /api/users/:id
 * @description Update user profile and information
 * @access Private
 */
router.put(
  "/:id",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getUser,
  }),
  validateProfileUpdate(),
  handleValidationErrors,
  updateUserAsync
);

/**
 * @route PATCH /api/users/:id/role
 * @description Update user role (Admin functionality)
 * @access Private - Admin only
 */
router.patch(
  "/:id/role",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getUser,
  }),
  validateRoleUpdate(),
  handleValidationErrors,
  updateUserRoleAsync
);

/**
 * @route DELETE /api/users/:id
 * @description Soft delete user (deactivate account)
 * @access Private - Admin only
 */
router.delete(
  "/:id",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.DELETE, {
    getResource: ResourceHelpers.getUser,
  }),
  deleteUserAsync
);

export default router;
