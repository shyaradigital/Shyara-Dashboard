import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User, Permission } from "@/types"
import { ROLES, ROLE_PERMISSIONS, type Role } from "@/lib/constants"

interface AuthStore extends AuthState {
  login: (user: User) => void
  logout: () => void
  checkPermission: (permission: Permission) => boolean
  hasRole: (role: Role) => boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkPermission: (permission: Permission) => {
        const { user } = get()
        if (!user) return false

        const userPermissions = ROLE_PERMISSIONS[user.role] || []
        return userPermissions.includes(permission as any)
      },

      hasRole: (role: Role) => {
        const { user } = get()
        return user?.role === role
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : undefined)),
    }
  )
)

