import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User, Permission } from "@/types"
import { ROLES, ROLE_PERMISSIONS, type Role } from "@/lib/constants"
import { userService } from "@/features/users/services/userService"

interface AuthStore extends AuthState {
  authenticate: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>
  login: (user: User) => void
  logout: () => void
  checkPermission: (permission: Permission) => boolean
  hasRole: (role: Role) => boolean
  initializeAuth: () => void
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
      isLoading: true,

      initializeAuth: () => {
        // This will be called on app load
        // The persist middleware will restore user from localStorage
        set({ isLoading: false })
      },

      authenticate: async (identifier: string, password: string) => {
        try {
          if (!identifier || !password) {
            return { success: false, error: "Email/user ID and password are required" }
          }

          // Find user by email or userId
          // Trim and normalize the identifier
          const normalizedIdentifier = identifier.trim()
          const user = userService.getUserByIdentifier(normalizedIdentifier)

          if (!user) {
            return { success: false, error: "Invalid email or user ID" }
          }

          // Check if user is active
          if (user.status !== "active") {
            return { success: false, error: "Account is disabled" }
          }

          // Check password (in production, compare hashed passwords)
          if (!user.password || user.password !== password) {
            return { success: false, error: "Invalid password" }
          }

          // Update last login
          userService.updateUser(user.id, {
            lastLogin: new Date().toISOString(),
          })

          // Convert to auth User type (without password)
          const authUser: User = {
            id: user.id,
            userId: user.userId || user.email?.split("@")[0] || "user", // Fallback if userId missing
            name: user.name,
            email: user.email,
            role: user.role as Role,
            avatar: undefined,
          }

          // Set user in store
          set({
            user: authUser,
            isAuthenticated: true,
            isLoading: false,
          })

          return { success: true }
        } catch (error: any) {
          return { success: false, error: error.message || "Authentication failed" }
        }
      },

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
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage")
        }
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
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage
        }
        // Fallback for SSR - return a no-op storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      // Only persist user data, not isLoading
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
