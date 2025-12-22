import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE || "",
});




instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const getAdmins = (params) =>
  instance.get("api/auth/adminusers/", { params });

export const createAdmin = (data) =>
  instance.post("api/auth/adminusers/", data);

export const updateAdmin = (id, data) =>
  instance.put(`api/auth/adminusers/${id}/`, data);

export const deleteAdmin = (id) =>
  instance.delete(`api/auth/adminusers/${id}/`);
export default instance;

export const getLogs= (id) =>
  instance.get(`/api/orders/logs/logs/?order=${id}`);

export const addLogs= (data) =>
  instance.post(`/api/orders/logs/logs/`,data);

export const deleteLogs= (id) =>
  instance.delete(`/api/orders/logs/logs/${id}`);
