import type { User, UserFormData, UserFilters } from "../types/user"
import { usersApi, type UserResponse } from "@/lib/api/users"

// Convert API response to app User type
const mapUserResponse = (response: UserResponse): User => {
  return {
    id: response.id,
    userId: response.userId,
    email: response.email,
    name: response.name,
    phone: response.phone,
    password: "", // Password is not returned from API
    role: response.role,
    status: response.status as "active" | "disabled",
    createdAt: response.createdAt,
    lastLogin: response.lastLogin || null,
  }
}

export const userService = {
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    try {
      const users = await usersApi.getAll(filters)
      return users.map(mapUserResponse)
    } catch (error) {
      console.error("Error fetching users:", error)
      throw error
    }
  },

  getUserById: async (id: string): Promise<User | null> => {
    try {
      const user = await usersApi.getById(id)
      return mapUserResponse(user)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error("Error fetching user:", error)
      throw error
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    if (!email) return null
    try {
      const users = await usersApi.getAll({ searchTerm: email })
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        ? mapUserResponse(users.find((u) => u.email.toLowerCase() === email.toLowerCase())!)
        : null
    } catch (error) {
      console.error("Error fetching user by email:", error)
      return null
    }
  },

  getUserByUserId: async (userId: string): Promise<User | null> => {
    if (!userId) return null
    try {
      const users = await usersApi.getAll({ searchTerm: userId })
      return users.find((u) => u.userId.toLowerCase() === userId.toLowerCase())
        ? mapUserResponse(users.find((u) => u.userId.toLowerCase() === userId.toLowerCase())!)
        : null
    } catch (error) {
      console.error("Error fetching user by userId:", error)
      return null
    }
  },

  getUserByIdentifier: async (identifier: string): Promise<User | null> => {
    if (!identifier) return null
    try {
      const users = await usersApi.getAll({ searchTerm: identifier })
      const lowerIdentifier = identifier.trim().toLowerCase()
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === lowerIdentifier ||
          u.userId.toLowerCase() === lowerIdentifier
      )
      return user ? mapUserResponse(user) : null
    } catch (error) {
      console.error("Error fetching user by identifier:", error)
      return null
    }
  },

  addUser: async (userData: UserFormData): Promise<User> => {
    try {
      const user = await usersApi.create(userData)
      return mapUserResponse(user)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create user"
      throw new Error(errorMessage)
    }
  },

  updateUser: async (
    id: string,
    updates: Partial<Omit<User, "id" | "createdAt">>
  ): Promise<User | null> => {
    try {
      // Remove password from updates if it's empty (API handles password updates separately)
      const { password, ...updateData } = updates
      const updatePayload: Partial<UserFormData> = { ...updateData }
      if (password && password.length > 0) {
        updatePayload.password = password
      }

      const user = await usersApi.update(id, updatePayload)
      return mapUserResponse(user)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update user"
      throw new Error(errorMessage)
    }
  },

  deleteUser: async (id: string): Promise<boolean> => {
    try {
      await usersApi.delete(id)
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      console.error("Error deleting user:", error)
      throw error
    }
  },

  disableUser: async (id: string): Promise<User | null> => {
    try {
      const user = await usersApi.disable(id)
      return mapUserResponse(user)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to disable user"
      throw new Error(errorMessage)
    }
  },

  enableUser: async (id: string): Promise<User | null> => {
    try {
      const user = await usersApi.enable(id)
      return mapUserResponse(user)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to enable user"
      throw new Error(errorMessage)
    }
  },

  resetPassword: async (id: string): Promise<boolean> => {
    // This would need a dedicated API endpoint
    // For now, return true as placeholder
    return true
  },
}
