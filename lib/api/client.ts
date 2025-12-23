import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Use Render backend URL in production, localhost for development
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://shyara-dashboard.onrender.com/api";

// Check if running in local development
const isLocalDevelopment = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
};

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
    // In local development, suppress CORS and network errors (backend not available)
    if (isLocalDevelopment() && (error.code === "ERR_NETWORK" || error.message === "Network Error")) {
      // Don't log CORS errors in local dev - they're expected when backend is not running
      // Return a rejected promise with a special flag so services can handle it
      return Promise.reject({ ...error, isLocalDevError: true });
    }

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

// Token management
let authToken: string | null = null;

export const setToken = (token: string, rememberMe: boolean = false) => {
  authToken = token;
  if (typeof window !== "undefined") {
    if (rememberMe) {
      // Store in localStorage for persistence across browser sessions
      localStorage.setItem("auth_token", token);
      // Also clear sessionStorage to avoid conflicts
      sessionStorage.removeItem("auth_token");
    } else {
      // Store in sessionStorage (cleared when browser closes)
      sessionStorage.setItem("auth_token", token);
      // Also clear localStorage to avoid conflicts
      localStorage.removeItem("auth_token");
    }
  }
};

export const getToken = (): string | null => {
  if (authToken) return authToken;
  // Try to restore from storage (check localStorage first, then sessionStorage)
  if (typeof window !== "undefined") {
    // Check localStorage first (for "Remember Me" users)
    const localStored = localStorage.getItem("auth_token");
    if (localStored) {
      authToken = localStored;
      return localStored;
    }
    // Fallback to sessionStorage (for session-only users)
    const sessionStored = sessionStorage.getItem("auth_token");
    if (sessionStored) {
      authToken = sessionStored;
      return sessionStored;
    }
  }
  return null;
};

export const clearToken = () => {
  authToken = null;
  if (typeof window !== "undefined") {
    // Clear both storage types to ensure complete logout
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
  }
};

