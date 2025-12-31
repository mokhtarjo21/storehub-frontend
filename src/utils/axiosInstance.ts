import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE || "",
});




instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const getAdmins = (params:any) =>
  instance.get("api/auth/adminusers/", { params });

export const createAdmin = (data:any) =>
  instance.post("api/auth/adminusers/", data);

export const updateAdmin = (id:any, data:any) =>
  instance.put(`api/auth/adminusers/${id}/`, data);

export const deleteAdmin = (id:any) =>
  instance.delete(`api/auth/adminusers/${id}/`);
export default instance;

export const getLogs= (id:any) =>
  instance.get(`/api/orders/logs/logs/?order=${id}`);

export const addLogs= (data:any) =>
  instance.post(`/api/orders/logs/logs/`,data);

export const deleteLogs= (id:any) =>
  instance.delete(`/api/orders/logs/logs/${id}`);
// =====================
// Bulk Products (CSV)
// =====================

// Bulk Add Products
export const bulkAddProducts = (formData:any) =>
  
  instance.post("/api/products/bulk-add/", formData);

// Bulk Edit Products
export const bulkEditProducts = (formData:any) =>
  instance.post(
    "/api/products/bulk-edit/",
    formData,
    
  );

// Bulk Product Specifications
export const bulkProductSpecifications = (formData:any) =>
  instance.post(
    "/api/products/bulk-specifications/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
export const downloadProductsCSV = () =>
  instance.get("/api/products/download-csv/", {
    responseType: "blob",
  });
export const downloadtempfile = () =>
  instance.get("/api/products/temp-csv/", {
    responseType: "blob",
  });
// Google Login
export const loginWithGoogle = (googleToken: any) =>
  instance.post(
    "/api/auth/login/google/",
    { token: googleToken },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

