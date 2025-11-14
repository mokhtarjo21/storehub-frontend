const API_BASE_URL = "http://192.168.1.7:8000/api";

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.detail || "API request failed"
    );
  }
  return response.json();
};

// Token refresh function
export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access);
  return data.access;
};

// API wrapper with automatic token refresh
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Try to refresh token
      try {
        await refreshToken();
        // Retry the original request
        return await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...options.headers,
          },
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired");
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

// OTP verification functions
export const verifyOTP = async (email: string, otpCode: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      otp_code: otpCode,
    }),
  });

  return handleApiResponse(response);
};

export const resendOTP = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/resend-otp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return handleApiResponse(response);
};

// User profile functions
export const getCurrentUser = async () => {
  const response = await apiRequest("/auth/me/");
  return handleApiResponse(response);
};

export const updateUserProfile = async (profileData: any) => {
  const response = await apiRequest("/auth/profile/", {
    method: "PATCH",
    body: JSON.stringify(profileData),
  });
  return handleApiResponse(response);
};

export const updateUserInfo = async (userData: any) => {
  const response = await apiRequest("/auth/update/", {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
  return handleApiResponse(response);
};

export const changePassword = async (passwordData: any) => {
  const response = await apiRequest("/auth/change-password/", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
  return handleApiResponse(response);
};

export default {
  verifyOTP,
  resendOTP,
  getCurrentUser,
  updateUserProfile,
  updateUserInfo,
  changePassword,
  apiRequest,
};
