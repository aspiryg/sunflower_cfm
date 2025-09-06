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

    // Placeholder for now
    return {
      id: commentId,
      content: "Sample Comment",
      createdBy: { id: 1 }, // For ownership testing
    };
  }

  /**
   * Get case from request parameters
   */
  static async getCase(req) {
    const caseId = req.params.id || req.params.caseId;
    if (!caseId) throw new Error("Case ID not found");

    // Import Case model (add this import at the top of the file)
    const { Case } = await import("../models/Case.js");

    const caseData = await Case.findCaseByIdFlatAsync(caseId);
    if (!caseData) throw new Error("Case not found");

    return caseData;
  }

  /**
   * Get case by case number from request parameters
   */
  static async getCaseByCaseNumber(req) {
    const caseNumber = req.params.caseNumber;
    if (!caseNumber) throw new Error("Case number not found");

    // Import Case model
    const { Case } = await import("../models/Case.js");

    const caseData = await Case.findCaseByIdFlatAsync(null, caseNumber);
    if (!caseData) throw new Error("Case not found");

    return caseData;
  }

  /**
   * Get case comment from request parameters
   */
  static async getCaseComment(req) {
    const commentId = req.params.commentId || req.params.id;
    if (!commentId) throw new Error("Comment ID not found");

    // Import CaseComments model
    const { CaseComments } = await import("../models/CaseComments.js");

    const comment = await CaseComments.getCommentById(commentId);
    if (!comment) throw new Error("Case comment not found");

    return comment;
  }

  /**
   * Get case history entry from request parameters
   */
  static async getCaseHistoryEntry(req) {
    const historyId = req.params.historyId || req.params.id;
    if (!historyId) throw new Error("History ID not found");

    // Import CaseHistory model
    const { CaseHistory } = await import("../models/CaseHistory.js");

    const historyEntry = await CaseHistory.getHistoryEntryAsync(historyId);
    if (!historyEntry) throw new Error("Case history entry not found");

    return historyEntry;
  }

  /**
   * Get notification from request parameters
   */
  static async getNotification(req) {
    const notificationId = req.params.id || req.params.notificationId;
    if (!notificationId) throw new Error("Notification ID not found");

    // Import CaseNotification model
    const { CaseNotification } = await import("../models/CaseNotification.js");

    const notification = await CaseNotification.getNotificationByIdAsync(
      notificationId
    );
    if (!notification) throw new Error("Notification not found");

    return notification;
  }
}
