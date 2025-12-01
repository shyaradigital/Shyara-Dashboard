import { apiClient } from "./client";
import type { UserFilters, UserFormData } from "@/features/users/types/user";

export interface UserResponse {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
}

export const usersApi = {
  getAll: async (filters?: UserFilters): Promise<UserResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.searchTerm) params.append("searchTerm", filters.searchTerm);
    if (filters?.roleFilter) params.append("roleFilter", filters.roleFilter);
    if (filters?.statusFilter) params.append("statusFilter", filters.statusFilter);

    const response = await apiClient.get<UserResponse[]>(
      `/users${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  create: async (userData: UserFormData): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>("/users", userData);
    return response.data;
  },

  update: async (id: string, userData: Partial<UserFormData>): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  disable: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/disable`);
    return response.data;
  },

  enable: async (id: string): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/enable`);
    return response.data;
  },
};

