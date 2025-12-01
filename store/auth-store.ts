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

          // Debug: Log login attempt
          // NOTE: No rate limiting or device restrictions - users can login unlimited times
          // from any device (within the same browser, as localStorage is browser-specific)
          console.log("🔐 AUTH DEBUG - Login attempt")
          console.log("  Identifier:", identifier, "| Length:", identifier.length)
          console.log("  Password input:", password, "| Length:", password.length)
          console.log(
            "  Password input (char codes):",
            [...password].map((c) => c.charCodeAt(0))
          )

          // Find user by email or userId
          // Trim and normalize the identifier (but NOT the password)
          const normalizedIdentifier = identifier.trim()
          const user = userService.getUserByIdentifier(normalizedIdentifier)

          if (!user) {
            console.log("  ❌ No user found with identifier:", identifier)
            return { success: false, error: "Invalid email or user ID" }
          }

          // Debug: Log found user details
          console.log("  ✅ Found user:", {
            id: user.id,
            userId: user.userId,
            email: user.email,
            name: user.name,
            status: user.status,
          })
          console.log("  Stored password:", user.password, "| Length:", user.password?.length)
          console.log(
            "  Stored password (char codes):",
            user.password ? [...user.password].map((c) => c.charCodeAt(0)) : "N/A"
          )

          // Check if user is active
          if (user.status !== "active") {
            console.log("  ❌ Account is disabled")
            return { success: false, error: "Account is disabled" }
          }

          // Check password - EXACT string comparison (no trimming, no normalization)
          // Password must match exactly as stored
          const passwordMatch = user.password === password
          console.log("  Password match check:")
          console.log("    Input password === Stored password:", passwordMatch)
          console.log("    Input password type:", typeof password)
          console.log("    Stored password type:", typeof user.password)
          console.log("    Input password length:", password.length)
          console.log("    Stored password length:", user.password?.length)

          if (!user.password || !passwordMatch) {
            console.log("  ❌ Password mismatch - Authentication failed")
            return { success: false, error: "Invalid password" }
          }

          console.log("  ✅ Password match - Authentication successful")

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
        // Clear only auth storage (user session), NOT user data storage
        // This allows users to login again immediately without losing their account
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
