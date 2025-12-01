export type IncomeCategory =
  | "SMM"
  | "Website"
  | "Ads"
  | "POS"
  | "Consultation"
  | "Freelancing"
  | "Wedding Video Invitation"
  | "Engagement Video Invitation"
  | "Wedding Card Invitation"
  | "Engagement Card Invitation"
  | "Anniversary Card Invitation"
  | "Anniversary Video Invitation"
  | "Birthday Wish Video"
  | "Birthday Wish Card"
  | "Birthday Video Invitation"
  | "Birthday Card Invitation"
  | "Other"

export interface Income {
  id: string
  amount: number
  category: IncomeCategory
  source: string
  description?: string
  date: string // ISO date string
  createdAt: string
  updatedAt: string
  // Advance payment and dues fields
  totalAmount?: number
  advanceAmount?: number
  dueAmount?: number
  dueDate?: string
  isDuePaid?: boolean
  duePaidDate?: string
}

export interface IncomeFilters {
  category?: IncomeCategory
  source?: string
  startDate?: string
  endDate?: string
  hasDues?: boolean
}

export interface OutstandingDue extends Income {
  daysOverdue?: number
  isOverdue?: boolean
}

export interface IncomeSummary {
  total: number
  monthly: number
  quarterly: number
  yearly: number
  byCategory: Record<IncomeCategory, number>
}
