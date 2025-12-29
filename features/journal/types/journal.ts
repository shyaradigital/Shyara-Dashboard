export type JournalType = "TASK" | "NOTE"

export interface Journal {
  id: string
  title: string
  content: string
  type: JournalType
  deadline?: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
  createdById: string
  assignedToId?: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
}

export interface CreateJournalData {
  title: string
  content: string
  type: JournalType
  deadline?: string
  assignedToId?: string
}

export interface UpdateJournalStatusData {
  isCompleted: boolean
}

export interface JournalFilters {
  type?: JournalType
  assignedToId?: string
  createdById?: string
  isCompleted?: boolean
  startDate?: string
  endDate?: string
  nearDeadlines?: boolean
  overdue?: boolean
  search?: string
}

