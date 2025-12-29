"use client"

import { useState, useCallback } from "react"
import { journalService } from "../services/journalService"
import type { Journal, CreateJournalData, UpdateJournalStatusData } from "../types/journal"
import { toast } from "@/lib/utils/toast"

export function useJournal() {
  const [loading, setLoading] = useState(false)

  const createJournal = useCallback(async (data: CreateJournalData): Promise<Journal> => {
    try {
      setLoading(true)
      const journal = await journalService.createJournal(data)
      toast.success("Journal entry created successfully")
      return journal
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create journal entry")
      toast.error(error.message || "Failed to create journal entry")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateJournalStatus = useCallback(async (id: string, data: UpdateJournalStatusData): Promise<Journal> => {
    try {
      setLoading(true)
      const journal = await journalService.updateJournalStatus(id, data)
      toast.success("Journal entry status updated successfully")
      return journal
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update journal entry status")
      toast.error(error.message || "Failed to update journal entry status")
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    createJournal,
    updateJournalStatus,
  }
}

