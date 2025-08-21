import axios from "axios";

const API_URL = "/api/notifications";

const notificationsApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
});

export const getAllNotifications = async () => {
  try {
    const response = await notificationsApi.get("/");
    return response.data;
  } catch (error) {
    console.error("Error fetching all notifications:", error);
    throw error;
  }
};

export const getUserNotifications = async () => {
  try {
    const response = await notificationsApi.get(`/user`);
    return response.data.data || [];
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
  try {
    const response = await notificationsApi.put(`/markAsRead/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markMultipleNotificationsAsRead = async (ids) => {
  try {
    const response = await notificationsApi.put(`/markMultipleAsRead`, { ids });
    return response.data;
  } catch (error) {
    console.error("Error marking multiple notifications as read:", error);
    throw error;
  }
};
