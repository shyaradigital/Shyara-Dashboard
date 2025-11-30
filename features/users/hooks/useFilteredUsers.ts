"use client"

import { useMemo } from "react"
import type { User, UserFilters } from "../types/user"

export function useFilteredUsers(users: User[], filters: UserFilters): User[] {
  return useMemo(() => {
    let filtered = [...users]

    // Search filter (name, email, userId, and phone)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.userId?.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.includes(searchLower))
      )
    }

    // Role filter
    if (filters.roleFilter) {
      filtered = filtered.filter((user) => user.role === filters.roleFilter)
    }

    // Status filter
    if (filters.statusFilter) {
      filtered = filtered.filter((user) => user.status === filters.statusFilter)
    }

    return filtered
  }, [users, filters])
}
