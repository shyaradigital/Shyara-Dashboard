import type { Expense, ExpenseFilters, ExpenseSummary, ExpenseCategory } from "../types/expense"

const STORAGE_KEY = "shyara_expense_data"

// Initialize data from storage, return empty array if storage is empty
const getInitialData = (): Expense[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Validate that parsed data is an array
      if (Array.isArray(parsed)) {
        return parsed
      }
      // If corrupted, reset to empty array
      localStorage.removeItem(STORAGE_KEY)
      return []
    } catch (error) {
      // If JSON is corrupted, remove it and return empty array
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
  }

  // Return empty array if storage is empty
  return []
}

const saveData = (data: Expense[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const expenseService = {
  getAll: (filters?: ExpenseFilters): Expense[] => {
    const data = getInitialData()

    if (!filters) return data

    return data.filter((expense) => {
      if (filters.category && expense.category !== filters.category) return false
      if (filters.purpose && !expense.purpose.toLowerCase().includes(filters.purpose.toLowerCase()))
        return false
      if (filters.startDate && expense.date < filters.startDate) return false
      if (filters.endDate && expense.date > filters.endDate) return false
      return true
    })
  },

  getById: (id: string): Expense | null => {
    const data = getInitialData()
    return data.find((expense) => expense.id === id) || null
  },

  create: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">): Expense => {
    const data = getInitialData()
    // Generate unique ID using timestamp + random to avoid collisions
    const newExpense: Expense = {
      ...expense,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.push(newExpense)
    saveData(data)
    return newExpense
  },

  update: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>): Expense | null => {
    const data = getInitialData()
    const index = data.findIndex((expense) => expense.id === id)

    if (index === -1) return null

    data[index] = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    saveData(data)
    return data[index]
  },

  delete: (id: string): boolean => {
    const data = getInitialData()
    const index = data.findIndex((expense) => expense.id === id)

    if (index === -1) return false

    data.splice(index, 1)
    saveData(data)
    return true
  },

  getSummary: (filters?: ExpenseFilters): ExpenseSummary => {
    const data = expenseService.getAll(filters)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(currentMonth / 3)

    const monthly = data
      .filter((expense) => {
        const date = new Date(expense.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + (isNaN(expense.amount) ? 0 : expense.amount), 0)

    const quarterly = data
      .filter((expense) => {
        const date = new Date(expense.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return (
          Math.floor(date.getMonth() / 3) === currentQuarter && date.getFullYear() === currentYear
        )
      })
      .reduce((sum, expense) => sum + (isNaN(expense.amount) ? 0 : expense.amount), 0)

    const yearly = data
      .filter((expense) => {
        const date = new Date(expense.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return date.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + (isNaN(expense.amount) ? 0 : expense.amount), 0)

    const total = data.reduce(
      (sum, expense) => sum + (isNaN(expense.amount) ? 0 : expense.amount),
      0
    )

    const byCategory: Record<ExpenseCategory, number> = {
      Salaries: 0,
      Subscriptions: 0,
      Rent: 0,
      Software: 0,
      Hardware: 0,
      Travel: 0,
      Utilities: 0,
      Misc: 0,
    }

    data.forEach((expense) => {
      const amount = isNaN(expense.amount) ? 0 : expense.amount
      byCategory[expense.category] = (byCategory[expense.category] || 0) + amount
    })

    return {
      total,
      monthly,
      quarterly,
      yearly,
      byCategory,
    }
  },
}
