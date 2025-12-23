"use client"

import { useState, useEffect, useCallback } from "react"
import { invoiceService } from "../services/invoiceService"
import type { InvoiceResponse } from "@/lib/api/invoices"
import type { InvoiceFilters } from "@/lib/api/invoices"
import { toast } from "@/lib/utils/toast"

export function useInvoices(initialFilters?: InvoiceFilters) {
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<InvoiceFilters | undefined>(initialFilters)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await invoiceService.getInvoices(filters)
      setInvoices(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch invoices")
      setError(error)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const updateFilters = useCallback((newFilters: InvoiceFilters) => {
    setFilters(newFilters)
  }, [])

  const refresh = useCallback(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await invoiceService.deleteInvoice(id)
      toast.success("Invoice deleted successfully")
      refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete invoice")
      toast.error(error.message || "Failed to delete invoice")
      throw error
    }
  }, [refresh])

  return {
    invoices,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    deleteInvoice,
  }
}

