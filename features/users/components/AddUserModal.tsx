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
import { Eye, EyeOff, Copy, RefreshCw } from "lucide-react"
import type { UserFormData, UserStatus } from "../types/user"
import { useUsers } from "../hooks/useUsers"
import { useRoles } from "../hooks/useRoles"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (user: UserFormData) => void
}

// Generate secure random password
const generatePassword = (): string => {
  const length = 12
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const special = "!@#$%^&*"
  const allChars = uppercase + lowercase + numbers + special

  // Ensure at least one character from each category
  let password =
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export function AddUserModal({ open, onOpenChange, onSave }: AddUserModalProps) {
  const { users } = useUsers()
  const { roles } = useRoles()
  const [userId, setUserId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [status, setStatus] = useState<UserStatus>("active")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open])

  const resetForm = () => {
    setUserId("")
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setRole("")
    setStatus("active")
    setShowPassword(false)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!userId.trim()) {
      newErrors.userId = "User ID is required"
    } else {
      const userIdRegex = /^[a-zA-Z0-9.-]+$/
      if (!userIdRegex.test(userId.trim())) {
        newErrors.userId = "User ID can only contain letters, numbers, dots, and dashes"
      } else {
        // Check userId uniqueness
        const existingUser = users.find(
          (u) => u.userId.toLowerCase() === userId.trim().toLowerCase()
        )
        if (existingUser) {
          newErrors.userId = "User ID already exists"
        }
      }
    }

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Name is required and must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    } else {
      // Check email uniqueness
      const existingUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (existingUser) {
        newErrors.email = "Email already exists"
      }
    }

    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!role) {
      newErrors.role = "Role is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setPassword(newPassword)
    setShowPassword(true)
  }

  const handleCopyPassword = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password)
        // You could add a toast notification here
      } catch (err) {
        console.error("Failed to copy password:", err)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSave({
      userId: userId.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
      role,
      status,
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with their details and permissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">
                User ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userId"
                placeholder="e.g., shashwat.shukla"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value)
                  if (errors.userId) {
                    setErrors({ ...errors, userId: "" })
                  }
                }}
                className={errors.userId ? "border-destructive" : ""}
                required
              />
              {errors.userId && <p className="text-sm text-destructive">{errors.userId}</p>}
              <p className="text-xs text-muted-foreground">
                Letters, numbers, dots, and dashes only
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePassword}
                  className="shrink-0"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                {password && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className={errors.role ? "border-destructive" : ""}>
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
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
