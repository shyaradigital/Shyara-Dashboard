"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, X } from "lucide-react"
import type { JournalFilters as JournalFiltersType, JournalType } from "../types/journal"
import { usersApi } from "@/lib/api/users"
import type { UserResponse } from "@/lib/api/users"

interface JournalFiltersProps {
  filters: JournalFiltersType | undefined
  onFiltersChange: (filters: JournalFiltersType) => void
}

export function JournalFilters({ filters, onFiltersChange }: JournalFiltersProps) {
  const [type, setType] = useState<JournalType | "all">(
    filters?.type || "all"
  )
  const [status, setStatus] = useState<string>(
    filters?.isCompleted !== undefined
      ? filters.isCompleted
        ? "completed"
        : "incomplete"
      : "all"
  )
  const [assignedToId, setAssignedToId] = useState<string>(
    filters?.assignedToId || ""
  )
  const [createdById, setCreatedById] = useState<string>(
    filters?.createdById || ""
  )
  const [startDate, setStartDate] = useState<string>(
    filters?.startDate ? filters.startDate.split("T")[0] : ""
  )
  const [endDate, setEndDate] = useState<string>(
    filters?.endDate ? filters.endDate.split("T")[0] : ""
  )
  const [nearDeadlines, setNearDeadlines] = useState<boolean>(
    filters?.nearDeadlines || false
  )
  const [overdue, setOverdue] = useState<boolean>(filters?.overdue || false)
  const [search, setSearch] = useState<string>(filters?.search || "")

  const [users, setUsers] = useState<UserResponse[]>([])
  const [creators, setCreators] = useState<UserResponse[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  // Sync local state with props when filters change externally (only on mount or when filters object reference changes)
  useEffect(() => {
    if (filters) {
      const newType = filters.type || "all"
      const newStatus = filters.isCompleted !== undefined
        ? filters.isCompleted
          ? "completed"
          : "incomplete"
        : "all"
      const newAssignedToId = filters.assignedToId || ""
      const newCreatedById = filters.createdById || ""
      const newStartDate = filters.startDate ? filters.startDate.split("T")[0] : ""
      const newEndDate = filters.endDate ? filters.endDate.split("T")[0] : ""
      const newNearDeadlines = filters.nearDeadlines || false
      const newOverdue = filters.overdue || false
      const newSearch = filters.search || ""

      // Only update if values actually changed to prevent loops
      if (type !== newType) setType(newType)
      if (status !== newStatus) setStatus(newStatus)
      if (assignedToId !== newAssignedToId) setAssignedToId(newAssignedToId)
      if (createdById !== newCreatedById) setCreatedById(newCreatedById)
      if (startDate !== newStartDate) setStartDate(newStartDate)
      if (endDate !== newEndDate) setEndDate(newEndDate)
      if (nearDeadlines !== newNearDeadlines) setNearDeadlines(newNearDeadlines)
      if (overdue !== newOverdue) setOverdue(newOverdue)
      if (search !== newSearch) setSearch(newSearch)
    }
    // Only run when filters object reference changes, not individual properties
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const userList = await usersApi.getAll()
      setUsers(userList)

      // Load creators separately (users who have created journal entries)
      // For now, we'll use all users, but in a real scenario, you'd filter by users who have created entries
      setCreators(userList)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const applyFilters = () => {
    const newFilters: JournalFiltersType = {}

    if (type !== "all") {
      newFilters.type = type
    }

    // Only apply status filter if overdue is not selected
    if (status !== "all" && !overdue) {
      newFilters.isCompleted = status === "completed"
    }

    if (assignedToId) {
      newFilters.assignedToId = assignedToId
    }

    if (createdById) {
      newFilters.createdById = createdById
    }

    if (startDate) {
      const start = new Date(startDate)
      if (!isNaN(start.getTime())) {
        newFilters.startDate = start.toISOString()
      }
    }

    if (endDate) {
      const end = new Date(endDate)
      if (!isNaN(end.getTime())) {
        newFilters.endDate = end.toISOString()
      }
    }

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
        // Don't apply filters if invalid range, show error instead
        console.warn("Start date must be before or equal to end date")
        return
      }
    }

    if (nearDeadlines) {
      newFilters.nearDeadlines = true
    }

    if (overdue) {
      newFilters.overdue = true
    }

    if (search.trim()) {
      newFilters.search = search.trim()
    }

    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setType("all")
    setStatus("all")
    setAssignedToId("")
    setCreatedById("")
    setStartDate("")
    setEndDate("")
    setNearDeadlines(false)
    setOverdue(false)
    setSearch("")
    onFiltersChange({})
  }

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(value) => {
              setType(value as JournalType | "all")
              setTimeout(applyFilters, 0)
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
                <SelectItem value="NOTE">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={status} 
              onValueChange={(value) => {
                setStatus(value)
                // If overdue is checked, uncheck it when status changes
                if (overdue && value !== "all") {
                  setOverdue(false)
                }
                setTimeout(applyFilters, 0)
              }}
              disabled={overdue}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
            {overdue && (
              <p className="text-xs text-muted-foreground">Status filter disabled when Overdue is selected</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select value={assignedToId || "all"} onValueChange={(value) => {
              setAssignedToId(value === "all" ? "" : value)
              setTimeout(applyFilters, 0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Created By</Label>
            <Select value={createdById || "all"} onValueChange={(value) => {
              setCreatedById(value === "all" ? "" : value)
              setTimeout(applyFilters, 0)
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All creators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All creators</SelectItem>
                {loadingUsers ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : (
                  creators.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                // Validate date range before applying
                if (e.target.value && endDate && new Date(e.target.value) > new Date(endDate)) {
                  // Don't apply if invalid, but allow user to set it
                  setTimeout(() => {
                    // Apply filters anyway, backend will validate
                    applyFilters()
                  }, 0)
                } else {
                  setTimeout(applyFilters, 0)
                }
              }}
            />
            {startDate && endDate && new Date(startDate) > new Date(endDate) && (
              <p className="text-xs text-destructive">Start date must be before end date</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                // Validate date range before applying
                if (e.target.value && startDate && new Date(startDate) > new Date(e.target.value)) {
                  // Don't apply if invalid, but allow user to set it
                  setTimeout(() => {
                    // Apply filters anyway, backend will validate
                    applyFilters()
                  }, 0)
                } else {
                  setTimeout(applyFilters, 0)
                }
              }}
            />
            {startDate && endDate && new Date(startDate) > new Date(endDate) && (
              <p className="text-xs text-destructive">End date must be after start date</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search title or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2 flex items-end">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <Checkbox
                id="nearDeadlines"
                checked={nearDeadlines}
                onCheckedChange={(checked) => {
                  setNearDeadlines(checked as boolean)
                  setTimeout(applyFilters, 0)
                }}
              />
              <Label htmlFor="nearDeadlines" className="cursor-pointer text-xs sm:text-sm">
                Near Deadlines (7 days)
              </Label>
            </div>
          </div>

          <div className="space-y-2 flex items-end">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <Checkbox
                id="overdue"
                checked={overdue}
                onCheckedChange={(checked) => {
                  setOverdue(checked as boolean)
                  // If overdue is checked, reset status filter
                  if (checked) {
                    setStatus("all")
                  }
                  setTimeout(applyFilters, 0)
                }}
              />
              <Label htmlFor="overdue" className="cursor-pointer text-xs sm:text-sm">
                Overdue
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

