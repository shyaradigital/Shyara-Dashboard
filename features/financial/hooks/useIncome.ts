"use client"

import { useState, useEffect, useCallback } from "react"
import { incomeService } from "../services/incomeService"
import type { Income, IncomeFilters, IncomeSummary } from "../types/income"
import { toast } from "@/lib/utils/toast"

export function useIncome() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [summary, setSummary] = useState<IncomeSummary | null>(null)
  const [filters, setFilters] = useState<IncomeFilters>({})
  const [isLoading, setIsLoading] = useState(true)

  const loadIncomes = useCallback(async () => {
    setIsLoading(true)
    try {
      const [data, summaryData] = await Promise.all([
        incomeService.getAll(filters),
        incomeService.getSummary(filters),
      ])
      setIncomes(data)
      setSummary(summaryData)
    } catch (error: any) {
      console.error("Error loading incomes:", error)
      const errorMessage = error?.message || "Failed to load income data"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadIncomes()
  }, [loadIncomes])

  const addIncome = useCallback(
    async (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
      try {
        await incomeService.create(income)
        await loadIncomes()
        // Dispatch custom event to notify other components (like Topbar) to refresh financial summary
        window.dispatchEvent(new CustomEvent("financial-data-changed"))
        toast.success("Income added successfully")
        return true
      } catch (error: any) {
        console.error("Error adding income:", error)
        const errorMessage = error?.message || "Failed to add income"
        toast.error(errorMessage)
        return false
      }
    },
    [loadIncomes]
  )

  const updateIncome = useCallback(
    async (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>) => {
      try {
        const updated = await incomeService.update(id, updates)
        if (updated) {
          await loadIncomes()
          // Dispatch custom event to notify other components (like Topbar) to refresh financial summary
          window.dispatchEvent(new CustomEvent("financial-data-changed"))
          toast.success("Income updated successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error updating income:", error)
        const errorMessage = error?.message || "Failed to update income"
        toast.error(errorMessage)
        return false
      }
    },
    [loadIncomes]
  )

  const deleteIncome = useCallback(
    async (id: string) => {
      try {
        const success = await incomeService.delete(id)
        if (success) {
          await loadIncomes()
          // Dispatch custom event to notify other components (like Topbar) to refresh financial summary
          window.dispatchEvent(new CustomEvent("financial-data-changed"))
          toast.success("Income deleted successfully")
          return true
        }
        return false
      } catch (error: any) {
        console.error("Error deleting income:", error)
        const errorMessage = error?.message || "Failed to delete income"
        toast.error(errorMessage)
        return false
      }
    },
    [loadIncomes]
  )

  const updateFilters = useCallback((newFilters: IncomeFilters) => {
    setFilters(newFilters)
  }, [])

  const markDueAsPaid = useCallback(
    async (id: string): Promise<void> => {
      try {
        await incomeService.markDueAsPaid(id)
        await loadIncomes()
        // Dispatch custom event to notify other components (like Topbar) to refresh financial summary
        window.dispatchEvent(new CustomEvent("financial-data-changed"))
        toast.success("Due marked as paid successfully")
      } catch (error: any) {
        console.error("Error marking due as paid:", error)
        const errorMessage = error?.message || "Failed to mark due as paid"
        toast.error(errorMessage)
        throw error
      }
    },
    [loadIncomes]
  )

  return {
    incomes,
    summary,
    filters,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    updateFilters,
    markDueAsPaid,
    refresh: loadIncomes,
  }
}
