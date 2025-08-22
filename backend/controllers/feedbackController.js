import { Feedback } from "../models/Feedback.js";
import { FeedbackHistory } from "../models/FeedbackHistory.js";

export const feedbackController = {
  createFeedback: async (req, res) => {
    try {
      const userId = req.user ? req.user.id : 1;
      const feedback = await Feedback.createFeedbackAsync(req.body, userId);
      res.status(201).json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getFeedback: async (req, res) => {
    const feedbackId = parseInt(req.params.id, 10);
    try {
      const feedback = await Feedback.findFeedbackByIdAsync(feedbackId);
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getFeedbackByNumber: async (req, res) => {
    const feedbackNumber = req.params.feedbackNumber;
    if (!feedbackNumber) {
      return res.status(400).json({ error: "Feedback number is required" });
    }
    try {
      const feedback = await Feedback.findFeedbackByIdAsync(
        null,
        feedbackNumber
      );
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllFeedback: async (req, res) => {
    try {
      // Merge query parameters with permission filters
      const options = {
        ...req.query,
        ...req.permissionFilters,
      };

      // If permission filter indicates impossible condition, return empty array
      if (options.impossible) {
        return res.status(200).json([]);
      }

      const feedbackList = await Feedback.getAllFeedbackAsync(options);
      res.status(200).json(feedbackList);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  searchFeedback: async (req, res) => {
    try {
      // Merge query parameters with permission filters
      const queryParams = {
        ...req.query,
        ...req.permissionFilters,
      };
      // If permission filter indicates impossible condition, return empty result
      if (queryParams.impossible) {
        return res.status(200).json({
          data: [],
          pagination: {
            page: 1,
            limit: parseInt(req.query.limit) || 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          filters: {},
          search: { query: req.query.search || null, resultsCount: 0 },
        });
      }
      const result = await Feedback.searchFeedbackAsync(queryParams);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error searching feedback:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search feedback",
        error: error.message,
      });
    }
  },

  updateFeedback: async (req, res) => {
    const feedbackId = parseInt(req.params.id, 10);
    const updatedBy = req.user ? req.user.id : 1;

    // Extract metadata for history tracking
    const metadata = {
      comments: req.body.comments,
      ipAddress: req.socket.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    // console.log("Metadata for feedback update:", metadata);
    try {
      const updatedFeedback = await Feedback.updateFeedbackAsync(
        feedbackId,
        req.body,
        updatedBy,
        metadata
      );
      res.status(200).json(updatedFeedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getFeedbackHistory: async (req, res) => {
    const feedbackId = parseInt(req.params.id, 10);

    try {
      const history = await FeedbackHistory.getHistoryByFeedbackIdAsync(
        feedbackId,
        req.query
      );
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  getFeedbackHistorySummary: async (req, res) => {
    const feedbackId = parseInt(req.params.id, 10);

    try {
      const summary = await FeedbackHistory.getHistorySummaryAsync(feedbackId);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  softDeleteFeedback: async (req, res) => {
    const feedbackId = parseInt(req.params.id, 10);
    const deletedBy = req.user ? req.user.id : 1;

    try {
      await Feedback.softDeleteFeedback(feedbackId, deletedBy);
      res.status(200).json({
        success: true,
        message: "Feedback soft deleted successfully",
        data: { id: feedbackId },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /* TODO: Implement hard delete and restore feedback functionality */

  // ============ Specific Feedback Actions =========================

  // assign feedback using update function passing the assignTo and comments
  assignFeedback: async (req, res) => {
    const updatedBy = req.user ? req.user.id : 1;
    const feedbackId = parseInt(req.params.id, 10);
    const { assignedTo, comments } = req.body;

    const metadata = {
      comments,
      ipAddress: req.socket.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    try {
      await Feedback.updateFeedbackAsync(
        feedbackId,
        { assignedTo },
        updatedBy,
        metadata
      );
      res.status(200).json({
        success: true,
        message: "Feedback assigned successfully",
        data: { id: feedbackId, assignedTo, comments },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update Status
  updateFeedbackStatus: async (req, res) => {
    const updatedBy = req.user ? req.user.id : 1;
    const feedbackId = parseInt(req.params.id, 10);
    const { status, comments } = req.body;

    const metadata = {
      comments,
      ipAddress: req.socket.remoteAddress,
      userAgent: req.get("User-Agent"),
    };

    try {
      await Feedback.updateFeedbackAsync(
        feedbackId,
        { status },
        updatedBy,
        metadata
      );
      res.status(200).json({
        success: true,
        message: "Feedback status updated successfully",
        data: { id: feedbackId, status },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
