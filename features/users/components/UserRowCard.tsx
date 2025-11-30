"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX, Mail, Phone } from "lucide-react"
import type { User } from "../types/user"
import { AvatarCircle } from "./AvatarCircle"
import { StatusBadge } from "./StatusBadge"
import { RoleBadge } from "./RoleBadge"

interface UserRowCardProps {
  user: User
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onEnable: (id: string) => void
  onDisable: (id: string) => void
  canEdit?: boolean
}

export function UserRowCard({
  user,
  onEdit,
  onDelete,
  onEnable,
  onDisable,
  canEdit = true,
}: UserRowCardProps) {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid date"
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <AvatarCircle name={user.name} size="md" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold">{user.name}</h3>
              <div className="mt-1 flex flex-col gap-1">
                {user.userId && (
                  <div className="font-mono text-xs text-muted-foreground">{user.userId}</div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email || "-"}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Last Login: {formatDate(user.lastLogin)}
              </div>
            </div>
          </div>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 shrink-0 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status === "active" ? (
                  <DropdownMenuItem onClick={() => onDisable(user.id)}>
                    <UserX className="mr-2 h-4 w-4" />
                    Disable
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onEnable(user.id)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Enable
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
