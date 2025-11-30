"use client"

import { useState, useEffect, useCallback } from "react"
import { userService } from "../services/userService"
import type { User, UserFormData } from "../types/user"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = useCallback(() => {
    setIsLoading(true)
    try {
      const data = userService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const addUser = useCallback(
    (userData: UserFormData): boolean => {
      try {
        userService.addUser(userData)
        loadUsers()
        return true
      } catch (error) {
        console.error("Error adding user:", error)
        throw error
      }
    },
    [loadUsers]
  )

  const updateUser = useCallback(
    (id: string, updates: Partial<Omit<User, "id" | "createdAt">>): boolean => {
      try {
        const updated = userService.updateUser(id, updates)
        if (updated) {
          loadUsers()
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating user:", error)
        throw error
      }
    },
    [loadUsers]
  )

  const deleteUser = useCallback(
    (id: string): boolean => {
      try {
        const deleted = userService.deleteUser(id)
        if (deleted) {
          loadUsers()
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting user:", error)
        return false
      }
    },
    [loadUsers]
  )

  const enableUser = useCallback(
    (id: string): boolean => {
      try {
        const enabled = userService.enableUser(id)
        if (enabled) {
          loadUsers()
          return true
        }
        return false
      } catch (error) {
        console.error("Error enabling user:", error)
        return false
      }
    },
    [loadUsers]
  )

  const disableUser = useCallback(
    (id: string): boolean => {
      try {
        const disabled = userService.disableUser(id)
        if (disabled) {
          loadUsers()
          return true
        }
        return false
      } catch (error) {
        console.error("Error disabling user:", error)
        return false
      }
    },
    [loadUsers]
  )

  const resetPassword = useCallback((id: string): boolean => {
    try {
      return userService.resetPassword(id)
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
