import { create } from "zustand"
import type { User, Permission } from "@/types"
import { type Role } from "@/lib/constants"
import { authApi } from "@/lib/api/auth"
import { setToken, clearToken } from "@/lib/api/client"
import type { AxiosError } from "axios"

interface AuthStore extends AuthState {
  authenticate: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>
  login: (user: User) => void
  logout: () => void
  checkPermission: (permission: Permission) => boolean
  hasRole: (role: Role) => boolean
  initializeAuth: () => Promise<void>
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: async () => {
    // Check if we have a token and validate it
    try {
      const user = await authApi.getMe()
      set({
        user: {
          id: user.id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          permissions: user.permissions || [], // Load permissions from backend
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      // No valid token or session expired
      clearToken()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  authenticate: async (identifier: string, password: string, rememberMe: boolean = false) => {
    try {
      if (!identifier || !password) {
        return { success: false, error: "Email/user ID and password are required" }
      }

      const response = await authApi.login({
        identifier: identifier.trim(),
        password,
      })

      // Store JWT token with rememberMe flag
      setToken(response.access_token, rememberMe)

      // Get full user data with permissions from /auth/me
      const fullUser = await authApi.getMe()

      // Convert API user to app User type
      const authUser: User = {
        id: fullUser.id,
        userId: fullUser.userId,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role as Role,
        permissions: fullUser.permissions || [], // Load permissions from backend
      }

      // Set user in store
      set({
        user: authUser,
        isAuthenticated: true,
        isLoading: false,
      })

      return { success: true }
    } catch (error: any) {
      const axiosError = error as AxiosError<{ message?: string }>
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Authentication failed"
      return { success: false, error: errorMessage }
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
    clearToken()
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  },

  checkPermission: (permission: Permission) => {
    const { user } = get()
    if (!user) return false

    // Use backend permissions if available, otherwise fallback to empty array
    const userPermissions = user.permissions || []
    return userPermissions.includes(permission)
  },

  hasRole: (role: Role) => {
    const { user } = get()
    return user?.role === role
  },
}))
