export type UserStatus = "active" | "disabled"

export interface User {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  password: string // Hashed in production, plain for demo
  role: string
  status: UserStatus
  createdAt: string
  lastLogin: string | null
}

export interface UserFilters {
  searchTerm?: string
  roleFilter?: string
  statusFilter?: UserStatus
}

export interface UserFormData {
  userId: string
  name: string
  email: string
  phone?: string
  password?: string
  role: string
  status: UserStatus
}
