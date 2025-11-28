import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.1.7:8000",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
