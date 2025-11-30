export interface Role {
  name: string
  permissions: string[]
}

export type Permission =
  | "dashboard:view"
  | "finances:view"
  | "finances:edit"
  | "invoices:view"
  | "invoices:edit"
  | "invoices:create"
  | "invoices:delete"
  | "users:view"
  | "users:edit"
  | "users:create"
  | "users:delete"
  | "roles:manage"
  | "auth:reset-password"

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  FINANCES_VIEW: "finances:view",
  FINANCES_EDIT: "finances:edit",
  INVOICES_VIEW: "invoices:view",
  INVOICES_EDIT: "invoices:edit",
  INVOICES_CREATE: "invoices:create",
  INVOICES_DELETE: "invoices:delete",
  USERS_VIEW: "users:view",
  USERS_EDIT: "users:edit",
  USERS_CREATE: "users:create",
  USERS_DELETE: "users:delete",
  ROLES_MANAGE: "roles:manage",
  AUTH_RESET_PASSWORD: "auth:reset-password",
} as const

export const PERMISSION_GROUPS = {
  Dashboard: ["dashboard:view"],
  Finances: ["finances:view", "finances:edit"],
  Invoices: ["invoices:view", "invoices:edit", "invoices:create", "invoices:delete"],
  Users: ["users:view", "users:edit", "users:create", "users:delete"],
  Roles: ["roles:manage"],
  Authentication: ["auth:reset-password"],
} as const
