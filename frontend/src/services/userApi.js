import axios from "axios";

const API_URL = "/api/users";

const userApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export async function getUsers() {
  try {
    const response = await userApi.get("/");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data || error;
  }
}

export async function getUserById(userId) {
  try {
    const response = await userApi.get(`/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error.response?.data || error;
  }
}
