import type { Income, IncomeFilters, IncomeSummary, IncomeCategory } from "../types/income"
import { incomeApi, type IncomeResponse } from "@/lib/api/financial"

// Create empty category record
const createEmptyIncomeCategoryRecord = (): Record<IncomeCategory, number> => ({
  SMM: 0,
  Website: 0,
  Ads: 0,
  POS: 0,
  Consultation: 0,
  Freelancing: 0,
  "Wedding Video Invitation": 0,
  "Engagement Video Invitation": 0,
  "Wedding Card Invitation": 0,
  "Engagement Card Invitation": 0,
  "Anniversary Card Invitation": 0,
  "Anniversary Video Invitation": 0,
  "Birthday Wish Video": 0,
  "Birthday Wish Card": 0,
  "Birthday Video Invitation": 0,
  "Birthday Card Invitation": 0,
  Other: 0,
});

// Convert API response to app Income type
const mapIncomeResponse = (response: IncomeResponse): Income => {
  return {
    id: response.id,
    amount: response.amount,
    category: response.category as Income["category"],
    source: response.source,
    description: response.description,
    date: response.date,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    // Advance payment and dues fields
    totalAmount: response.totalAmount,
    advanceAmount: response.advanceAmount,
    dueAmount: response.dueAmount,
    dueDate: response.dueDate,
    isDuePaid: response.isDuePaid,
    duePaidDate: response.duePaidDate,
  }
}

export const incomeService = {
  getAll: async (filters?: IncomeFilters): Promise<Income[]> => {
    try {
      const incomes = await incomeApi.getAll(filters)
      return incomes.map(mapIncomeResponse)
    } catch (error: any) {
      // In local dev, return empty array instead of throwing
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (error?.isLocalDevError || error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
          return [];
        }
      }
      console.error("Error fetching incomes:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<Income | null> => {
    try {
      const income = await incomeApi.getById(id)
      return mapIncomeResponse(income)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error("Error fetching income:", error)
      throw error
    }
  },

  create: async (income: Omit<Income, "id" | "createdAt" | "updatedAt">): Promise<Income> => {
    try {
      const created = await incomeApi.create(income)
      return mapIncomeResponse(created)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create income"
      throw new Error(errorMessage)
    }
  },

  update: async (
    id: string,
    updates: Partial<Omit<Income, "id" | "createdAt">>
  ): Promise<Income | null> => {
    try {
      const updated = await incomeApi.update(id, updates)
      return mapIncomeResponse(updated)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to update income"
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await incomeApi.delete(id)
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      console.error("Error deleting income:", error)
      throw error
    }
  },

  getSummary: async (filters?: IncomeFilters): Promise<IncomeSummary> => {
    try {
      return await incomeApi.getSummary(filters)
    } catch (error: any) {
      // In local dev, return empty summary instead of throwing
      if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
        if (error?.isLocalDevError || error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
          return {
            total: 0,
            monthly: 0,
            quarterly: 0,
            yearly: 0,
            byCategory: createEmptyIncomeCategoryRecord(),
          };
        }
      }
      console.error("Error fetching income summary:", error)
      throw error
    }
  },

  markDueAsPaid: async (id: string, paidDate?: string): Promise<Income> => {
    try {
      const updated = await incomeApi.markDueAsPaid(id, paidDate)
      return mapIncomeResponse(updated)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to mark due as paid"
      throw new Error(errorMessage)
    }
  },

  getOutstandingDues: async (filters?: IncomeFilters): Promise<Income[]> => {
    try {
      const dues = await incomeApi.getOutstandingDues(filters)
      return dues.map(mapIncomeResponse)
    } catch (error) {
      console.error("Error fetching outstanding dues:", error)
      throw error
    }
  },
}
