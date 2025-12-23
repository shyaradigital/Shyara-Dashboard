import { financialApi } from "@/lib/api/financial"
import type { FinancialSummary, RevenueAnalytics, BalanceSheet } from "../types/summary"
import type { IncomeCategory } from "../types/income"
import type { ExpenseCategory } from "../types/expense"

// Check if running in local development
const isLocalDevelopment = () => {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
};

// Helper to check if error is a local dev network error
const isLocalDevError = (error: any): boolean => {
  return isLocalDevelopment() && (error?.isLocalDevError || error?.code === "ERR_NETWORK" || error?.message === "Network Error");
};

// Create empty category records
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

export const financialService = {
  getSummary: async (): Promise<FinancialSummary> => {
    try {
      return await financialApi.getSummary()
    } catch (error: any) {
      if (isLocalDevError(error)) {
        // Return empty data for local development with correct structure
        return {
          totalIncome: 0,
          totalExpenses: 0,
          totalBalance: 0,
          incomeSummary: {
            total: 0,
            monthly: 0,
            quarterly: 0,
            yearly: 0,
            byCategory: createEmptyIncomeCategoryRecord(),
          },
          expenseSummary: {
            total: 0,
            monthly: 0,
            quarterly: 0,
            yearly: 0,
            byCategory: createEmptyExpenseCategoryRecord(),
          },
        };
      }
      console.error("Error fetching financial summary:", error)
      throw error
    }
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    try {
      return await financialApi.getAnalytics()
    } catch (error: any) {
      if (isLocalDevError(error)) {
        // Return empty data for local development with correct structure
        return {
          monthly: [],
          quarterly: [],
          yearly: [],
          growth: {
            monthly: 0,
            quarterly: 0,
            yearly: 0,
          },
          categoryWiseIncome: [],
          categoryWiseExpenses: [],
          nextQuarterProjection: 0,
          nextYearProjection: 0,
        };
      }
      console.error("Error fetching revenue analytics:", error)
      throw error
    }
  },

  getBalanceSheet: async (): Promise<BalanceSheet> => {
    try {
      return await financialApi.getBalanceSheet()
    } catch (error: any) {
      if (isLocalDevError(error)) {
        // Return empty data for local development with correct structure
        return {
          assets: 0,
          liabilities: 0,
          equity: 0,
        };
      }
      console.error("Error fetching balance sheet:", error)
      throw error
    }
  },
}
