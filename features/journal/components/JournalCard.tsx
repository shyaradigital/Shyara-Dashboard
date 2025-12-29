"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, User, UserCircle } from "lucide-react"
import type { Journal } from "../types/journal"
import { useJournal } from "../hooks/useJournal"
import { useAuth } from "@/hooks/use-auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface JournalCardProps {
  journal: Journal
  onStatusUpdate: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function JournalCard({ journal, onStatusUpdate, onDelete, isDeleting = false }: JournalCardProps) {
  const { updateJournalStatus, loading } = useJournal()
  const { user } = useAuth()

  const isCreator = user?.id === journal.createdById
  const isAdmin = user?.role === "ADMIN"

  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (checked: boolean) => {
    if (!isCreator || isUpdating || loading) return

    try {
      setIsUpdating(true)
      await updateJournalStatus(journal.id, { isCompleted: checked })
      onStatusUpdate()
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsUpdating(false)
    }
  }

  const getDeadlineInfo = () => {
    if (!journal.deadline) return { color: "text-muted-foreground", variant: "outline" as const, text: "", diffDays: null }

    const deadline = new Date(journal.deadline)
    if (isNaN(deadline.getTime())) {
      return { color: "text-muted-foreground", variant: "outline" as const, text: "Invalid date", diffDays: null }
    }

    const now = new Date()
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let color: string
    let variant: "destructive" | "secondary" | "default" | "outline"
    let text: string

    if (diffDays < 0) {
      color = "text-red-600"
      variant = "destructive"
      text = "Overdue"
    } else if (diffDays === 0) {
      color = "text-yellow-600"
      variant = "secondary"
      text = "Due Today"
    } else if (diffDays === 1) {
      color = "text-yellow-600"
      variant = "secondary"
      text = "Due Tomorrow"
    } else if (diffDays <= 7) {
      color = "text-yellow-600"
      variant = "secondary"
      text = `${diffDays} days left`
    } else {
      color = "text-green-600"
      variant = "default"
      text = `${diffDays} days left`
    }

    return { color, variant, text, diffDays }
  }

  const deadlineInfo = getDeadlineInfo()

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="font-semibold text-base sm:text-lg">{journal.title}</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <Badge variant={journal.type === "TASK" ? "default" : "secondary"}>
                  {journal.type}
                </Badge>
                {journal.isCompleted && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Completed
                  </Badge>
                )}
              </div>
            </div>
            {journal.deadline && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <span className={deadlineInfo.color}>
                    Deadline: {(() => {
                      const deadline = new Date(journal.deadline)
                      if (isNaN(deadline.getTime())) return "Invalid date"
                      return deadline.toLocaleString()
                    })()}
                  </span>
                </div>
                {deadlineInfo.text && (
                  <Badge variant={deadlineInfo.variant} className="text-xs w-fit">
                    {deadlineInfo.text}
                  </Badge>
                )}
              </div>
            )}
          </div>
          {isCreator && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={journal.isCompleted}
                  onCheckedChange={handleStatusChange}
                  disabled={loading || isUpdating}
                />
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Mark as completed</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{journal.content}</p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-2 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <UserCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Created by: {journal.createdBy?.name || "Unknown"}</span>
            </div>
            {journal.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Assigned to: {journal.assignedTo.name}</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                  disabled={loading || isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{journal.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDelete} 
                    className="bg-destructive text-destructive-foreground"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

