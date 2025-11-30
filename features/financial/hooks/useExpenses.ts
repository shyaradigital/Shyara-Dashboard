"use client"

import { useState, useEffect, useCallback } from "react"
import { expenseService } from "../services/expenseService"
import type { Expense, ExpenseFilters, ExpenseSummary } from "../types/expense"

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<ExpenseSummary | null>(null)
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadExpenses = useCallback(() => {
    setIsLoading(true)
    try {
      const data = expenseService.getAll(filters)
      const summaryData = expenseService.getSummary(filters)
      setExpenses(data)
      setSummary(summaryData)
    } catch (error) {
      console.error("Error loading expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const addExpense = useCallback(
    (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      try {
        expenseService.create(expense)
        loadExpenses()
        return true
      } catch (error) {
        console.error("Error adding expense:", error)
        return false
      }
    },
    [loadExpenses]
  )

  const updateExpense = useCallback(
    (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => {
      try {
        const updated = expenseService.update(id, updates)
        if (updated) {
          loadExpenses()
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating expense:", error)
        return false
      }
    },
    [loadExpenses]
  )

  const deleteExpense = useCallback(
    (id: string) => {
      try {
        const success = expenseService.delete(id)
        if (success) {
          loadExpenses()
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting expense:", error)
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
