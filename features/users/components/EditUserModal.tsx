"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { KeyRound, LogOut } from "lucide-react"
import type { User, UserStatus } from "../types/user"
import { useUsers } from "../hooks/useUsers"
import { useRoles } from "../hooks/useRoles"
import { useAuth } from "@/hooks/use-auth"

interface EditUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSave: (id: string, updates: Partial<Omit<User, "id" | "createdAt">>) => void | Promise<void>
}

export function EditUserModal({ open, onOpenChange, user, onSave }: EditUserModalProps) {
  const { users, resetPassword } = useUsers()
  const { roles } = useRoles()
  const { checkPermission } = useAuth()
  const [userId, setUserId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState<UserStatus>("active")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showForceLogoutDialog, setShowForceLogoutDialog] = useState(false)

  const canResetPassword = checkPermission("auth:reset-password")

  useEffect(() => {
    if (open && user) {
      setUserId(user.userId)
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
      setRole(user.role)
      setStatus(user.status)
      setErrors({})
    }
  }, [open, user])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Name is required and must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    } else if (user) {
      // Check email uniqueness (excluding current user)
      const existingUser = users.find(
        (u) => u.id !== user.id && u.email.toLowerCase() === email.trim().toLowerCase()
      )
      if (existingUser) {
        newErrors.email = "Email already exists"
      }
    }

    if (!role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validateForm()) {
      return
    }

    try {
      await onSave(user.id, {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        status,
      })
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook with toast notification
      // Keep modal open so user can fix errors
    }
  }

  const handleResetPassword = () => {
    if (!user) return
    resetPassword(user.id)
    setShowResetPasswordDialog(false)
    // You could add a toast notification here
  }

  const handleForceLogout = () => {
    if (!user) return
    // Dummy implementation - in real app, this would invalidate the user's session
    setShowForceLogoutDialog(false)
    // You could add a toast notification here
  }

  if (!user) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] overflow-y-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-userId">User ID</Label>
                <Input id="edit-userId" value={userId} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  User ID cannot be changed after creation
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="edit-role" className={errors.role ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.name} value={r.name}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Additional Actions</p>
                <div className="flex flex-col gap-2">
                  {canResetPassword && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetPasswordDialog(true)}
                      className="w-full justify-start"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForceLogoutDialog(true)}
                    className="w-full justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Force Logout
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the password for {user.name}? A new temporary password
              will be generated and should be shared securely with the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>Reset Password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Logout Confirmation Dialog */}
      <AlertDialog open={showForceLogoutDialog} onOpenChange={setShowForceLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force logout {user.name}? This will invalidate their current
              session and they will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceLogout}>Force Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
