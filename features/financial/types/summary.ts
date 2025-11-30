import type { IncomeSummary } from "./income"
import type { ExpenseSummary } from "./expense"

export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
  incomeSummary: IncomeSummary
  expenseSummary: ExpenseSummary
}

export interface RevenueAnalytics {
  monthly: Array<{
    month: string
    income: number
    expenses: number
    revenue: number
  }>
  quarterly: Array<{
    quarter: string
    income: number
    expenses: number
    revenue: number
  }>
  yearly: Array<{
    year: string
    income: number
    expenses: number
    revenue: number
  }>
  growth: {
    monthly: number // percentage
    quarterly: number
    yearly: number
  }
}

export interface BalanceSheet {
  assets: number // Total Income
  liabilities: number // Total Expenses
  equity: number // Income - Expenses
}
