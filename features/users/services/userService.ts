import type { User, UserFormData } from "../types/user"

const STORAGE_KEY = "shyara_users_data"

// Track if master admin has been initialized to prevent multiple initializations
let masterAdminInitialized = false

// Initialize data from storage, create master admin ONLY if storage key doesn't exist
const getInitialData = (): User[] => {
  if (typeof window === "undefined") return []

  // Log storage state for debugging
  if (typeof window !== "undefined") {
    const storageSize = localStorage.getItem(STORAGE_KEY)?.length || 0
    console.log(`📦 [UserService] getInitialData() - Storage check:`)
    console.log(`  Storage key: ${STORAGE_KEY}`)
    console.log(`  Storage exists: ${localStorage.getItem(STORAGE_KEY) !== null}`)
    console.log(`  Storage size: ${storageSize} bytes`)
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  // If storage key doesn't exist at all, create master admin
  // But only if we haven't already initialized it in this session
  if (!stored && !masterAdminInitialized) {
    if (typeof window !== "undefined") {
      console.warn("⚠️ [UserService] Storage is empty - creating master admin (first time only)")
    }

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
    masterAdminInitialized = true

    if (typeof window !== "undefined") {
      console.log("✅ [UserService] Created master admin - storage was empty")
      // Verify it was saved
      const verify = localStorage.getItem(STORAGE_KEY)
      if (verify) {
        console.log(`  ✅ Verified: Master admin saved successfully (${verify.length} bytes)`)
      } else {
        console.error("  ❌ ERROR: Master admin was NOT saved to storage!")
      }
    }
    return users
  }

  // If storage is empty but we already initialized, return empty array
  // This prevents overwriting existing data
  if (!stored && masterAdminInitialized) {
    if (typeof window !== "undefined") {
      console.warn(
        "⚠️ [UserService] Storage is empty but master admin already initialized - returning empty array to prevent data loss"
      )
    }
    return []
  }

  // Storage exists - try to parse it
  // At this point, stored is guaranteed to be non-null due to earlier checks
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)

    // Validate that parsed data is an array
    if (!Array.isArray(parsed)) {
      // Invalid format - try to recover
      if (typeof window !== "undefined") {
        console.error("❌ [UserService] Invalid data format in storage (not an array)")
        console.error("  Stored data type:", typeof parsed)
        console.error("  Attempting to preserve data...")
      }

      // Try to extract users if it's an object with a users array
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.users)) {
        if (typeof window !== "undefined") {
          console.log("  ✅ Found users array in object structure - recovering...")
        }
        return validateAndFilterUsers(parsed.users)
      }

      // Return empty array but don't create master admin (storage exists, so users might have been deleted intentionally)
      return []
    }

    // Validate and filter users
    const validUsers = validateAndFilterUsers(parsed)

    if (typeof window !== "undefined") {
      console.log(
        `✅ [UserService] Loaded ${validUsers.length} users from storage (${parsed.length} total, ${parsed.length - validUsers.length} invalid filtered out)`
      )
      // Debug: Verify passwords are preserved after JSON parse
      validUsers.forEach((user, index) => {
        console.log(`  User ${index + 1} loaded:`, {
          id: user.id,
          userId: user.userId,
          email: user.email,
          password: user.password,
          passwordLength: user.password?.length,
          passwordType: typeof user.password,
        })
      })

      // Warn if some users were filtered out
      if (parsed.length > validUsers.length) {
        console.warn(`  ⚠️ ${parsed.length - validUsers.length} invalid user(s) were filtered out`)
      }
    }

    // If we have valid users, ensure they're saved back (in case some were filtered)
    if (validUsers.length !== parsed.length) {
      if (typeof window !== "undefined") {
        console.log("  🔄 Saving cleaned user data back to storage...")
      }
      saveData(validUsers)
    }

    // Passwords are preserved exactly as stored (JSON.parse doesn't modify strings)
    return validUsers
  } catch (error: any) {
    // JSON parse error - corrupted data
    if (typeof window !== "undefined") {
      console.error("❌ [UserService] Failed to parse user data from storage:", error)
      console.error("  Error message:", error.message)
      console.error("  Storage content (first 200 chars):", stored?.substring(0, 200))

      // Try to recover by backing up corrupted data
      try {
        const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`
        localStorage.setItem(backupKey, stored)
        console.log(`  💾 Backed up corrupted data to: ${backupKey}`)
      } catch (backupError) {
        console.error("  ❌ Failed to backup corrupted data:", backupError)
      }
    }

    // Don't reset - return empty array but preserve the corrupted storage
    // This prevents accidental data loss - user can manually fix if needed
    return []
  }
}

// Helper function to validate and filter users
const validateAndFilterUsers = (users: any[]): User[] => {
  if (!Array.isArray(users)) {
    return []
  }

  return users.filter((user: any) => {
    const isValid =
      user &&
      typeof user === "object" &&
      typeof user.id === "string" &&
      typeof user.userId === "string" &&
      typeof user.email === "string" &&
      typeof user.name === "string" &&
      typeof user.password === "string" &&
      typeof user.role === "string" &&
      typeof user.status === "string" &&
      user.id.length > 0 &&
      user.userId.length > 0 &&
      user.email.length > 0 &&
      user.name.length > 0 &&
      user.password.length > 0 &&
      user.role.length > 0 &&
      (user.status === "active" || user.status === "disabled")

    if (!isValid && typeof window !== "undefined") {
      console.warn("  ⚠️ Invalid user filtered out:", {
        hasId: !!user?.id,
        hasUserId: !!user?.userId,
        hasEmail: !!user?.email,
        hasName: !!user?.name,
        hasPassword: !!user?.password,
        hasRole: !!user?.role,
        hasStatus: !!user?.status,
      })
    }

    return isValid
  }) as User[]
}

const saveData = (data: User[]): void => {
  if (typeof window === "undefined") return

  try {
    // Validate data before saving
    if (!Array.isArray(data)) {
      console.error("❌ [UserService] Cannot save: data is not an array")
      return
    }

    // Log before save
    if (typeof window !== "undefined") {
      const beforeSave = localStorage.getItem(STORAGE_KEY)
      const beforeCount = beforeSave ? JSON.parse(beforeSave).length : 0
      console.log(`💾 [UserService] saveData() - Saving ${data.length} users (was ${beforeCount})`)
    }

    // Stringify with error handling
    const jsonString = JSON.stringify(data)

    // Check storage quota before saving
    try {
      localStorage.setItem(STORAGE_KEY, jsonString)

      // Verify save was successful
      const verify = localStorage.getItem(STORAGE_KEY)
      if (!verify || verify !== jsonString) {
        console.error(
          "❌ [UserService] Save verification failed - data may not have been saved correctly"
        )
        return
      }

      if (typeof window !== "undefined") {
        console.log(
          `✅ [UserService] Saved ${data.length} users to storage (${jsonString.length} bytes)`
        )
        console.log(`  Users: ${data.map((u) => u.userId).join(", ")}`)

        // Log storage quota usage
        if (navigator.storage && navigator.storage.estimate) {
          navigator.storage
            .estimate()
            .then((estimate) => {
              const used = estimate.usage || 0
              const quota = estimate.quota || 0
              const percentUsed = ((used / quota) * 100).toFixed(2)
              console.log(
                `  Storage: ${(used / 1024 / 1024).toFixed(2)} MB / ${(quota / 1024 / 1024).toFixed(2)} MB (${percentUsed}%)`
              )
            })
            .catch(() => {
              // Storage estimate not available
            })
        }
      }
    } catch (quotaError: any) {
      // Handle quota exceeded error
      if (quotaError.name === "QuotaExceededError") {
        console.error("❌ [UserService] Storage quota exceeded - cannot save users")
        console.error("  Please clear some browser storage or use a different browser")
      } else {
        throw quotaError
      }
    }
  } catch (error: any) {
    console.error("❌ [UserService] Failed to save users to storage:", error)
    console.error("  Error details:", error.message)
  }
}

export const userService = {
  getUsers: (): User[] => {
    const users = getInitialData()
    if (typeof window !== "undefined") {
      console.log("🔍 [UserService] getUsers() - All users with passwords:")
      users.forEach((user, index) => {
        console.log(`  User ${index + 1}:`, {
          id: user.id,
          userId: user.userId,
          email: user.email,
          name: user.name,
          password: user.password,
          passwordLength: user.password?.length,
          passwordCharCodes: user.password ? [...user.password].map((c) => c.charCodeAt(0)) : "N/A",
        })
      })
    }
    return users
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

    if (typeof window !== "undefined") {
      console.log("🔍 [UserService] getUserByIdentifier() called")
      console.log("  Input identifier:", identifier, "| Length:", identifier.length)
      console.log("  Normalized identifier:", lowerIdentifier)
    }

    // Try email first, then userId
    const user = data.find((user) => {
      if (!user) return false
      const emailMatch = user.email?.toLowerCase() === lowerIdentifier
      const userIdMatch = user.userId?.toLowerCase() === lowerIdentifier
      return emailMatch || userIdMatch
    })

    if (typeof window !== "undefined") {
      if (user) {
        console.log("  ✅ Found user:", {
          id: user.id,
          userId: user.userId,
          email: user.email,
          name: user.name,
          password: user.password,
          passwordLength: user.password?.length,
          passwordCharCodes: user.password ? [...user.password].map((c) => c.charCodeAt(0)) : "N/A",
        })
      } else {
        console.log("  ❌ No user found with identifier:", identifier)
        console.log("  🔍 Available users in storage:")
        data.forEach((u, idx) => {
          console.log(`    ${idx + 1}. userId: "${u.userId}", email: "${u.email}"`)
        })
        if (data.length === 0) {
          console.log("    ⚠️ No users found in storage - storage may have been cleared")
        }
      }
    }

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

    // Debug: Log input password details
    if (typeof window !== "undefined") {
      console.log("🔐 [UserService] addUser() - Password input details:")
      console.log("  Input password:", userData.password)
      console.log("  Password length:", userData.password.length)
      console.log(
        "  Password char codes:",
        [...userData.password].map((c) => c.charCodeAt(0))
      )
      console.log("  Password type:", typeof userData.password)
    }

    // Generate unique ID using timestamp + random to avoid collisions
    const newUser: User = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: userData.userId.trim().toLowerCase(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || undefined,
      password: userData.password, // Store exactly as provided - no trimming, no encoding
      role: userData.role,
      status: userData.status,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }

    // Debug: Log stored user object
    if (typeof window !== "undefined") {
      console.log("💾 [UserService] addUser() - Stored user object:")
      console.log("  Full user object:", JSON.parse(JSON.stringify(newUser)))
      console.log("  Stored password:", newUser.password)
      console.log("  Stored password length:", newUser.password.length)
      console.log(
        "  Stored password char codes:",
        [...newUser.password].map((c) => c.charCodeAt(0))
      )
      console.log(
        "  Password match check (input === stored):",
        userData.password === newUser.password
      )
    }

    // Create new array with existing users + new user
    const updatedData = [...data, newUser]
    saveData(updatedData)

    // Verify password after save by reading back
    if (typeof window !== "undefined") {
      // Use setTimeout to allow storage to settle before verification
      setTimeout(() => {
        const savedUsers = getInitialData()
        const savedUser = savedUsers.find((u) => u.id === newUser.id)

        console.log("✅ [UserService] User added successfully - new count:", updatedData.length)
        console.log("  Added user:", newUser.userId, "(", newUser.email, ")")

        if (savedUser) {
          console.log("  ✅ Verification - User found in storage after save")
          console.log("  🔍 Verification - Password after save/load:")
          console.log("    Password:", savedUser.password)
          console.log("    Password length:", savedUser.password?.length)
          console.log(
            "    Password char codes:",
            savedUser.password ? [...savedUser.password].map((c) => c.charCodeAt(0)) : "N/A"
          )
          console.log("    Original === Saved:", userData.password === savedUser.password)
        } else {
          console.error("  ❌ ERROR: User was NOT found in storage after save!")
          console.error("  This indicates a storage persistence issue")
          console.error("  Total users in storage:", savedUsers.length)
          console.error("  Expected user ID:", newUser.id)
        }
      }, 50) // Small delay to ensure storage write completes
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

    // Handle password update: only update if password is explicitly provided and not empty
    // This ensures we don't accidentally clear passwords
    const passwordUpdate =
      updates.password !== undefined && updates.password !== null && updates.password !== ""
        ? updates.password // Store exactly as provided - no trimming
        : updatedData[index].password // Keep existing password if not provided

    updatedData[index] = {
      ...updatedData[index],
      ...updates,
      userId: updates.userId ? updates.userId.trim().toLowerCase() : updatedData[index].userId,
      email: updates.email ? updates.email.trim().toLowerCase() : updatedData[index].email,
      name: updates.name ? updates.name.trim() : updatedData[index].name,
      phone:
        updates.phone !== undefined ? updates.phone?.trim() || undefined : updatedData[index].phone,
      password: passwordUpdate, // Store exactly as provided, or keep existing
    }

    // Debug: Log password update if password was changed
    if (
      typeof window !== "undefined" &&
      updates.password !== undefined &&
      updates.password !== null &&
      updates.password !== ""
    ) {
      console.log("🔐 [UserService] updateUser() - Password update:")
      console.log("  New password:", updates.password)
      console.log("  New password length:", updates.password.length)
      console.log(
        "  New password char codes:",
        [...updates.password].map((c) => c.charCodeAt(0))
      )
      console.log("  Stored password:", updatedData[index].password)
      console.log("  Password match check:", updates.password === updatedData[index].password)
    }

    saveData(updatedData)

    // Verify persistence after update
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const verifyUsers = getInitialData()
        const verifyUser = verifyUsers.find((u) => u.id === id)
        if (verifyUser) {
          console.log(
            `✅ [UserService] User updated and verified in storage: ${updatedData[index].userId}`
          )
        } else {
          console.error(`❌ [UserService] ERROR: Updated user not found in storage after save!`)
        }
      }, 50)
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
    const deletedUserId = data[index].userId
    const updatedData = data.filter((user) => user.id !== id)
    saveData(updatedData)

    // Verify persistence after delete
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const verifyUsers = getInitialData()
        const verifyDeleted = verifyUsers.find((u) => u.id === id)
        if (!verifyDeleted && verifyUsers.length === updatedData.length) {
          console.log(
            `✅ [UserService] User deleted and verified: ${deletedUserId} - remaining users: ${updatedData.length}`
          )
        } else {
          console.error(
            `❌ [UserService] ERROR: Delete verification failed! User may still exist in storage.`
          )
        }
      }, 50)
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

  // Debug method to inspect storage state
  debugStorage: () => {
    if (typeof window === "undefined") {
      console.log("❌ Cannot debug storage - not in browser environment")
      return
    }

    console.log("🔍 [UserService] Storage Debug Information:")
    console.log("  Storage key:", STORAGE_KEY)

    const stored = localStorage.getItem(STORAGE_KEY)
    console.log("  Storage exists:", stored !== null)
    console.log("  Storage size:", stored?.length || 0, "bytes")

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log("  Parsed successfully:", true)
        console.log("  Is array:", Array.isArray(parsed))
        console.log("  User count:", Array.isArray(parsed) ? parsed.length : "N/A")

        if (Array.isArray(parsed)) {
          console.log("  Users in storage:")
          parsed.forEach((user: any, idx: number) => {
            console.log(
              `    ${idx + 1}. ${user.userId || "NO USERID"} (${user.email || "NO EMAIL"})`
            )
          })
        }
      } catch (error: any) {
        console.error("  Parse error:", error.message)
        console.log("  Raw content (first 500 chars):", stored.substring(0, 500))
      }
    } else {
      console.log("  ⚠️ Storage is empty")
    }

    // Check storage quota
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage
        .estimate()
        .then((estimate) => {
          const used = estimate.usage || 0
          const quota = estimate.quota || 0
          const percentUsed = quota > 0 ? ((used / quota) * 100).toFixed(2) : "N/A"
          console.log("  Storage quota:")
          console.log(`    Used: ${(used / 1024 / 1024).toFixed(2)} MB`)
          console.log(`    Quota: ${(quota / 1024 / 1024).toFixed(2)} MB`)
          console.log(`    Percent used: ${percentUsed}%`)
        })
        .catch(() => {
          console.log("  Storage quota: Not available")
        })
    }

    // List all localStorage keys
    console.log("  All localStorage keys:")
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key)
        console.log(`    ${key}: ${value?.length || 0} bytes`)
      }
    }
  },
}
