import { apiClient } from "./client";

export interface RoleResponse {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleRequest {
  name: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  permissions?: string[];
}

export const rolesApi = {
  getAll: async (): Promise<RoleResponse[]> => {
    const response = await apiClient.get<RoleResponse[]>("/roles");
    return response.data;
  },

  getById: async (id: string): Promise<RoleResponse> => {
    const response = await apiClient.get<RoleResponse>(`/roles/${id}`);
    return response.data;
  },

  create: async (roleData: CreateRoleRequest): Promise<RoleResponse> => {
    const response = await apiClient.post<RoleResponse>("/roles", roleData);
    return response.data;
  },

  update: async (id: string, roleData: UpdateRoleRequest): Promise<RoleResponse> => {
    const response = await apiClient.patch<RoleResponse>(`/roles/${id}`, roleData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/roles/${id}`);
  },
};

