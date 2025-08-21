import axios from "axios";

const API_URL = "/api/feedback";

// Create axios instance with default config
const feedbackApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

/**
 * Fetch All feedback
 * @returns
 */
export const getAllFeedback = async () => {
  try {
    const response = await feedbackApi.get("/");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Fetch feedback by ID
 * @param {string} feedbackId - The ID of the feedback to fetch
 * @returns
 */
export const getFeedbackById = async (feedbackId) => {
  try {
    const response = await feedbackApi.get(`/${feedbackId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create new feedback
 * @param {Object} feedbackData - The feedback data to create
 * @returns
 */
export const createFeedback = async (feedbackData) => {
  try {
    const response = await feedbackApi.post("/", feedbackData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update feedback
 * @param {string} feedbackId - The ID of the feedback to update
 * @param {Object} feedbackData - The updated feedback data
 * @returns
 */
export const updateFeedback = async (feedbackId, feedbackData) => {
  // take out createdBy, createdAt, updatedAt, updatedBy
  const updatedData = { ...feedbackData };
  delete updatedData.createdBy;
  delete updatedData.createdAt;
  delete updatedData.updatedAt;
  delete updatedData.updatedBy;
  delete updatedData.submittedAt;
  try {
    const response = await feedbackApi.put(`/${feedbackId}`, updatedData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete feedback
 * @param {string} feedbackId - The ID of the feedback to delete
 * @returns
 */
export const deleteFeedback = async (feedbackId) => {
  console.log("Deleting feedback with ID:", feedbackId);
  try {
    const response = await feedbackApi.delete(`/${feedbackId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * search feedback
 * @param {string} query - The search query
 * @returns
 */
export const searchFeedback = async (params = {}) => {
  // console.log("Searching feedback with params:", params);
  try {
    const response = await feedbackApi.get("/search", {
      params,
    });

    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update feedback status specifically
 * @param {string} feedbackId - The ID of the feedback
 * @param {string} status - New status
 * @param {string} comments - comments for status change
 * @returns
 */
export const updateFeedbackStatus = async (
  feedbackId,
  status,
  comments = ""
) => {
  try {
    const response = await feedbackApi.patch(`/${feedbackId}/status`, {
      status,
      comments,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Assign feedback to a user
 * @param {string} feedbackId - The ID of the feedback
 * @param {string} assignedTo - User ID to assign to
 * @param {string} comments - Assignment comments
 * @returns
 */
export const assignFeedback = async (feedbackId, assignedTo, comments = "") => {
  try {
    const response = await feedbackApi.patch(`/${feedbackId}/assign`, {
      assignedTo,
      comments,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Bulk update multiple feedback entries
 * @param {Array} ids - Array of feedback IDs
 * @param {Object} updates - Updates to apply
 * @returns
 */
export const bulkUpdateFeedback = async (ids, updates) => {
  try {
    const response = await feedbackApi.patch("/bulk-update", {
      ids,
      updates,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

//============== Feedback History ================

export const getFeedbackHistory = async (feedbackId) => {
  try {
    const response = await feedbackApi.get(`/${feedbackId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createFeedbackHistory = async (feedbackId, historyData) => {
  try {
    const response = await feedbackApi.post(
      `/${feedbackId}/history`,
      historyData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

//============== Feedback Comments ================

/**
 * Get all comments for a feedback
 * @param {string} feedbackId - The feedback ID
 * @param {Object} options - Query options
 * @returns {Promise} Comments response
 */
export const getFeedbackComments = async (feedbackId, options = {}) => {
  try {
    const response = await feedbackApi.get(`/${feedbackId}/comments`, {
      params: options,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Create a new comment for feedback
 * @param {string} feedbackId - The feedback ID
 * @param {Object} commentData - Comment data (comment, isInternal)
 * @returns {Promise} Comment response
 */
export const createFeedbackComment = async (feedbackId, commentData) => {
  try {
    const response = await feedbackApi.post(
      `/${feedbackId}/comments`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a comment
 * @param {string} feedbackId - The feedback ID
 * @param {string} commentId - The comment ID
 * @param {Object} commentData - Updated comment data
 * @returns {Promise} Comment response
 */
export const updateFeedbackComment = async (
  feedbackId,
  commentId,
  commentData
) => {
  try {
    const response = await feedbackApi.put(
      `/${feedbackId}/comments/${commentId}`,
      commentData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a comment
 * @param {string} feedbackId - The feedback ID
 * @param {string} commentId - The comment ID
 * @returns {Promise} Delete response
 */
export const deleteFeedbackComment = async (feedbackId, commentId) => {
  try {
    const response = await feedbackApi.delete(
      `/${feedbackId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get comment count for feedback
 * @param {string} feedbackId - The feedback ID
 * @returns {Promise} Count response
 */
export const getFeedbackCommentCount = async (feedbackId) => {
  try {
    const response = await feedbackApi.get(`/${feedbackId}/comments/count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
