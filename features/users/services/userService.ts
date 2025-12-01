import type { User, UserFormData } from "../types/user"

const STORAGE_KEY = "shyara_users_data"

// Initialize data from storage, create master admin ONLY if storage key doesn't exist
const getInitialData = (): User[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)

  // If storage key doesn't exist at all, create master admin
  if (!stored) {
    const masterAdmin: User = {
      id: `admin-${Date.now()}`,
      userId: "admin.shyara",
      email: "admin@shyara.co.in",
      name: "Master Admin",
      password: "admin",
      role: "ADMIN",
      status: "active",
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }
    const users = [masterAdmin]
    saveData(users)
    if (typeof window !== "undefined") {
      console.log("[UserService] Created master admin - storage was empty")
    }
    return users
  }

  // Storage exists - try to parse it
  try {
    const parsed = JSON.parse(stored)

    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      // Invalid format - but don't reset, try to recover
      if (typeof window !== "undefined") {
        console.error("[UserService] Invalid data format in storage, but preserving existing data")
      }
      // Return empty array but don't create master admin (storage exists, so users might have been deleted intentionally)
      return []
    }

    // Filter out any invalid entries but keep valid ones
    const validUsers = parsed.filter((user: any) => {
      return (
        user &&
        typeof user === "object" &&
        user.id &&
        user.userId &&
        user.email &&
        user.name &&
        user.password &&
        user.role &&
        user.status
      )
    })

    if (typeof window !== "undefined") {
      console.log(`[UserService] Loaded ${validUsers.length} users from storage`)
    }

    // Only create master admin if we have NO valid users AND storage was just created
    // Since storage exists, we should preserve whatever is there (even if empty)
    return validUsers
  } catch (error) {
    // JSON parse error - corrupted data
    if (typeof window !== "undefined") {
      console.error("[UserService] Failed to parse user data from storage:", error)
    }
    // Don't reset - return empty array but preserve the corrupted storage
    // This prevents accidental data loss
    return []
  }
}

const saveData = (data: User[]): void => {
  if (typeof window === "undefined") return

  try {
    // Validate data before saving
    if (!Array.isArray(data)) {
      console.error("[UserService] Cannot save: data is not an array")
      return
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

    if (typeof window !== "undefined") {
      console.log(`[UserService] Saved ${data.length} users to storage`)
    }
  } catch (error) {
    console.error("[UserService] Failed to save users to storage:", error)
  }
}

export const userService = {
  getUsers: (): User[] => {
    return getInitialData()
  },

  getUserById: (id: string): User | null => {
    const data = getInitialData()
    return data.find((user) => user.id === id) || null
  },

  getUserByEmail: (email: string): User | null => {
    const data = getInitialData()
    if (!email) return null
    return data.find((user) => user.email?.toLowerCase() === email.toLowerCase()) || null
  },

  getUserByUserId: (userId: string): User | null => {
    const data = getInitialData()
    if (!userId) return null
    return data.find((user) => user.userId?.toLowerCase() === userId.toLowerCase()) || null
  },

  getUserByIdentifier: (identifier: string): User | null => {
    if (!identifier) return null

    const data = getInitialData()
    const lowerIdentifier = identifier.trim().toLowerCase()

    // Try email first, then userId
    const user = data.find((user) => {
      if (!user) return false
      const emailMatch = user.email?.toLowerCase() === lowerIdentifier
      const userIdMatch = user.userId?.toLowerCase() === lowerIdentifier
      return emailMatch || userIdMatch
    })

    return user || null
  },

  addUser: (userData: UserFormData): User => {
    const data = getInitialData()

    if (typeof window !== "undefined") {
      console.log(`[UserService] addUser called - current users count: ${data.length}`)
    }

    // Validate userId format (letters, numbers, dots, dashes)
    const userIdRegex = /^[a-zA-Z0-9.-]+$/
    if (!userIdRegex.test(userData.userId.trim())) {
      throw new Error("User ID can only contain letters, numbers, dots, and dashes")
    }

    // Check email uniqueness
    const existingUserByEmail = userService.getUserByEmail(userData.email)
    if (existingUserByEmail) {
      throw new Error("Email already exists")
    }

    // Check userId uniqueness
    const existingUserByUserId = userService.getUserByUserId(userData.userId)
    if (existingUserByUserId) {
      throw new Error("User ID already exists")
    }

    if (!userData.password || userData.password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    // Generate unique ID using timestamp + random to avoid collisions
    const newUser: User = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userData.userId.trim().toLowerCase(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || undefined,
      password: userData.password, // In production, hash this
      role: userData.role,
      status: userData.status,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }

    // Create new array with existing users + new user
    const updatedData = [...data, newUser]
    saveData(updatedData)

    if (typeof window !== "undefined") {
      console.log(`[UserService] User added successfully - new count: ${updatedData.length}`)
      console.log(`[UserService] Added user: ${newUser.userId} (${newUser.email})`)
    }

    return newUser
  },

  updateUser: (id: string, updates: Partial<Omit<User, "id" | "createdAt">>): User | null => {
    const data = getInitialData()
    const index = data.findIndex((user) => user.id === id)

    if (index === -1) {
      if (typeof window !== "undefined") {
        console.error(`[UserService] updateUser: User with id ${id} not found`)
      }
      return null
    }

    // Validate userId format if userId is being updated
    if (updates.userId) {
      const userIdRegex = /^[a-zA-Z0-9.-]+$/
      if (!userIdRegex.test(updates.userId.trim())) {
        throw new Error("User ID can only contain letters, numbers, dots, and dashes")
      }
      const existingUser = userService.getUserByUserId(updates.userId)
      if (existingUser && existingUser.id !== id) {
        throw new Error("User ID already exists")
      }
    }

    // Check email uniqueness if email is being updated
    if (updates.email) {
      const existingUser = userService.getUserByEmail(updates.email)
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email already exists")
      }
    }

    // Create new array with updated user (immutable update)
    const updatedData = [...data]
    updatedData[index] = {
      ...updatedData[index],
      ...updates,
      userId: updates.userId ? updates.userId.trim().toLowerCase() : updatedData[index].userId,
      email: updates.email ? updates.email.trim().toLowerCase() : updatedData[index].email,
      name: updates.name ? updates.name.trim() : updatedData[index].name,
      phone:
        updates.phone !== undefined ? updates.phone?.trim() || undefined : updatedData[index].phone,
      password: updates.password || updatedData[index].password, // Keep existing password if not updated
    }

    saveData(updatedData)

    if (typeof window !== "undefined") {
      console.log(`[UserService] User updated: ${updatedData[index].userId}`)
    }

    return updatedData[index]
  },

  deleteUser: (id: string): boolean => {
    const data = getInitialData()
    const index = data.findIndex((user) => user.id === id)

    if (index === -1) {
      if (typeof window !== "undefined") {
        console.error(`[UserService] deleteUser: User with id ${id} not found`)
      }
      return false
    }

    // Create new array without the deleted user (immutable update)
    const updatedData = data.filter((user) => user.id !== id)
    saveData(updatedData)

    if (typeof window !== "undefined") {
      console.log(
        `[UserService] User deleted: ${data[index].userId} - remaining users: ${updatedData.length}`
      )
    }

    return true
  },

  disableUser: (id: string): User | null => {
    return userService.updateUser(id, { status: "disabled" })
  },

  enableUser: (id: string): User | null => {
    return userService.updateUser(id, { status: "active" })
  },

  resetPassword: (id: string): boolean => {
    // Dummy implementation - in real app, this would generate a new password
    // and send it via email or set a temporary password
    const user = userService.getUserById(id)
    if (!user) return false

    // For now, just return true to indicate success
    // In a real implementation, you would:
    // 1. Generate a secure temporary password
    // 2. Hash it and store it
    // 3. Send email to user with reset link or temporary password
    return true
  },
}
