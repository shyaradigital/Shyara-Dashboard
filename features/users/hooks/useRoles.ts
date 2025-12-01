"use client"

import { useState, useEffect, useCallback } from "react"
import { roleService } from "../services/roleService"
import type { Role } from "../types/role"
import { toast } from "@/lib/utils/toast"

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRoles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await roleService.getRoles()
      setRoles(data)
    } catch (error: any) {
      console.error("Error loading roles:", error)
      const errorMessage = error?.message || "Failed to load roles"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const addRole = useCallback(
    async (role: Omit<Role, "name"> & { name: string }): Promise<boolean> => {
      try {
        await roleService.addRole(role)
        await loadRoles()
        toast.success("Role created successfully")
        return true
      } catch (error: any) {
        console.error("Error adding role:", error)
        const errorMessage = error?.message || "Failed to create role"
        toast.error(errorMessage)
        throw error
      }
    },
    [loadRoles]
  )

  const updateRole = useCallback(
    async (name: string, updates: Partial<Omit<Role, "name">>): Promise<boolean> => {
      try {
        const updated = await roleService.updateRole(name, updates)
        if (updated) {
          await loadRoles()
          toast.success("Role updated successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error updating role:", error)
        const errorMessage = error?.message || "Failed to update role"
        toast.error(errorMessage)
        throw error
      }
    },
    [loadRoles]
  )

  const deleteRole = useCallback(
    async (name: string): Promise<boolean> => {
      try {
        const deleted = await roleService.deleteRole(name)
        if (deleted) {
          await loadRoles()
          toast.success("Role deleted successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error deleting role:", error)
        const errorMessage = error?.message || "Failed to delete role"
        toast.error(errorMessage)
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
