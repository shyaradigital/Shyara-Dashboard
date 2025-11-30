import type { Income, IncomeFilters, IncomeSummary, IncomeCategory } from "../types/income"

const STORAGE_KEY = "shyara_income_data"

// Initialize data from storage, return empty array if storage is empty
const getInitialData = (): Income[] => {
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

const saveData = (data: Income[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const incomeService = {
  getAll: (filters?: IncomeFilters): Income[] => {
    const data = getInitialData()

    if (!filters) return data

    return data.filter((income) => {
      if (filters.category && income.category !== filters.category) return false
      if (filters.source && !income.source.toLowerCase().includes(filters.source.toLowerCase()))
        return false
      if (filters.startDate && income.date < filters.startDate) return false
      if (filters.endDate && income.date > filters.endDate) return false
      return true
    })
  },

  getById: (id: string): Income | null => {
    const data = getInitialData()
    return data.find((income) => income.id === id) || null
  },

  create: (income: Omit<Income, "id" | "createdAt" | "updatedAt">): Income => {
    const data = getInitialData()
    // Generate unique ID using timestamp + random to avoid collisions
    const newIncome: Income = {
      ...income,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.push(newIncome)
    saveData(data)
    return newIncome
  },

  update: (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>): Income | null => {
    const data = getInitialData()
    const index = data.findIndex((income) => income.id === id)

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
    const index = data.findIndex((income) => income.id === id)

    if (index === -1) return false

    data.splice(index, 1)
    saveData(data)
    return true
  },

  getSummary: (filters?: IncomeFilters): IncomeSummary => {
    const data = incomeService.getAll(filters)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const currentQuarter = Math.floor(currentMonth / 3)

    const monthly = data
      .filter((income) => {
        const date = new Date(income.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      })
      .reduce((sum, income) => sum + (isNaN(income.amount) ? 0 : income.amount), 0)

    const quarterly = data
      .filter((income) => {
        const date = new Date(income.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return (
          Math.floor(date.getMonth() / 3) === currentQuarter && date.getFullYear() === currentYear
        )
      })
      .reduce((sum, income) => sum + (isNaN(income.amount) ? 0 : income.amount), 0)

    const yearly = data
      .filter((income) => {
        const date = new Date(income.date)
        // Validate date is valid
        if (isNaN(date.getTime())) return false
        return date.getFullYear() === currentYear
      })
      .reduce((sum, income) => sum + (isNaN(income.amount) ? 0 : income.amount), 0)

    const total = data.reduce((sum, income) => sum + (isNaN(income.amount) ? 0 : income.amount), 0)

    const byCategory: Record<IncomeCategory, number> = {
      SMM: 0,
      Website: 0,
      Ads: 0,
      POS: 0,
      Consultation: 0,
      Freelancing: 0,
      Other: 0,
    }

    data.forEach((income) => {
      const amount = isNaN(income.amount) ? 0 : income.amount
      byCategory[income.category] = (byCategory[income.category] || 0) + amount
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
