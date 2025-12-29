"use client"

import { useState, useEffect, useCallback } from "react"
import { journalService } from "../services/journalService"
import type { Journal, JournalFilters } from "../types/journal"
import { toast } from "@/lib/utils/toast"

export function useJournals(initialFilters?: JournalFilters) {
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<JournalFilters | undefined>(initialFilters)

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await journalService.getJournals(filters)
      // Ensure data is an array
      setJournals(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch journal entries")
      setError(error)
      // Only show toast if it's not a validation error (user might be adjusting filters)
      const errorMessage = error.message || ""
      if (!errorMessage.includes("Invalid") && !errorMessage.includes("must be")) {
        toast.error("Failed to load journal entries")
      }
      setJournals([]) // Clear journals on error
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const updateFilters = useCallback((newFilters: JournalFilters) => {
    setFilters(newFilters)
  }, [])

  const refresh = useCallback(() => {
    fetchJournals()
  }, [fetchJournals])

  const deleteJournal = useCallback(async (id: string) => {
    try {
      await journalService.deleteJournal(id)
      toast.success("Journal entry deleted successfully")
      refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete journal entry")
      toast.error(error.message || "Failed to delete journal entry")
      throw error
    }
  }, [refresh])

  return {
    journals,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
    deleteJournal,
  }
}

