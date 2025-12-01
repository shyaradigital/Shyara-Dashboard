import { apiClient } from "./client";
import type { Income, IncomeFilters, IncomeSummary } from "@/features/financial/types/income";
import type { Expense, ExpenseFilters, ExpenseSummary } from "@/features/financial/types/expense";
import type {
  FinancialSummary,
  RevenueAnalytics,
  BalanceSheet,
} from "@/features/financial/types/summary";

export interface IncomeResponse {
  id: string;
  amount: number;
  category: string;
  source: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  id: string;
  amount: number;
  category: string;
  purpose: string;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export const incomeApi = {
  getAll: async (filters?: IncomeFilters): Promise<IncomeResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.source) params.append("source", filters.source);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<IncomeResponse[]>(
      `/incomes${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<IncomeResponse> => {
    const response = await apiClient.get<IncomeResponse>(`/incomes/${id}`);
    return response.data;
  },

  create: async (income: Omit<Income, "id" | "createdAt" | "updatedAt">): Promise<IncomeResponse> => {
    const response = await apiClient.post<IncomeResponse>("/incomes", income);
    return response.data;
  },

  update: async (
    id: string,
    updates: Partial<Omit<Income, "id" | "createdAt">>
  ): Promise<IncomeResponse> => {
    const response = await apiClient.patch<IncomeResponse>(`/incomes/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/incomes/${id}`);
  },

  getSummary: async (filters?: IncomeFilters): Promise<IncomeSummary> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.source) params.append("source", filters.source);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<IncomeSummary>(
      `/incomes/summary${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },
};

export const expenseApi = {
  getAll: async (filters?: ExpenseFilters): Promise<ExpenseResponse[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.purpose) params.append("purpose", filters.purpose);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<ExpenseResponse[]>(
      `/expenses${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<ExpenseResponse> => {
    const response = await apiClient.get<ExpenseResponse>(`/expenses/${id}`);
    return response.data;
  },

  create: async (
    expense: Omit<Expense, "id" | "createdAt" | "updatedAt">
  ): Promise<ExpenseResponse> => {
    const response = await apiClient.post<ExpenseResponse>("/expenses", expense);
    return response.data;
  },

  update: async (
    id: string,
    updates: Partial<Omit<Expense, "id" | "createdAt">>
  ): Promise<ExpenseResponse> => {
    const response = await apiClient.patch<ExpenseResponse>(`/expenses/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getSummary: async (filters?: ExpenseFilters): Promise<ExpenseSummary> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.purpose) params.append("purpose", filters.purpose);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<ExpenseSummary>(
      `/expenses/summary${params.toString() ? `?${params.toString()}` : ""}`
    );
    return response.data;
  },
};

export const financialApi = {
  getSummary: async (): Promise<FinancialSummary> => {
    const response = await apiClient.get<FinancialSummary>("/financial/summary");
    return response.data;
  },

  getAnalytics: async (): Promise<RevenueAnalytics> => {
    const response = await apiClient.get<RevenueAnalytics>("/financial/analytics");
    return response.data;
  },

  getBalanceSheet: async (): Promise<BalanceSheet> => {
    const response = await apiClient.get<BalanceSheet>("/financial/balance-sheet");
    return response.data;
  },
};

