"use client"

import { useState, useEffect, useCallback } from "react"
import { financialService } from "../services/financialService"
import type { FinancialSummary, RevenueAnalytics, BalanceSheet } from "../types/summary"
import { toast } from "@/lib/utils/toast"

export function useFinancialSummary() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      const [summaryData, analyticsData, balanceSheetData] = await Promise.all([
        financialService.getSummary(),
        financialService.getRevenueAnalytics(),
        financialService.getBalanceSheet(),
      ])
      setSummary(summaryData)
      setAnalytics(analyticsData)
      setBalanceSheet(balanceSheetData)
    } catch (error: any) {
      console.error("Error loading financial summary:", error)
      const errorMessage = error?.message || "Failed to load financial data"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  // Listen for financial data changes (e.g., when income/expenses are added, updated, or deleted)
  useEffect(() => {
    const handleFinancialDataChange = () => {
      loadSummary()
    }

    window.addEventListener("financial-data-changed", handleFinancialDataChange)

    return () => {
      window.removeEventListener("financial-data-changed", handleFinancialDataChange)
    }
  }, [loadSummary])

  return {
    summary,
    analytics,
    balanceSheet,
    isLoading,
    refresh: loadSummary,
  }
}
