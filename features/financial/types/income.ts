export type IncomeCategory =
  | "SMM"
  | "Website"
  | "Ads"
  | "POS"
  | "Consultation"
  | "Freelancing"
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
}

export interface IncomeFilters {
  category?: IncomeCategory
  source?: string
  startDate?: string
  endDate?: string
}

export interface IncomeSummary {
  total: number
  monthly: number
  quarterly: number
  yearly: number
  byCategory: Record<IncomeCategory, number>
}
