import { ROLES, ROLE_PERMISSIONS } from "@/lib/constants"
import type { Role } from "../types/role"

const STORAGE_KEY = "shyara_roles_data"

// Get built-in roles from constants
const getBuiltInRoles = (): Role[] => {
  return Object.values(ROLES).map((roleName) => ({
    name: roleName,
    permissions: [...(ROLE_PERMISSIONS[roleName] || [])],
  }))
}

// Initialize with dummy data if storage is empty
const getInitialData = (): Role[] => {
  if (typeof window === "undefined") return getBuiltInRoles()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Validate that parsed data is an array
      if (Array.isArray(parsed)) {
        // Merge with built-in roles (built-in roles take precedence)
        const builtInRoles = getBuiltInRoles()
        const builtInRoleNames = new Set(builtInRoles.map((r) => r.name))
        const customRoles = parsed.filter((r: Role) => !builtInRoleNames.has(r.name))
        return [...builtInRoles, ...customRoles]
      }
      // If corrupted, reset to built-in roles
      localStorage.removeItem(STORAGE_KEY)
      return getBuiltInRoles()
    } catch (error) {
      // If JSON is corrupted, remove it and return built-in roles
      localStorage.removeItem(STORAGE_KEY)
      return getBuiltInRoles()
    }
  }

  // Initialize with built-in roles
  const initialRoles = getBuiltInRoles()
  // Store only custom roles (built-in roles are managed in constants)
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
  return initialRoles
}

const saveData = (customRoles: Role[]): void => {
  if (typeof window === "undefined") return
  // Only save custom roles, not built-in ones
  const builtInRoleNames = new Set(Object.values(ROLES))
  const rolesToSave = customRoles.filter((r) => !builtInRoleNames.has(r.name))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rolesToSave))
}

export const roleService = {
  getRoles: (): Role[] => {
    return getInitialData()
  },

  getRoleByName: (name: string): Role | null => {
    const data = getInitialData()
    return data.find((role) => role.name === name) || null
  },

  addRole: (role: Omit<Role, "name"> & { name: string }): Role => {
    const data = getInitialData()

    // Check if role already exists
    const existingRole = roleService.getRoleByName(role.name)
    if (existingRole) {
      throw new Error("Role already exists")
    }

    // Check if trying to create a built-in role
    const builtInRoleNames = new Set(Object.values(ROLES))
    if (builtInRoleNames.has(role.name)) {
      throw new Error("Cannot create a built-in role")
    }

    const newRole: Role = {
      name: role.name.trim(),
      permissions: [...role.permissions],
    }

    data.push(newRole)
    saveData(data)
    return newRole
  },

  updateRole: (name: string, updates: Partial<Omit<Role, "name">>): Role | null => {
    const data = getInitialData()
    const index = data.findIndex((role) => role.name === name)

    if (index === -1) return null

    // Prevent updating built-in roles
    const builtInRoleNames = new Set(Object.values(ROLES))
    if (builtInRoleNames.has(name)) {
      throw new Error("Cannot modify built-in roles")
    }

    data[index] = {
      ...data[index],
      ...updates,
      permissions: updates.permissions ? [...updates.permissions] : data[index].permissions,
    }
    saveData(data)
    return data[index]
  },

  deleteRole: (name: string): boolean => {
    const data = getInitialData()

    // Prevent deleting built-in roles
    const builtInRoleNames = new Set(Object.values(ROLES))
    if (builtInRoleNames.has(name)) {
      throw new Error("Cannot delete built-in roles")
    }

    const index = data.findIndex((role) => role.name === name)
    if (index === -1) return false

    // Check if any users are using this role
    // This would require importing userService, but to avoid circular dependency,
    // we'll check this in the hook/component level
    data.splice(index, 1)
    saveData(data)
    return true
  },
}
