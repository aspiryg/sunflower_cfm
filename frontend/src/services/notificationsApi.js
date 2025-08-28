import axios from "axios";

const API_URL = "/api/notifications";

const notificationsApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

export const getAllNotifications = async (params = {}) => {
  try {
    const response = await notificationsApi.get("/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

export const getUserNotifications = async (params = {}) => {
  try {
    const response = await notificationsApi.get("/user", { params });
    return (
      response.data || { data: [], summary: { total: 0, unread: 0, isRead: 0 } }
    );
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

export const getNotificationById = async (id) => {
  try {
    const response = await notificationsApi.get(`/getById/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notification by ID:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  console.log("Marking notification as read:", id);
  try {
    const response = await notificationsApi.put(`/markAsRead/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markMultipleNotificationsAsRead = async (notificationIds) => {
  console.log("Marking multiple notifications as read:", notificationIds);
  try {
    const response = await notificationsApi.put("/markMultipleAsRead", {
      notificationIds,
    });
    return response.data;
  } catch (error) {
    console.error("Error marking multiple notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await notificationsApi.delete(`/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};
