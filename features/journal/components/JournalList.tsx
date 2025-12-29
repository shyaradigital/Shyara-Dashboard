"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { useJournals } from "../hooks/useJournals"
import { JournalCard } from "./JournalCard"
import { JournalFilters } from "./JournalFilters"
import { AddJournalModal } from "./AddJournalModal"
import type { JournalFilters as JournalFiltersType } from "../types/journal"
import { useAuth } from "@/hooks/use-auth"

export function JournalList() {
  const [filters, setFilters] = useState<JournalFiltersType | undefined>(undefined)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { journals, loading, deleteJournal, refresh } = useJournals(filters)
  const { checkPermission } = useAuth()

  const canCreate = checkPermission("journal:edit")

  const handleFiltersChange = (newFilters: JournalFiltersType) => {
    setFilters(newFilters)
  }

  const handleStatusUpdate = async () => {
    refresh()
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (deletingId) return // Prevent double deletion
    
    try {
      setDeletingId(id)
      await deleteJournal(id)
    } catch (error) {
      // Error handled by hook
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddSuccess = () => {
    refresh()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold sm:text-xl md:text-2xl">Journal</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage tasks and notes with deadlines
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Entry</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <JournalFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Journal Entries */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : journals.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              <p className="text-sm font-medium mb-1">No journal entries found</p>
              <p className="text-xs">
                {filters && Object.keys(filters).length > 0
                  ? "Try adjusting your filters"
                  : canCreate
                  ? "Create your first journal entry to get started"
                  : "No entries have been created yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-3 sm:p-4">
              {journals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={() => handleDelete(journal.id)}
                  isDeleting={deletingId === journal.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      {canCreate && (
        <AddJournalModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  )
}

