"use client"

import { useState, useEffect, useCallback } from "react"
import { roleService } from "../services/roleService"
import type { Role } from "../types/role"

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRoles = useCallback(() => {
    setIsLoading(true)
    try {
      const data = roleService.getRoles()
      setRoles(data)
    } catch (error) {
      console.error("Error loading roles:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const addRole = useCallback(
    (role: Omit<Role, "name"> & { name: string }): boolean => {
      try {
        roleService.addRole(role)
        loadRoles()
        return true
      } catch (error) {
        console.error("Error adding role:", error)
        throw error
      }
    },
    [loadRoles]
  )

  const updateRole = useCallback(
    (name: string, updates: Partial<Omit<Role, "name">>): boolean => {
      try {
        const updated = roleService.updateRole(name, updates)
        if (updated) {
          loadRoles()
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating role:", error)
        throw error
      }
    },
    [loadRoles]
  )

  const deleteRole = useCallback(
    (name: string): boolean => {
      try {
        const deleted = roleService.deleteRole(name)
        if (deleted) {
          loadRoles()
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting role:", error)
        throw error
      }
    },
    [loadRoles]
  )

  return {
    roles,
    isLoading,
    addRole,
    updateRole,
    deleteRole,
    refresh: loadRoles,
  }
}
