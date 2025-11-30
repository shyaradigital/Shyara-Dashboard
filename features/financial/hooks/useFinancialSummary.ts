"use client"

import { useState, useEffect, useCallback } from "react"
import { financialService } from "../services/financialService"
import type { FinancialSummary, RevenueAnalytics, BalanceSheet } from "../types/summary"

export function useFinancialSummary() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSummary = useCallback(() => {
    setIsLoading(true)
    try {
      const summaryData = financialService.getSummary()
      const analyticsData = financialService.getRevenueAnalytics()
      const balanceSheetData = financialService.getBalanceSheet()
      setSummary(summaryData)
      setAnalytics(analyticsData)
      setBalanceSheet(balanceSheetData)
    } catch (error) {
      console.error("Error loading financial summary:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return {
    summary,
    analytics,
    balanceSheet,
    isLoading,
    refresh: loadSummary,
  }
}
