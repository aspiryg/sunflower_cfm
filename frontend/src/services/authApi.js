import axios from "axios";

const API_URL = "/api/auth";

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is the key for httpOnly cookies
});

// Simplified response interceptor (no token refresh needed)
authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    // For 401 errors, redirect to login (server handles token refresh)
    // if (error.response?.status === 401) {
    //   // Clear any cached user data
    //   window.location.href = "/login";
    // }
    return Promise.reject(error);
  }
);

export async function login(email, password) {
  try {
    const response = await authApi.post("/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function register(userData) {
  try {
    const response = await authApi.post("/register", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function logout() {
  try {
    const response = await authApi.post("/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await authApi.get("/profile");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function forgotPassword(email) {
  try {
    const response = await authApi.post("/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await authApi.post(`/reset-password/${token}`, {
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const response = await authApi.post("/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function verifyEmail(token) {
  try {
    const response = await authApi.get(`/verify-email/${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}

export async function resendEmailVerification(email) {
  // console.log("Resending email verification for:", email);
  try {
    const response = await authApi.post("/resend-verification", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
}
