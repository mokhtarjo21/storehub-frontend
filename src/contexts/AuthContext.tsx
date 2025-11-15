import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://192.168.1.7:8000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  const errorData = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message =
      errorData.error ||
      errorData.detail ||
      errorData.message ||
      errorData.non_field_errors?.[0];
    if (!message && typeof errorData === "object") {
      const firstKey = Object.keys(errorData)[0];
      if (Array.isArray(errorData[firstKey])) {
        message = errorData[firstKey][0];
      }
    }

    throw new Error(message || "API request failed");
  }

  return errorData;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id.toString(),
          name: userData.full_name,
          email: userData.email,
          role: userData.role,
          points: userData.points || 0,
          companyName: userData.company_name,
          affiliateCode: userData.affiliate_code,
          createdAt: userData.date_joined,
        });
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    setIsInitializing(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleApiResponse(response);

      // Store tokens
      localStorage.setItem("access_token", data.tokens.access);
      localStorage.setItem("refresh_token", data.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Set user state
      const userData = data.user;
      setUser({
        id: userData.id.toString(),
        name: userData.full_name,
        email: userData.email,
        role: userData.role,
        points: userData.points || 0,
        companyName: userData.company_name,
        affiliateCode: userData.affiliate_code,
        createdAt: userData.date_joined,
      });

      toast.success("Login successful!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
    }
  };

  const register = async (
    userData: Partial<User> & {
      affiliateCompany?: string;
      affiliateJobTitle?: string;
      affiliateReason?: string;
    },
    password: string
  ): Promise<void> => {
    setIsLoading(true);

    try {
      const payload: any = {
        email: userData.email,
        full_name: userData.name,
        role: userData.role,
        company_name: userData.companyName || "",
        password: password,
        password_confirm: password,
      };

      if (userData.role === "affiliate") {
        payload.affiliate_company = userData.affiliateCompany || "";
        payload.affiliate_job_title = userData.affiliateJobTitle || "";
        payload.affiliate_reason = userData.affiliateReason || "";
      }

      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(response);
      toast.success(
        "Registration successful! Please check your email for verification code."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, isLoading, isInitializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
