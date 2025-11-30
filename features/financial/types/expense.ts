export type ExpenseCategory =
  | "Salaries"
  | "Subscriptions"
  | "Rent"
  | "Software"
  | "Hardware"
  | "Travel"
  | "Utilities"
  | "Misc"

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  purpose: string
  description?: string
  date: string // ISO date string
  createdAt: string
  updatedAt: string
}

export interface ExpenseFilters {
  category?: ExpenseCategory
  purpose?: string
  startDate?: string
  endDate?: string
}

export interface ExpenseSummary {
  total: number
  monthly: number
  quarterly: number
  yearly: number
  byCategory: Record<ExpenseCategory, number>
}
