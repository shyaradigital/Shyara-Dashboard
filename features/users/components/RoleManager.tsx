"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { useRoles } from "../hooks/useRoles"
import { useUsers } from "../hooks/useUsers"
import { ROLES } from "@/lib/constants"
import { PERMISSION_GROUPS, type Permission } from "../types/role"
import type { Role } from "../types/role"

interface RoleManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RoleManager({ open, onOpenChange }: RoleManagerProps) {
  const { roles, addRole, updateRole, deleteRole } = useRoles()
  const { users } = useUsers()
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [newRoleName, setNewRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (open) {
      setEditingRole(null)
      setNewRoleName("")
      setSelectedPermissions([])
      setError("")
    }
  }, [open])

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setNewRoleName(role.name)
    setSelectedPermissions([...role.permissions])
    setError("")
  }

  const handleCancelEdit = () => {
    setEditingRole(null)
    setNewRoleName("")
    setSelectedPermissions([])
    setError("")
  }

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission]
    )
  }

  const handleSaveRole = () => {
    setError("")

    if (!newRoleName.trim()) {
      setError("Role name is required")
      return
    }

    // Check if role name already exists (excluding current editing role)
    const existingRole = roles.find(
      (r) =>
        r.name.toLowerCase() === newRoleName.trim().toLowerCase() && r.name !== editingRole?.name
    )
    if (existingRole) {
      setError("Role name already exists")
      return
    }

    try {
      if (editingRole) {
        // For editing, only update permissions (name cannot be changed)
        updateRole(editingRole.name, {
          permissions: selectedPermissions,
        })
      } else {
        addRole({
          name: newRoleName.trim(),
          permissions: selectedPermissions,
        })
      }
      handleCancelEdit()
    } catch (err: any) {
      setError(err.message || "Failed to save role")
    }
  }

  const handleDeleteRole = (roleName: string) => {
    // Check if any users are using this role
    const usersWithRole = users.filter((u) => u.role === roleName)
    if (usersWithRole.length > 0) {
      setError(`Cannot delete role. ${usersWithRole.length} user(s) are assigned to this role.`)
      setShowDeleteDialog(null)
      return
    }

    try {
      deleteRole(roleName)
      setShowDeleteDialog(null)
    } catch (err: any) {
      setError(err.message || "Failed to delete role")
      setShowDeleteDialog(null)
    }
  }

  const isBuiltInRole = (roleName: string): boolean => {
    return Object.values(ROLES).includes(roleName as any)
  }

  const allPermissions = Object.values(PERMISSION_GROUPS).flat()

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Manage Roles</SheetTitle>
            <SheetDescription>
              Create and manage roles with custom permissions. Built-in roles cannot be modified.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Add/Edit Role Form */}
            {editingRole || (!editingRole && newRoleName) ? (
              <div className="space-y-4 rounded-lg border p-4">
                <div>
                  <Label htmlFor="role-name">
                    Role Name {editingRole && isBuiltInRole(editingRole.name) && "(Built-in)"}
                  </Label>
                  <Input
                    id="role-name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter role name"
                    disabled={!!editingRole}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Permissions</Label>
                  <div className="max-h-[400px] space-y-4 overflow-y-auto">
                    {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                      <div key={groupName} className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">{groupName}</h4>
                        <div className="space-y-2 pl-2">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={`perm-${permission}`}
                                checked={selectedPermissions.includes(permission)}
                                onCheckedChange={() => handlePermissionToggle(permission)}
                                disabled={editingRole ? isBuiltInRole(editingRole.name) : false}
                              />
                              <Label
                                htmlFor={`perm-${permission}`}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveRole} size="sm" className="flex-1">
                    <Save className="mr-2 h-4 w-4" />
                    {editingRole ? "Update Role" : "Create Role"}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setNewRoleName("New Role")}
                className="w-full"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Role
              </Button>
            )}

            {/* Roles List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Existing Roles</h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {isBuiltInRole(role.name) && (
                          <span className="text-xs text-muted-foreground">(Built-in)</span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.permissions.length} permission(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                        disabled={isBuiltInRole(role.name)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteDialog(role.name)}
                        disabled={isBuiltInRole(role.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!showDeleteDialog}
        onOpenChange={(open) => !open && setShowDeleteDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role &quot;{showDeleteDialog}&quot;? This action
              cannot be undone. Make sure no users are assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteRole(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
