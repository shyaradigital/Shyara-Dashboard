"use client"

import { cn } from "@/lib/utils"

interface AvatarCircleProps {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

export function AvatarCircle({ name, className, size = "md" }: AvatarCircleProps) {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
