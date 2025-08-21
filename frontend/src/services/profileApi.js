import axios from "axios";

const API_URL = "/api/profile"; // Updated to use the correct endpoint

// Create axios instance with default config
const profileApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  try {
    const response = await profileApi.get("/me");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
}

/**
 * Update user profile
 */
export async function updateProfile(profileData) {
  try {
    const response = await profileApi.put("/me", profileData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
}

/**
 * Update contact information
 */
export async function updateContactInfo(contactData) {
  try {
    const response = await profileApi.put("/contact", contactData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update contact information"
    );
  }
}

/**
 * Update username
 */
export async function updateUsername(usernameData) {
  try {
    const response = await profileApi.put("/username", usernameData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update username"
    );
  }
}

/**
 * Update email
 */
export async function updateEmail(emailData) {
  try {
    const response = await profileApi.put("/email", emailData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update email");
  }
}

/**
 * Change password
 */
export async function changePassword(passwordData) {
  try {
    const response = await profileApi.put("/password", passwordData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to change password"
    );
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file) {
  try {
    const formData = new FormData();
    formData.append("profilePicture", file); // Must match the multer field name

    const response = await profileApi.post("/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to upload profile picture"
    );
  }
}

/**
 * Delete profile picture
 */
export async function deleteProfilePicture() {
  try {
    const response = await profileApi.delete("/picture");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete profile picture"
    );
  }
}

/**
 * Get profile completion status
 */
export async function getProfileCompletion() {
  try {
    const response = await profileApi.get("/completion");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to get profile completion"
    );
  }
}

/**
 * Enable/disable two-factor authentication
 */
export async function updateTwoFactorAuth(twoFactorData) {
  try {
    const response = await profileApi.put("/two-factor", twoFactorData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to update two-factor authentication"
    );
  }
}

/**
 * Deactivate account
 */
export async function deactivateAccount(deactivationData) {
  try {
    const response = await profileApi.post("/deactivate", deactivationData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to deactivate account"
    );
  }
}
