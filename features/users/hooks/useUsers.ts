"use client"

import { useState, useEffect, useCallback } from "react"
import { userService } from "../services/userService"
import type { User, UserFormData } from "../types/user"
import { toast } from "@/lib/utils/toast"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error: any) {
      console.error("Error loading users:", error)
      const errorMessage = error?.message || "Failed to load users"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const addUser = useCallback(
    async (userData: UserFormData): Promise<boolean> => {
      try {
        await userService.addUser(userData)
        await loadUsers()
        toast.success("User created successfully")
        return true
      } catch (error: any) {
        console.error("Error adding user:", error)
        const errorMessage = error?.message || "Failed to create user"
        toast.error(errorMessage)
        throw error
      }
    },
    [loadUsers]
  )

  const updateUser = useCallback(
    async (id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<boolean> => {
      try {
        const updated = await userService.updateUser(id, updates)
        if (updated) {
          await loadUsers()
          toast.success("User updated successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error updating user:", error)
        const errorMessage = error?.message || "Failed to update user"
        toast.error(errorMessage)
        throw error
      }
    },
    [loadUsers]
  )

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const deleted = await userService.deleteUser(id)
        if (deleted) {
          await loadUsers()
          toast.success("User deleted successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error deleting user:", error)
        const errorMessage = error?.message || "Failed to delete user"
        toast.error(errorMessage)
        return false
      }
    },
    [loadUsers]
  )

  const enableUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const enabled = await userService.enableUser(id)
        if (enabled) {
          await loadUsers()
          toast.success("User enabled successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error enabling user:", error)
        const errorMessage = error?.message || "Failed to enable user"
        toast.error(errorMessage)
        return false
      }
    },
    [loadUsers]
  )

  const disableUser = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const disabled = await userService.disableUser(id)
        if (disabled) {
          await loadUsers()
          toast.success("User disabled successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error disabling user:", error)
        const errorMessage = error?.message || "Failed to disable user"
        toast.error(errorMessage)
        return false
      }
    },
    [loadUsers]
  )

  const resetPassword = useCallback(async (id: string): Promise<boolean> => {
    try {
      return await userService.resetPassword(id)
    } catch (error) {
      console.error("Error resetting password:", error)
      return false
    }
  }, [])

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    enableUser,
    disableUser,
    resetPassword,
    refresh: loadUsers,
  }
}
