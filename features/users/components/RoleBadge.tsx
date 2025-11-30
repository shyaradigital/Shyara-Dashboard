"use client"

import { Badge } from "@/components/ui/badge"
import { ROLES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
  role: string
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const getRoleColor = (role: string) => {
    if (role === ROLES.ADMIN) {
      return "bg-purple-500 hover:bg-purple-600 text-white"
    }
    if (role === ROLES.MANAGER) {
      return "bg-blue-500 hover:bg-blue-600 text-white"
    }
    return "bg-gray-500 hover:bg-gray-600 text-white"
  }

  return (
    <Badge variant="default" className={cn(getRoleColor(role), className)}>
      {role}
    </Badge>
  )
}
