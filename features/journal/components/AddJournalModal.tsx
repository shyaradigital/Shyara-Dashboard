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
import { Loader2 } from "lucide-react"

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
      <DialogContent className="flex max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[600px] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>Create Journal Entry</DialogTitle>
          <DialogDescription>
            Add a new task or note to the journal
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                maxLength={200}
                required
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={4}
                maxLength={5000}
                required
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {content.length}/5000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={type} onValueChange={(value) => setType(value as JournalType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Task</SelectItem>
                  <SelectItem value="NOTE">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To (Optional)</Label>
              <Select value={assignedToId || "none"} onValueChange={(value) => setAssignedToId(value === "none" ? "" : value)}>
                <SelectTrigger>
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
          <DialogFooter className="shrink-0 border-t px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4 flex-col sm:flex-row gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
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
              className="w-full sm:w-auto"
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

