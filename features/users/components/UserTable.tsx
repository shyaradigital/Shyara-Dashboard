"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import type { User } from "../types/user"
import { AvatarCircle } from "./AvatarCircle"
import { StatusBadge } from "./StatusBadge"
import { RoleBadge } from "./RoleBadge"

interface UserTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onDelete: (id: string) => void
  onEnable: (id: string) => void
  onDisable: (id: string) => void
  canEdit?: boolean
}

type SortField = "name" | "role" | "status" | "lastLogin"
type SortDirection = "asc" | "desc"

export function UserTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onEnable,
  onDisable,
  canEdit = true,
}: UserTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField) return 0

    let aValue: string | null
    let bValue: string | null

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case "role":
        aValue = a.role
        bValue = b.role
        break
      case "status":
        aValue = a.status
        bValue = b.status
        break
      case "lastLogin":
        aValue = a.lastLogin
        bValue = b.lastLogin
        break
      default:
        return 0
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    const comparison = aValue.localeCompare(bValue)
    return sortDirection === "asc" ? comparison : -comparison
  })

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

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => handleSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  if (sortedUsers.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No users found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <SortableHeader field="name">Name</SortableHeader>
            <TableHead>User ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <SortableHeader field="role">Role</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="lastLogin">Last Login</SortableHeader>
            {canEdit && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <AvatarCircle name={user.name} size="sm" />
              </TableCell>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {user.userId || "-"}
              </TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>{user.phone || "-"}</TableCell>
              <TableCell>
                <RoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(user.lastLogin)}</TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
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
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
