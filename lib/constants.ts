export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    "dashboard:view",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:delete",
    "finances:view",
    "finances:edit",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "roles:manage",
    "auth:reset-password",
  ],
  [ROLES.MANAGER]: [
    "dashboard:view",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "finances:view",
  ],
} as const
