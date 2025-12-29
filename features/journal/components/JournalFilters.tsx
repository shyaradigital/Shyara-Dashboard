"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { Search, X, ChevronDown, ChevronUp, Filter, Calendar, User, FileText } from "lucide-react"
import type { JournalFilters as JournalFiltersType, JournalType } from "../types/journal"
import { usersApi } from "@/lib/api/users"
import type { UserResponse } from "@/lib/api/users"

interface JournalFiltersProps {
  filters: JournalFiltersType | undefined
  onFiltersChange: (filters: JournalFiltersType) => void
}

export function JournalFilters({ filters, onFiltersChange }: JournalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [type, setType] = useState<JournalType | "all">(filters?.type || "all")
  const [status, setStatus] = useState<string>(
    filters?.isCompleted !== undefined
      ? filters.isCompleted
        ? "completed"
        : "incomplete"
      : "all"
  )
  const [assignedToId, setAssignedToId] = useState<string>(filters?.assignedToId || "")
  const [createdById, setCreatedById] = useState<string>(filters?.createdById || "")
  const [startDate, setStartDate] = useState<string>(
    filters?.startDate ? filters.startDate.split("T")[0] : ""
  )
  const [endDate, setEndDate] = useState<string>(
    filters?.endDate ? filters.endDate.split("T")[0] : ""
  )
  const [nearDeadlines, setNearDeadlines] = useState<boolean>(filters?.nearDeadlines || false)
  const [overdue, setOverdue] = useState<boolean>(filters?.overdue || false)
  const [search, setSearch] = useState<string>(filters?.search || "")

  const [users, setUsers] = useState<UserResponse[]>([])
  const [creators, setCreators] = useState<UserResponse[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  // Sync local state with props when filters change externally
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

      // Check if any value actually changed
      const hasChanges =
        type !== newType ||
        status !== newStatus ||
        assignedToId !== newAssignedToId ||
        createdById !== newCreatedById ||
        startDate !== newStartDate ||
        endDate !== newEndDate ||
        nearDeadlines !== newNearDeadlines ||
        overdue !== newOverdue ||
        search !== newSearch

      if (hasChanges) {
        // Mark as internal update to prevent triggering applyFilters
        isInternalUpdate.current = true
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const userList = await usersApi.getAll()
      setUsers(userList)
      setCreators(userList)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Use ref to prevent infinite loops from external filter updates
  const isInternalUpdate = useRef(false)
  const isMounted = useRef(false)
  const onFiltersChangeRef = useRef(onFiltersChange)
  const lastAppliedFiltersRef = useRef<string>("")

  // Keep ref updated
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange
  }, [onFiltersChange])

  const applyFilters = useCallback(() => {
    // Skip if this is an internal update (from sync effect)
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }

    // Skip on initial mount
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

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
        // Don't apply if invalid range
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

    // Create a string representation to compare
    const filtersKey = JSON.stringify(newFilters)
    
    // Only apply if filters actually changed
    if (lastAppliedFiltersRef.current !== filtersKey) {
      lastAppliedFiltersRef.current = filtersKey
      onFiltersChangeRef.current(newFilters)
    }
  }, [type, status, assignedToId, createdById, startDate, endDate, nearDeadlines, overdue, search])

  // Auto-apply filters when any filter changes (except search which is debounced)
  useEffect(() => {
    // Skip initial mount and internal updates
    if (isInternalUpdate.current) {
      return
    }
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    applyFilters()
  }, [type, status, assignedToId, createdById, startDate, endDate, nearDeadlines, overdue, applyFilters])

  // Debounced search
  useEffect(() => {
    if (isInternalUpdate.current) {
      return
    }
    if (!isMounted.current) {
      return
    }
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, applyFilters])

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

  const hasActiveFilters =
    type !== "all" ||
    status !== "all" ||
    assignedToId !== "" ||
    createdById !== "" ||
    startDate !== "" ||
    endDate !== "" ||
    nearDeadlines ||
    overdue ||
    search.trim() !== ""

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-3 sm:p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            {hasActiveFilters && (
              <span className="h-2 w-2 rounded-full bg-primary"></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 sm:px-3">
                <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline text-xs">Clear</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            {/* Search - Always visible at top */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Search className="h-4 w-4 text-muted-foreground" />
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title or content..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Basic Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">Basic Filters</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as JournalType | "all")}
                  >
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
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => {
                      setStatus(value)
                      if (overdue && value !== "all") {
                        setOverdue(false)
                      }
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Status filter disabled when Overdue is selected
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* User Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">User Filters</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Assigned To</Label>
                  <Select
                    value={assignedToId || "all"}
                    onValueChange={(value) => setAssignedToId(value === "all" ? "" : value)}
                  >
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
                  <Label className="text-sm">Created By</Label>
                  <Select
                    value={createdById || "all"}
                    onValueChange={(value) => setCreatedById(value === "all" ? "" : value)}
                  >
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
              </div>
            </div>

            {/* Date Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground">Date Filters</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              {startDate && endDate && new Date(startDate) > new Date(endDate) && (
                <p className="text-xs text-destructive">Start date must be before end date</p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nearDeadlines"
                    checked={nearDeadlines}
                    onCheckedChange={(checked) => setNearDeadlines(checked as boolean)}
                  />
                  <Label htmlFor="nearDeadlines" className="text-sm cursor-pointer">
                    Near Deadlines (7 days)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={overdue}
                    onCheckedChange={(checked) => {
                      setOverdue(checked as boolean)
                      if (checked) {
                        setStatus("all")
                      }
                    }}
                  />
                  <Label htmlFor="overdue" className="text-sm cursor-pointer">
                    Overdue
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
