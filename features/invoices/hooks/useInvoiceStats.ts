"use client"

import { useState, useEffect, useCallback } from "react"
import { invoiceService } from "../services/invoiceService"
import type { InvoiceStats } from "@/lib/api/invoices"
import { toast } from "@/lib/utils/toast"

export function useInvoiceStats() {
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await invoiceService.getStats()
      setStats(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch stats")
      setError(error)
      // Don't show toast for stats errors - it's not critical
      console.error("Failed to fetch invoice stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const refresh = useCallback(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh,
  }
}

