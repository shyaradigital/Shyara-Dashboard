"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UserStatus } from "../types/user"

interface StatusBadgeProps {
  status: UserStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={status === "active" ? "default" : "secondary"}
      className={cn(
        status === "active"
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gray-500 text-white hover:bg-gray-600",
        className
      )}
    >
      {status === "active" ? "Active" : "Disabled"}
    </Badge>
  )
}
