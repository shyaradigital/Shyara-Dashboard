"use client"

import { useState, useEffect, useCallback } from "react"
import { incomeService } from "../services/incomeService"
import type { Income, IncomeFilters, IncomeSummary } from "../types/income"

export function useIncome() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [summary, setSummary] = useState<IncomeSummary | null>(null)
  const [filters, setFilters] = useState<IncomeFilters>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadIncomes = useCallback(() => {
    setIsLoading(true)
    try {
      const data = incomeService.getAll(filters)
      const summaryData = incomeService.getSummary(filters)
      setIncomes(data)
      setSummary(summaryData)
    } catch (error) {
      console.error("Error loading incomes:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadIncomes()
  }, [loadIncomes])

  const addIncome = useCallback(
    (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
      try {
        incomeService.create(income)
        loadIncomes()
        return true
      } catch (error) {
        console.error("Error adding income:", error)
        return false
      }
    },
    [loadIncomes]
  )

  const updateIncome = useCallback(
    (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>) => {
      try {
        const updated = incomeService.update(id, updates)
        if (updated) {
          loadIncomes()
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating income:", error)
        return false
      }
    },
    [loadIncomes]
  )

  const deleteIncome = useCallback(
    (id: string) => {
      try {
        const success = incomeService.delete(id)
        if (success) {
          loadIncomes()
          return true
        }
        return false
      } catch (error) {
        console.error("Error deleting income:", error)
        return false
      }
    },
    [loadIncomes]
  )

  const updateFilters = useCallback((newFilters: IncomeFilters) => {
    setFilters(newFilters)
  }, [])

  return {
    incomes,
    summary,
    filters,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    updateFilters,
    refresh: loadIncomes,
  }
}
