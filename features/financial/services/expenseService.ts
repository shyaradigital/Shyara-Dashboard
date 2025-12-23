import type { Expense, ExpenseFilters, ExpenseSummary, ExpenseCategory } from "../types/expense"
import { expenseApi, type ExpenseResponse } from "@/lib/api/financial"

// Create empty category record
const createEmptyExpenseCategoryRecord = (): Record<ExpenseCategory, number> => ({
  Salaries: 0,
  Subscriptions: 0,
  Rent: 0,
  Software: 0,
  Hardware: 0,
  Travel: 0,
  Utilities: 0,
  Misc: 0,
});

// Convert API response to app Expense type
const mapExpenseResponse = (response: ExpenseResponse): Expense => {
  return {
    id: response.id,
    amount: response.amount,
    category: response.category as Expense["category"],
    purpose: response.purpose,
    description: response.description,
    date: response.date,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}

export const expenseService = {
  getAll: async (filters?: ExpenseFilters): Promise<Expense[]> => {
    try {
      const expenses = await expenseApi.getAll(filters)
      return expenses.map(mapExpenseResponse)
    } catch (error: any) {
      // In local dev, return empty array instead of throwing
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (error?.isLocalDevError || error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
          return [];
        }
      }
      console.error("Error fetching expenses:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<Expense | null> => {
    try {
      const expense = await expenseApi.getById(id)
      return mapExpenseResponse(expense)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error("Error fetching expense:", error)
      throw error
    }
  },

  create: async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">): Promise<Expense> => {
    try {
      const created = await expenseApi.create(expense)
      return mapExpenseResponse(created)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create expense"
      throw new Error(errorMessage)
    }
  },

  update: async (
    id: string,
    updates: Partial<Omit<Expense, "id" | "createdAt">>
  ): Promise<Expense | null> => {
    try {
      const updated = await expenseApi.update(id, updates)
      return mapExpenseResponse(updated)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update expense"
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await expenseApi.delete(id)
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      console.error("Error deleting expense:", error)
      throw error
    }
  },

  getSummary: async (filters?: ExpenseFilters): Promise<ExpenseSummary> => {
    try {
      return await expenseApi.getSummary(filters)
    } catch (error: any) {
      // In local dev, return empty summary instead of throwing
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (error?.isLocalDevError || error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
          return {
            total: 0,
            monthly: 0,
            quarterly: 0,
            yearly: 0,
            byCategory: createEmptyExpenseCategoryRecord(),
          };
        }
      }
      console.error("Error fetching expense summary:", error)
      throw error
    }
  },
}
