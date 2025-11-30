import { useAuthStore } from "@/store"
import type { Permission } from "@/types"
import { type Role } from "@/lib/constants"

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    authenticate,
    login,
    logout,
    checkPermission,
    hasRole,
    initializeAuth,
  } = useAuthStore()

  return {
    user,
    isAuthenticated,
    isLoading,
    authenticate,
    login,
    logout,
    checkPermission: (permission: Permission) => checkPermission(permission),
    hasRole: (role: Role) => hasRole(role),
    initializeAuth,
  }
}
