"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { JournalType, CreateJournalData } from "../types/journal"
import { useJournal } from "../hooks/useJournal"
import { usersApi } from "@/lib/api/users"
import type { UserResponse } from "@/lib/api/users"
import { Loader2, FileText, Calendar, User } from "lucide-react"

interface AddJournalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddJournalModal({ open, onOpenChange, onSuccess }: AddJournalModalProps) {
  const { createJournal, loading } = useJournal()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<JournalType>("TASK")
  const [deadline, setDeadline] = useState("")
  const [assignedToId, setAssignedToId] = useState<string>("")
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    if (open) {
      resetForm()
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const userList = await usersApi.getAll()
      // Filter out inactive users and ensure we have valid data
      setUsers(Array.isArray(userList) ? userList.filter(u => u.status === "active") : [])
    } catch (error) {
      console.error("Failed to load users:", error)
      setUsers([]) // Set empty array on error
    } finally {
      setLoadingUsers(false)
    }
  }

  const resetForm = () => {
    setTitle("")
    setContent("")
    setType("TASK")
    setDeadline("")
    setAssignedToId("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      return
    }

    // Validate title length
    if (title.trim().length > 200) {
      return
    }

    // Validate content length
    if (content.trim().length > 5000) {
      return
    }

    try {
      // Convert datetime-local to ISO string
      let deadlineISO: string | undefined = undefined
      if (deadline) {
        const deadlineDate = new Date(deadline)
        if (isNaN(deadlineDate.getTime())) {
          // Invalid date, skip deadline
          deadlineISO = undefined
        } else {
          deadlineISO = deadlineDate.toISOString()
        }
      }

      const data: CreateJournalData = {
        title: title.trim(),
        content: content.trim(),
        type,
        deadline: deadlineISO,
        // Only include assignedToId if it's a non-empty string
        assignedToId: assignedToId && assignedToId.trim() ? assignedToId.trim() : undefined,
      }

      await createJournal(data)
      resetForm()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[90vw] !max-w-[90vw] flex max-h-[85vh] flex-col gap-0 p-0 overflow-hidden sm:!w-[50vw] sm:!max-w-[50vw] lg:!w-[600px] lg:!max-w-[600px] xl:!w-[650px] xl:!max-w-[650px] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-3.5 sm:pt-4.5">
          <DialogTitle className="text-lg sm:text-xl font-semibold">Create Journal Entry</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new task or note to the journal
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-6 sm:py-4">
            <div className="space-y-4">
              {/* Required Fields Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    maxLength={200}
                    required
                    className="h-10 text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Content *
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter content"
                    rows={5}
                    maxLength={5000}
                    required
                    className="resize-none text-sm sm:text-base"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length}/5000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm sm:text-base font-medium">Type *</Label>
                  <Select value={type} onValueChange={(value) => setType(value as JournalType)}>
                    <SelectTrigger className="h-10 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TASK">Task</SelectItem>
                      <SelectItem value="NOTE">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Optional Fields Section */}
              <div className="space-y-4 pt-2 border-t border-border/50">
                <p className="text-sm text-muted-foreground font-medium mb-2">Optional</p>
                
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-10 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Assign To
                  </Label>
                  <Select value={assignedToId || "none"} onValueChange={(value) => setAssignedToId(value === "none" ? "" : value)}>
                    <SelectTrigger className="h-10 text-sm sm:text-base">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>
                          Loading users...
                        </SelectItem>
                      ) : users.length === 0 ? (
                        <SelectItem value="no-users" disabled>
                          No users available
                        </SelectItem>
                      ) : (
                        users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t px-4 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-3.5 flex-col sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-10 text-sm sm:text-base">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading || 
                !title.trim() || 
                !content.trim() || 
                title.trim().length > 200 || 
                content.trim().length > 5000
              }
              className="w-full sm:w-auto h-10 text-sm sm:text-base"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

