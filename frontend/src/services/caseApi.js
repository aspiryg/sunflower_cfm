// Create this file: /frontend/src/services/caseApi.js
import axios from "axios";

const API_URL = "/api/cases";

// Create axios instance with default config
const caseApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

// ============= MAIN CASE CRUD OPERATIONS =============

/**
 * Fetch all cases with filtering and pagination
 * @param {Object} params - Query parameters for filtering, pagination, and sorting
 * @returns {Promise} Cases response with data and pagination
 */
export const getAllCases = async (params = {}) => {
  try {
    const response = await caseApi.get("/", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Search cases with advanced filtering
 * @param {Object} params - Search and filter parameters
 * @returns {Promise} Search results with data and pagination
 */
export const searchCases = async (params = {}) => {
  // console.log("Search Cases - Params:", params);
  try {
    const response = await caseApi.get("/search", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetch case by ID
 * @param {string|number} caseId - The ID of the case to fetch
 * @returns {Promise} Case data
 */
export const getCaseById = async (caseId) => {
  try {
    const response = await caseApi.get(`/getById/${caseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetch case by case number
 * @param {string} caseNumber - The case number to fetch
 * @returns {Promise} Case data
 */
export const getCaseByCaseNumber = async (caseNumber) => {
  try {
    const response = await caseApi.get(`/number/${caseNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new case
 * @param {Object} caseData - The case data to create
 * @returns {Promise} Created case data
 */
export const createCase = async (caseData) => {
  try {
    const response = await caseApi.post("/", caseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update existing case
 * @param {string|number} caseId - The ID of the case to update
 * @param {Object} caseData - The updated case data
 * @returns {Promise} Updated case data
 */
export const updateCase = async (caseId, caseData) => {
  // console.log("Updating case:", caseId, caseData);
  try {
    // Remove read-only fields that shouldn't be updated
    const updateData = { ...caseData };
    delete updateData.id;
    delete updateData.caseNumber;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.submittedAt;

    const response = await caseApi.put(`/${caseId}`, updateData);
    // console.log("Updated Case Data:", response);

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete case (soft delete)
 * @param {string|number} caseId - The ID of the case to delete
 * @returns {Promise} Delete confirmation
 */
export const deleteCase = async (caseId) => {
  try {
    const response = await caseApi.delete(`/${caseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============= CASE WORKFLOW OPERATIONS =============

/**
 * Assign case to a user
 * @param {string|number} caseId - The case ID
 * @param {string|number} assignedTo - User ID to assign to
 * @param {string} comments - Assignment comments
 * @param {string} expectedCompletionDate - Expected completion date
 * @returns {Promise} Assignment result
 */
export const assignCase = async (
  caseId,
  assignedTo,
  comments = "",
  expectedCompletionDate = null
) => {
  try {
    const response = await caseApi.patch(`/${caseId}/assign`, {
      assignedTo,
      comments,
      expectedCompletionDate,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Change case status
 * @param {string|number} caseId - The case ID
 * @param {string|number} statusId - New status ID
 * @param {Object} options - Status change options
 * @returns {Promise} Status change result
 */
export const changeCaseStatus = async (caseId, statusId, options = {}) => {
  try {
    const {
      reason = "",
      comments = "",
      resolutionSummary = "",
      isResolved = false,
    } = options;

    const response = await caseApi.patch(`/${caseId}/status`, {
      statusId,
      reason,
      comments,
      resolutionSummary,
      isResolved,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Escalate case
 * @param {string|number} caseId - The case ID
 * @param {string} escalationReason - Reason for escalation
 * @param {Object} options - Escalation options
 * @returns {Promise} Escalation result
 */
export const escalateCase = async (caseId, escalationReason, options = {}) => {
  try {
    const { escalatedTo = null, newPriorityId = null } = options;

    const response = await caseApi.patch(`/${caseId}/escalate`, {
      escalationReason,
      escalatedTo,
      newPriorityId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============= CASE HISTORY OPERATIONS =============

/**
 * Get case history
 * @param {string|number} caseId - The case ID
 * @param {Object} options - History query options
 * @returns {Promise} Case history data
 */
export const getCaseHistory = async (caseId, options = {}) => {
  try {
    const response = await caseApi.get(`/${caseId}/history`, {
      params: options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get case history summary
 * @param {string|number} caseId - The case ID
 * @returns {Promise} History summary data
 */
export const getCaseHistorySummary = async (caseId) => {
  try {
    const response = await caseApi.get(`/${caseId}/history/summary`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============= CASE COMMENTS OPERATIONS =============

/**
 * Get case comments
 * @param {string|number} caseId - The case ID
 * @param {Object} options - Comment query options
 * @returns {Promise} Case comments data
 */
export const getCaseComments = async (caseId, options = {}) => {
  try {
    const response = await caseApi.get(`/${caseId}/comments`, {
      params: options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add comment to case
 * @param {string|number} caseId - The case ID
 * @param {Object} commentData - Comment data
 * @returns {Promise} Created comment data
 */
export const addCaseComment = async (caseId, commentData) => {
  try {
    const response = await caseApi.post(`/${caseId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update case comment
 * @param {string|number} caseId - The case ID
 * @param {string|number} commentId - The comment ID
 * @param {Object} commentData - Updated comment data
 * @returns {Promise} Updated comment data
 */
export const updateCaseComment = async (caseId, commentId, commentData) => {
  try {
    const response = await caseApi.put(
      `/${caseId}/comments/${commentId}`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete case comment
 * @param {string|number} caseId - The case ID
 * @param {string|number} commentId - The comment ID
 * @returns {Promise} Delete confirmation
 */
export const deleteCaseComment = async (caseId, commentId) => {
  try {
    const response = await caseApi.delete(`/${caseId}/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get case comment count
 * @param {string|number} caseId - The case ID
 * @returns {Promise} Comment count data
 */
export const getCaseCommentCount = async (caseId) => {
  try {
    const response = await caseApi.get(`/${caseId}/comments/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Mark comment follow-up as completed
 * @param {string|number} caseId - The case ID
 * @param {string|number} commentId - The comment ID
 * @returns {Promise} Updated comment data
 */
export const markCommentFollowUpCompleted = async (caseId, commentId) => {
  try {
    const response = await caseApi.patch(
      `/${caseId}/comments/${commentId}/follow-up/complete`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get comments requiring follow-up across all cases
 * @param {Object} options - Query options
 * @returns {Promise} Comments requiring follow-up
 */
export const getCommentsRequiringFollowUp = async (options = {}) => {
  try {
    const response = await caseApi.get("/comments/follow-up", {
      params: options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ============= SUPPORTING DATA OPERATIONS =============

/**
 * Get all case categories
 * @param {Object} options - Query options
 * @returns {Promise} Categories data
 */
export const getCaseCategories = async (options = {}) => {
  try {
    const response = await caseApi.get("/categories", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all case statuses
 * @param {Object} options - Query options
 * @returns {Promise} Statuses data
 */
export const getCaseStatuses = async (options = {}) => {
  try {
    const response = await caseApi.get("/statuses", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all case priorities
 * @param {Object} options - Query options
 * @returns {Promise} Priorities data
 */
export const getCasePriorities = async (options = {}) => {
  try {
    const response = await caseApi.get("/priorities", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all case channels
 * @param {Object} options - Query options
 * @returns {Promise} Channels data
 */
export const getCaseChannels = async (options = {}) => {
  try {
    const response = await caseApi.get("/channels", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all regions
 * @param {Object} options - Query options
 * @returns {Promise} Regions data
 */
export const getRegions = async (options = {}) => {
  try {
    const response = await caseApi.get("/regions", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get governorates by region
 * @param {string|number} regionId - The region ID
 * @returns {Promise} Governorates data
 */
export const getGovernoratesByRegion = async (regionId) => {
  try {
    const response = await caseApi.get(`/regions/${regionId}/governorates`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get communities by governorate
 * @param {string|number} governorateId - The governorate ID
 * @returns {Promise} Communities data
 */
export const getCommunitiesByGovernorate = async (governorateId) => {
  try {
    const response = await caseApi.get(
      `/governorates/${governorateId}/communities`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all provider types
 * @param {Object} options - Query options
 * @returns {Promise} Provider types data
 */
export const getProviderTypes = async (options = {}) => {
  try {
    const response = await caseApi.get("/provider-types", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all programs
 * @param {Object} options - Query options
 * @returns {Promise} Programs data
 */
export const getPrograms = async (options = {}) => {
  try {
    const response = await caseApi.get("/programs", { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get projects by program
 * @param {string|number} programId - The program ID
 * @returns {Promise} Projects data
 */
export const getProjectsByProgram = async (programId) => {
  try {
    const response = await caseApi.get(`/programs/${programId}/projects`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get activities by project
 * @param {string|number} projectId - The project ID
 * @returns {Promise} Activities data
 */
export const getActivitiesByProject = async (projectId) => {
  try {
    const response = await caseApi.get(`/projects/${projectId}/activities`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default caseApi;
