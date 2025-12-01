import { apiClient } from "./client";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: string;
    status: string;
  };
}

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  status: string;
  permissions?: string[]; // Permissions from backend
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  getMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>("/auth/me");
    return response.data;
  },
};

