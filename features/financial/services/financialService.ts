import { financialApi } from "@/lib/api/financial"
import type { FinancialSummary, RevenueAnalytics, BalanceSheet } from "../types/summary"

export const financialService = {
  getSummary: async (): Promise<FinancialSummary> => {
    try {
      return await financialApi.getSummary()
    } catch (error) {
      console.error("Error fetching financial summary:", error)
      throw error
    }
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    try {
      return await financialApi.getAnalytics()
    } catch (error) {
      console.error("Error fetching revenue analytics:", error)
      throw error
    }
  },

  getBalanceSheet: async (): Promise<BalanceSheet> => {
    try {
      return await financialApi.getBalanceSheet()
    } catch (error) {
      console.error("Error fetching balance sheet:", error)
      throw error
    }
  },
}
