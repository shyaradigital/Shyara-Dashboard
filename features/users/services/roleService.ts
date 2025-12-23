import { ROLES, ROLE_PERMISSIONS } from "@/lib/constants"
import type { Role } from "../types/role"
import { rolesApi, type RoleResponse } from "@/lib/api/roles"

// Get built-in roles from constants
const getBuiltInRoles = (): Role[] => {
  return Object.values(ROLES).map((roleName) => ({
    name: roleName,
    permissions: [...(ROLE_PERMISSIONS[roleName] || [])],
  }))
}

// Convert API response to app Role type
const mapRoleResponse = (response: RoleResponse): Role => {
  return {
    name: response.name,
    permissions: response.permissions,
  }
}

export const roleService = {
  getRoles: async (): Promise<Role[]> => {
    try {
      // Get custom roles from API
      const customRoles = await rolesApi.getAll()
      const builtInRoles = getBuiltInRoles()
      const builtInRoleNames = new Set(builtInRoles.map((r) => r.name))

      // Filter out built-in roles from API response (they're managed in constants)
      const customRolesFiltered = customRoles
        .filter((r) => !builtInRoleNames.has(r.name))
        .map(mapRoleResponse)

      // Merge built-in roles with custom roles
      return [...builtInRoles, ...customRolesFiltered]
    } catch (error) {
      console.error("Error fetching roles:", error)
      // Return built-in roles as fallback
      return getBuiltInRoles()
    }
  },

  getRoleByName: async (name: string): Promise<Role | null> => {
    // Check built-in roles first
    const builtInRoles = getBuiltInRoles()
    const builtInRole = builtInRoles.find((r) => r.name === name)
    if (builtInRole) {
      return builtInRole
    }

    // Check custom roles from API
    try {
      const roles = await rolesApi.getAll()
      const role = roles.find((r) => r.name === name)
      return role ? mapRoleResponse(role) : null
    } catch (error) {
      console.error("Error fetching role:", error)
      return null
    }
  },

  addRole: async (role: Omit<Role, "name"> & { name: string }): Promise<Role> => {
    // Check if trying to create a built-in role
    const builtInRoleNames = new Set(Object.values(ROLES) as unknown as string[])
    if (builtInRoleNames.has(role.name)) {
      throw new Error("Cannot create a built-in role")
    }

    try {
      const created = await rolesApi.create({
        name: role.name.trim(),
        permissions: role.permissions,
      })
      return mapRoleResponse(created)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create role"
      throw new Error(errorMessage)
    }
  },

  updateRole: async (name: string, updates: Partial<Omit<Role, "name">>): Promise<Role | null> => {
    // Prevent updating built-in roles
    const builtInRoleNames = new Set(Object.values(ROLES) as unknown as string[])
    if (builtInRoleNames.has(name)) {
      throw new Error("Cannot modify built-in roles")
    }

    try {
      // First, get the role to find its ID
      const roles = await rolesApi.getAll()
      const role = roles.find((r) => r.name === name)
      if (!role) {
        return null
      }

      const updated = await rolesApi.update(role.id, {
        permissions: updates.permissions,
      })
      return mapRoleResponse(updated)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update role"
      throw new Error(errorMessage)
    }
  },

  deleteRole: async (name: string): Promise<boolean> => {
    // Prevent deleting built-in roles
    const builtInRoleNames = new Set(Object.values(ROLES) as unknown as string[])
    if (builtInRoleNames.has(name)) {
      throw new Error("Cannot delete built-in roles")
    }

    try {
      // First, get the role to find its ID
      const roles = await rolesApi.getAll()
      const role = roles.find((r) => r.name === name)
      if (!role) {
        return false
      }

      await rolesApi.delete(role.id)
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      console.error("Error deleting role:", error)
      throw error
    }
  },
}
