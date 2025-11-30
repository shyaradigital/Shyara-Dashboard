"use client"

interface UserAvatarProps {
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ name, size = "md", className = "" }: UserAvatarProps) {
  const getInitials = (name: string): string => {
    if (!name) return "?"

    const parts = name.trim().split(" ")
    if (parts.length === 0) return "?"

    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || "?"
    }

    // Get first letter of first and last name
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2)
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const initials = getInitials(name)

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-purple-600 font-semibold text-white ${sizeClasses[size]} ${className}`}
    >
      {initials}
    </div>
  )
}
