import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { User } from "../types";
import toast from "react-hot-toast";
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginGoole:(token:any)=>Promise<void>;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  isLoading: boolean;
  isInitializing: boolean;
  fetchorders: (
    search: any,
    status: any,
    page: any,
    start: any,
    end: any
  ) => Promise<any[]>;
  updateorders: (order_number: any, updates: any) => Promise<any[]>;
  // Add product endpoints
  cancelorders: (order_number: any, notes: any) => Promise<any[]>;
  
  getNotifications: (num: number) => Promise<any[]>;
  myorders: (page: any) => Promise<any>;
  fetchRelatedProducts: (productSlug: string) => Promise<any[]>;
  fetchProducts: (params?: {
    search?: string;
    category?: string | number;
    brand?: string | number;
    page?: number;
    page_size?: number;
  }) => Promise<any[]>;
  fechorder: (order_number: string | number) => Promise<any>;
  fetchcategories: () => Promise<any[]>;
  fetchbrands: () => Promise<any[]>;
  fetchProduct: (id: string | number) => Promise<any>;
  createProduct: (productData: any) => Promise<any>;
  updateProduct: (id: string | number, productData: any) => Promise<any>;
  deleteProduct: (id: string | number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// @ts-ignore - Vite environment variable
const API_BASE =
  (import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000") + "/api";
// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses with retry logic
const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    let errorData: any = {};
    let message = "";

    // Try to parse JSON only if content-type is JSON
    if (isJson) {
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, try to get text
        const text = await response.text().catch(() => "");
        // Check for rate limit message in text
        if (text.includes("throttled") || text.includes("rate limit")) {
          const match = text.match(/(\d+)\s*second/i);
          const seconds = match ? parseInt(match[1]) : 1;
          throw new Error(
            `Request was throttled. Expected available in ${seconds} seconds.`
          );
        }
        throw new Error("API request failed");
      }
    } else {
      // If not JSON, try to extract error from HTML/text
      const text = await response.text().catch(() => "");
      if (text.includes("throttled") || text.includes("rate limit")) {
        const match = text.match(/(\d+)\s*second/i);
        const seconds = match ? parseInt(match[1]) : 1;
        throw new Error(
          `Request was throttled. Expected available in ${seconds} seconds.`
        );
      }
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    // Extract error message from JSON response
    message =
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

    // Check for rate limit in message
    if (
      message?.toLowerCase().includes("throttled") ||
      message?.toLowerCase().includes("rate limit")
    ) {
      const match = message.match(/(\d+)\s*second/i);
      const seconds = match ? parseInt(match[1]) : 1;
      throw new Error(
        `Request was throttled. Expected available in ${seconds} seconds.`
      );
    }

    throw new Error(message || "API request failed");
  }

  // Parse successful response
  if (isJson) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  // If not JSON, return empty object
  return {};
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
          role_admin:userData.role_admin,
          role: userData.role,
          address: userData.address,
          phone: userData.phone,
          avatar: userData.avatar,
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

 
  const loginGoole = useCallback(
    async (token:any): Promise<void> => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}/auth/login/google/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
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
          phone: userData.phone,
          avatar: userData.avatar,
          role_admin: userData.role_admin,
          address: userData.address,
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
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}/auth/login/`, {
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
          phone: userData.phone,
          avatar: userData.avatar,
          role_admin: userData.role_admin,
          address: userData.address,
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
        setUser(null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );



  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout/`, {
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
  }, []);
  const register = useCallback(
    async (userData: any, password: string): Promise<void> => {
      setIsLoading(true);

      try {
        const formData = new FormData();

        formData.append("email", userData.email);
        formData.append("full_name", userData.name);
        formData.append("role", userData.role);
        formData.append("password", password);
        formData.append("phone", userData.phone);

        if (userData.role === "company_admin") {
          formData.append("company_name", userData.companyName);

          if (!userData.commercialRegister?.length) {
            throw new Error("Commercial register file is required");
          }

          if (!userData.taxCard?.length) {
            throw new Error("Tax card file is required");
          }

          formData.append(
            "commercial_register",
            userData.commercialRegister[0]
          );
          formData.append("tax_card", userData.taxCard[0]);
        }

        if (userData.role === "affiliate") {
          formData.append("affiliate_company", userData.affiliateCompany);
          formData.append("affiliate_job_title", userData.affiliateJobTitle);
          formData.append("affiliate_reason", userData.affiliateReason);
        }

        const response = await fetch(`${API_BASE}/auth/register/`, {
          method: "POST",
          body: formData,
        });

        await handleApiResponse(response);

        toast.success("Registration successful! Check your email.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Registration failed"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
    // 2. جلب منتج واحد
  
  const fetchUserInfo = useCallback(
    async (): Promise<void> => {
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}/auth/me/`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        });

        const data = await handleApiResponse(response);
        
        
        // Store tokens
        
        localStorage.setItem("user", JSON.stringify(data));
        
        // Set user state
        const userData = data;
        setUser({
          id: userData.id.toString(),
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          avatar: userData.avatar,
          role_admin: userData.role_admin,
          address: userData.address,
          role: userData.role,
          points: userData.points || 0,
          companyName: userData.company_name,
          affiliateCode: userData.affiliate_code,
          createdAt: userData.date_joined,
        });

        
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );



  const getNotifications = useCallback(async (num: number): Promise<any[]> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/auth/notifications/?page=${num}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );
      return await handleApiResponse(response);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch notifications"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  // داخل AuthProvider
  // ==================

  // 1. جلب جميع المنتجات مع retry logic
  const fetchProducts = useCallback(
    async (
      params?: {
        search?: string;
        category?: string | number;
        brand?: string | number;
        page?: number;
        page_size?: number;
      },
      retries = 2
    ): Promise<any[]> => {
      setIsLoading(true);
      try {
        const url = new URL(`${API_BASE}/products/`, window.location.origin);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
              url.searchParams.append(key, String(value));
            }
          });
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          
        });

        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch products";

        // Check if it's a rate limit error and we have retries left
        if (
          (errorMessage.includes("throttled") ||
            errorMessage.includes("rate limit")) &&
          retries > 0
        ) {
          // Extract wait time from error message
          const match = errorMessage.match(/(\d+)\s*second/i);
          const waitSeconds = match ? parseInt(match[1]) + 1 : 2;

          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, waitSeconds * 1000)
          );

          // Retry with one less retry
          return fetchProducts(params, retries - 1);
        }

        // If no retries left or not a rate limit error, show error
        if (retries === 0 || !errorMessage.includes("throttled")) {
          toast.error(errorMessage);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 2. جلب منتج واحد
  const fetchProduct = useCallback(
    async (id: string | number): Promise<any> => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/products/${id}/`, {
          method: "GET",
          headers: getAuthHeaders(),
        });
        return await handleApiResponse(response);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch product"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 3. إنشاء منتج جديد
  const createProduct = useCallback(
    async (formData: FormData): Promise<any> => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_BASE}/products/`, {
          method: "POST",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        const data = await handleApiResponse(response);
        toast.success("Product created successfully!");
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to create product"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 4. تحديث منتج
  const updateProduct = useCallback(
    async (id: string | number, formData: FormData): Promise<any> => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_BASE}/products/admin/products/${id}/update/`,
          {
            method: "PATCH",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
          }
        );

        const data = await handleApiResponse(response);
        toast.success("Product updated successfully!");
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update product"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 5. حذف منتج
  const deleteProduct = useCallback(
    async (id: string | number): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/products/admin/products/${id}/delete/`,
          {
            method: "DELETE",
            headers: getAuthHeaders(),
          }
        );
        await handleApiResponse(response);
        toast.success("Product deleted successfully!");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete product"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchcategories = useCallback(
    async (params?: { page?: number; page_size?: number; search?: string }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();

        if (params?.page) query.append("page", params.page.toString());
        if (params?.page_size)
          query.append("page_size", params.page_size.toString());
        if (params?.search) query.append("search", params.search);

        const response = await fetch(
          `${API_BASE}/products/categories/?${query.toString()}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch categories"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchbrands = useCallback(
    async (params?: { page?: number; page_size?: number; search?: string }) => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();

        if (params?.page) query.append("page", params.page.toString());
        if (params?.page_size)
          query.append("page_size", params.page_size.toString());
        if (params?.search) query.append("search", params.search);

        const response = await fetch(
          `${API_BASE}/products/brands/?${query.toString()}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch brands"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchorders = useCallback(
    async (
      search: any,
      status: any,
      page: any,
      start: any,
      end: any
    ): Promise<any[]> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/admin/orders/?search=${search}&page=${page}&status=${status}&start_date=${
            start ? start.toISOString() : ""
          }&end_date=${end ? end.toISOString() : ""}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );
        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch products"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const myorders = useCallback(async (page: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders/?page=${page}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const data = await handleApiResponse(response);
      return data;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch products"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateorders = useCallback(
    async (order_number: any, updates: any): Promise<any[]> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/admin/orders/${order_number}/update-status/`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
          }
        );
        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update order"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancelorders = useCallback(
    async (order_number: any, notes: any): Promise<any[]> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/${order_number}/cancel/`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ notes: notes }),
          }
        );
        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update order"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fechorder = useCallback(
    async (order_number: string | number): Promise<any> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/orders/admin/orders/${order_number}/`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );
        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to fetch order"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchRelatedProducts = useCallback(
    async (productSlug: string): Promise<any[]> => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/products/${productSlug}/related/`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );
        const data = await handleApiResponse(response);
        return data;
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch related products"
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      user,
     
      login,
      logout,
      fetchUserInfo,
      register,
      isLoading,
      loginGoole,
      isInitializing,
      fetchProducts,
      fetchRelatedProducts,
      fetchorders,
      updateorders,
      fechorder,
      fetchbrands,
      fetchcategories,
      fetchProduct,
      createProduct,
      updateProduct,
      myorders,
      getNotifications,
      deleteProduct,
      cancelorders,
     
    }),
    [
      user,
      isLoading,
      isInitializing,
      loginGoole,
      login,
      fetchUserInfo,
      logout,
      register,
      fetchProducts,
      fetchRelatedProducts,
      fetchorders,
      updateorders,
      fechorder,
      fetchbrands,
      fetchcategories,
      fetchProduct,
      createProduct,
      updateProduct,
      myorders,
      getNotifications,
      deleteProduct,
      cancelorders,
     
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
