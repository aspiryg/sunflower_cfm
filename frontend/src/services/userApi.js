import axios from "axios";

const API_URL = "/api/users";

const userApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add request interceptor for error handling
userApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("User API Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Get users with filters, pagination, and sorting
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Users data with pagination info
 */
export async function getUsers(params = {}) {
  const response = await userApi.get("", { params });
  return response;
}

/**
 * Get users statistics
 * @returns {Promise<Object>} Users statistics
 */
export async function getUsersStats() {
  const response = await userApi.get("/stats");
  return response;
}

/**
 * Get user by ID
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} User data
 */
export async function getUserById(userId) {
  const response = await userApi.get(`/${userId}`);
  return response;
}

/**
 * Search users
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export async function searchUsers(query) {
  const response = await userApi.get("/search", {
    params: { q: query },
  });
  return response;
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user
 */
export async function createUser(userData) {
  const response = await userApi.post("", userData);
  return response;
}

/**
 * Update user
 * @param {string|number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<Object>} Updated user
 */
export async function updateUser(userId, userData) {
  const response = await userApi.put(`/${userId}`, userData);
  return response;
}

/**
 * Delete user
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteUser(userId) {
  const response = await userApi.delete(`/${userId}`);
  return response;
}

/**
 * Update user status (active/inactive)
 * @param {string|number} userId - User ID
 * @param {boolean} isActive - New status
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserStatus(userId, isActive) {
  const response = await userApi.patch(`/${userId}/status`, { isActive });
  return response;
}

/**
 * Update user role
 * @param {string|number} userId - User ID
 * @param {Object} roleData - Role change data {role, reason}
 * @returns {Promise<Object>} Updated user
 */
export async function updateUserRole(userId, roleData) {
  try {
    const response = await userApi.patch(`/${userId}/role`, roleData);
    // The issue is here - we need to return the response data properly
    return response; // Remove .data since userApi interceptor already handles it
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Bulk operations on users
 * @param {Object} operation - Bulk operation data
 * @returns {Promise<Object>} Operation result
 */
export async function bulkUserOperations(operation) {
  const response = await userApi.post("/bulk", operation);
  return response;
}

/**
 * Export users data
 * @param {Object} filters - Export filters
 * @returns {Promise<Blob>} CSV file blob
 */
export async function exportUsers(filters = {}) {
  const response = await userApi.get("/export", {
    params: filters,
    responseType: "blob",
  });
  return response;
}

/**
 * Import users from CSV
 * @param {File} file - CSV file
 * @returns {Promise<Object>} Import result
 */
export async function importUsers(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await userApi.post("/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
}
