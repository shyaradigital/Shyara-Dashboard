"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export type DateFilterType = "monthly" | "quarterly" | "yearly"

interface DateFilterContextType {
  dateFilter: DateFilterType
  setDateFilter: (filter: DateFilterType) => void
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined)

export function DateFilterProvider({ children }: { children: ReactNode }) {
  const [dateFilter, setDateFilter] = useState<DateFilterType>("monthly")

  return (
    <DateFilterContext.Provider value={{ dateFilter, setDateFilter }}>
      {children}
    </DateFilterContext.Provider>
  )
}

export function useDateFilter() {
  const context = useContext(DateFilterContext)
  if (context === undefined) {
    throw new Error("useDateFilter must be used within a DateFilterProvider")
  }
  return context
}
