"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RevenueCharts } from "./RevenueCharts"
import type { RevenueAnalytics } from "../types/summary"
import type { IncomeSummary } from "../types/income"
import type { ExpenseSummary } from "../types/expense"

interface RevenueChartsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analytics: RevenueAnalytics | null
  incomeSummary: IncomeSummary | null
  expenseSummary: ExpenseSummary | null
  isLoading: boolean
}

export function RevenueChartsModal({
  open,
  onOpenChange,
  analytics,
  incomeSummary,
  expenseSummary,
  isLoading,
}: RevenueChartsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>Revenue Analytics</DialogTitle>
          <DialogDescription>Detailed revenue and analytics charts</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <RevenueCharts
            analytics={analytics}
            incomeSummary={incomeSummary}
            expenseSummary={expenseSummary}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
