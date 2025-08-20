import { User } from "../models/User.js";
import { Feedback } from "../models/Feedback.js";
import { FeedbackComments } from "../models/FeedbackComments.js";

/**
 * Helper functions to get resources for authorization
 */
export class ResourceHelpers {
  /**
   * Get user from request parameters
   */
  static async getUser(req) {
    const userId = req.params.id || req.params.userId;
    if (!userId) throw new Error("User ID not found");

    const user = await User.findUserByIdAsync(userId);
    if (!user) throw new Error("User not found");

    return user;
  }

  /**
   * Get feedback from request parameters
   */
  static async getFeedback(req) {
    const feedbackId = req.params.id || req.params.feedbackId;
    if (!feedbackId) throw new Error("Feedback ID not found");

    const feedback = await Feedback.findFeedbackByIdAsync(feedbackId);
    if (!feedback) throw new Error("Feedback not found");

    return feedback;
  }

  /**
   * Get category from request parameters
   */
  static async getCategory(req) {
    const categoryId = req.params.id || req.params.categoryId;
    if (!categoryId) throw new Error("Category ID not found");

    // TODO: Implement when Category model is ready
    // const category = await Category.findByIdAsync(categoryId);
    // if (!category) throw new Error("Category not found");
    // return category;

    // Placeholder for now
    return { id: categoryId, name: "Sample Category" };
  }

  /**
   * Get comment from request parameters
   */
  static async getComment(req) {
    const commentId = req.params.id || req.params.commentId;
    if (!commentId) throw new Error("Comment ID not found");

    // TODO: Implement when Comment model is ready
    const comment = await FeedbackComments.getCommentById(commentId);
    if (!comment) throw new Error("Comment not found");
    return comment;

    // Placeholder for now
    return {
      id: commentId,
      content: "Sample Comment",
      createdBy: { id: 1 }, // For ownership testing
    };
  }
}
