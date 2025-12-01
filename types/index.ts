import { Role } from "@/lib/constants"

export interface User {
  id: string
  userId: string
  name: string
  email: string
  role: Role
  avatar?: string
  permissions?: string[] // Backend permissions array
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export type Permission = string
