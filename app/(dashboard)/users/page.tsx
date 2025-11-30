"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useUsers } from "@/features/users/hooks/useUsers"
import { useFilteredUsers } from "@/features/users/hooks/useFilteredUsers"
import { useRoles } from "@/features/users/hooks/useRoles"
import { UserTable } from "@/features/users/components/UserTable"
import { UserRowCard } from "@/features/users/components/UserRowCard"
import { AddUserModal } from "@/features/users/components/AddUserModal"
import { EditUserModal } from "@/features/users/components/EditUserModal"
import { RoleManager } from "@/features/users/components/RoleManager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Settings, Search } from "lucide-react"
import type { User, UserFilters, UserStatus } from "@/features/users/types/user"

export default function UsersPage() {
  const { checkPermission } = useAuth()
  const { users, isLoading, addUser, updateUser, deleteUser, enableUser, disableUser } = useUsers()
  const { roles } = useRoles()

  const [filters, setFilters] = useState<UserFilters>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [addUserModalOpen, setAddUserModalOpen] = useState(false)
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [roleManagerOpen, setRoleManagerOpen] = useState(false)

  // Check permissions
  const canView = checkPermission("users:view")
  const canEdit = checkPermission("users:edit")
  const canManageRoles = checkPermission("roles:manage")

  // Update filters when search/role/status change
  useEffect(() => {
    setFilters({
      searchTerm: searchTerm || undefined,
      roleFilter: roleFilter !== "all" ? roleFilter : undefined,
      statusFilter: statusFilter !== "all" ? (statusFilter as UserStatus) : undefined,
    })
  }, [searchTerm, roleFilter, statusFilter])

  // Get filtered users
  const filteredUsers = useFilteredUsers(users, filters)

  const handleAddUser = (userData: Parameters<typeof addUser>[0]) => {
    try {
      addUser(userData)
      setAddUserModalOpen(false)
    } catch (error: any) {
      // Error handling is done in the modal
      console.error("Error adding user:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditUserModalOpen(true)
  }

  const handleUpdateUser = (id: string, updates: Partial<Omit<User, "id" | "createdAt">>) => {
    try {
      updateUser(id, updates)
      setEditUserModalOpen(false)
      setEditingUser(null)
    } catch (error: any) {
      // Error handling is done in the modal
      console.error("Error updating user:", error)
    }
  }

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(id)
    }
  }

  // Update filters when inputs change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setFilters({
      ...filters,
      searchTerm: value || undefined,
    })
  }

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value)
    setFilters({
      ...filters,
      roleFilter: value !== "all" ? value : undefined,
    })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setFilters({
      ...filters,
      statusFilter: value !== "all" ? (value as UserStatus) : undefined,
    })
  }

  if (!canView) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view users. Please contact your administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage all users and roles in your system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button onClick={() => setAddUserModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
          {canManageRoles && (
            <Button variant="outline" onClick={() => setRoleManagerOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Roles
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter users by name, email, role, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or user ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="role-filter" className="text-sm font-medium">
                Role
              </label>
              <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                <SelectTrigger id="role-filter">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Display */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user(s) found
            {filters.searchTerm || filters.roleFilter || filters.statusFilter ? " (filtered)" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <UserTable
                  users={filteredUsers}
                  isLoading={isLoading}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  onEnable={enableUser}
                  onDisable={disableUser}
                  canEdit={canEdit}
                />
              </div>

              {/* Mobile Card View */}
              <div className="space-y-4 md:hidden">
                {filteredUsers.map((user) => (
                  <UserRowCard
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onEnable={enableUser}
                    onDisable={disableUser}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {canEdit && (
        <>
          <AddUserModal
            open={addUserModalOpen}
            onOpenChange={setAddUserModalOpen}
            onSave={handleAddUser}
          />
          <EditUserModal
            open={editUserModalOpen}
            onOpenChange={(open) => {
              setEditUserModalOpen(open)
              if (!open) setEditingUser(null)
            }}
            user={editingUser}
            onSave={handleUpdateUser}
          />
        </>
      )}

      {canManageRoles && <RoleManager open={roleManagerOpen} onOpenChange={setRoleManagerOpen} />}
    </div>
  )
}
