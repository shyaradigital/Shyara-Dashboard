import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Use Render backend URL in production, localhost for development
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shyara-dashboard.onrender.com/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Token management (stored in memory, not localStorage)
let authToken: string | null = null;

export const setToken = (token: string) => {
  authToken = token;
  // Optionally store in sessionStorage for page refresh persistence
  if (typeof window !== "undefined") {
    sessionStorage.setItem("auth_token", token);
  }
};

export const getToken = (): string | null => {
  if (authToken) return authToken;
  // Try to restore from sessionStorage
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("auth_token");
    if (stored) {
      authToken = stored;
      return stored;
    }
  }
  return null;
};

export const clearToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("auth_token");
  }
};

