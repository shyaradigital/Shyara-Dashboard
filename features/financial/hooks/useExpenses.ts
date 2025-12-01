"use client"

import { useState, useEffect, useCallback } from "react"
import { expenseService } from "../services/expenseService"
import type { Expense, ExpenseFilters, ExpenseSummary } from "../types/expense"
import { toast } from "@/lib/utils/toast"

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    try {
      const [data, summaryData] = await Promise.all([
        expenseService.getAll(filters),
        expenseService.getSummary(filters),
      ])
      setExpenses(data)
      setSummary(summaryData)
    } catch (error: any) {
      console.error("Error loading expenses:", error)
      const errorMessage = error?.message || "Failed to load expense data"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const addExpense = useCallback(
    async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      try {
        await expenseService.create(expense)
        await loadExpenses()
        toast.success("Expense added successfully")
        return true
      } catch (error: any) {
        console.error("Error adding expense:", error)
        const errorMessage = error?.message || "Failed to add expense"
        toast.error(errorMessage)
        return false
      }
    },
    [loadExpenses]
  )

  const updateExpense = useCallback(
    async (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => {
      try {
        const updated = await expenseService.update(id, updates)
        if (updated) {
          await loadExpenses()
          toast.success("Expense updated successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error updating expense:", error)
        const errorMessage = error?.message || "Failed to update expense"
        toast.error(errorMessage)
        return false
      }
    },
    [loadExpenses]
  )

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        const success = await expenseService.delete(id)
        if (success) {
          await loadExpenses()
          toast.success("Expense deleted successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error deleting expense:", error)
        const errorMessage = error?.message || "Failed to delete expense"
        toast.error(errorMessage)
        return false
      }
    },
    [loadExpenses]
  )

  const updateFilters = useCallback((newFilters: ExpenseFilters) => {
    setFilters(newFilters)
  }, [])

  return {
    expenses,
    summary,
    filters,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    updateFilters,
    refresh: loadExpenses,
  }
}
