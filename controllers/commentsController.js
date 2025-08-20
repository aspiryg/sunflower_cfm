import { FeedbackComments } from "../models/FeedbackComments.js";

export const commentsController = {
  /**
   * Create a new comment
   */
  createComment: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { comment, isInternal = true } = req.body;
      const userId = req.user?.id || 1;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
        });
      }

      if (comment.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment text cannot exceed 1000 characters",
        });
      }

      const newComment = await FeedbackComments.addComment(
        feedbackId,
        userId,
        comment.trim(),
        isInternal
      );

      res.status(201).json({
        success: true,
        message: "Comment created successfully",
        data: newComment,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create comment",
        error: error.message,
      });
    }
  },

  /**
   * Get all comments for a feedback
   */
  getCommentsByFeedback: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      const { limit, offset, includeInactive } = req.query;

      const options = {
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
        includeInactive: includeInactive === "true",
      };

      const comments = await FeedbackComments.getCommentsByFeedbackId(
        feedbackId,
        options
      );

      res.status(200).json({
        success: true,
        message: "Comments retrieved successfully",
        data: comments,
        count: comments.length,
      });
    } catch (error) {
      console.error("Error retrieving comments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comments",
        error: error.message,
      });
    }
  },

  /**
   * Get a single comment by ID
   */
  getComment: async (req, res) => {
    try {
      const { commentId } = req.params;

      const comment = await FeedbackComments.getCommentById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Comment retrieved successfully",
        data: comment,
      });
    } catch (error) {
      console.error("Error retrieving comment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve comment",
        error: error.message,
      });
    }
  },

  /**
   * Update a comment
   */
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { comment } = req.body;
      const userId = req.user?.id || 1;

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Comment text is required",
        });
      }

      if (comment.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Comment text cannot exceed 1000 characters",
        });
      }

      const updatedComment = await FeedbackComments.updateComment(
        commentId,
        comment.trim(),
        userId
      );

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error updating comment:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update comment",
        error: error.message,
      });
    }
  },

  /**
   * Delete a comment (soft delete)
   */
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id || 1;

      const success = await FeedbackComments.deleteComment(commentId, userId);

      if (success) {
        res.status(200).json({
          success: true,
          message: "Comment deleted successfully",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Comment not found or already deleted",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to delete comment",
        error: error.message,
      });
    }
  },

  /**
   * Get comment count for a feedback
   */
  getCommentCount: async (req, res) => {
    try {
      const { feedbackId } = req.params;

      const count = await FeedbackComments.getCommentCount(feedbackId);

      res.status(200).json({
        success: true,
        message: "Comment count retrieved successfully",
        data: { count },
      });
    } catch (error) {
      console.error("Error getting comment count:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get comment count",
        error: error.message,
      });
    }
  },
};
