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
  validateUserRegistration,
  handleValidationErrors,
} from "../middlewares/validation.js";
import { authenticateToken } from "../middlewares/auth.js";

import { requirePermission } from "../middlewares/autherization.js";
import { ResourceHelpers } from "../utils/resourceHelpers.js";
import { RESOURCES, ACTIONS } from "../config/rolesConfig.js";

const router = Router();

/** * @route POST /users
 * @description Create a new user
 * @access Public
 */
router.post(
  "/",
  validateUserRegistration(),
  handleValidationErrors,
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.CREATE),
  createUserAsync
);

/**
 * @route GET /users
 * @description Get all users (filtered by role)
 * @access Private
 */
router.get(
  "/",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.READ),
  getAllUsersAsync
);

/**
 * @route GET /users/:id
 * @description Get user by ID
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
 * @route PUT /users/:id
 * @description Update user
 * @access Private
 */
router.put(
  "/:id",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE, {
    getResource: ResourceHelpers.getUser,
  }),
  updateUserAsync
);

/**
 * @route PATCH /users/:id/role
 * @description Update user role
 * @access Private - Admin only
 */
router.patch(
  "/:id/role",
  authenticateToken,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE),
  updateUserRoleAsync
);

/**
 * @route SOFT DELETE /users/:id
 * @description Soft delete user (set isActive to false)
 * @access Private
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
