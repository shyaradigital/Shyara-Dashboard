"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BalanceSheetView } from "./BalanceSheetView"
import type { BalanceSheet } from "../types/summary"

interface BalanceSheetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balanceSheet: BalanceSheet | null
  isLoading: boolean
}

export function BalanceSheetModal({
  open,
  onOpenChange,
  balanceSheet,
  isLoading,
}: BalanceSheetModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>Balance Sheet</DialogTitle>
          <DialogDescription>Assets, liabilities, and equity overview</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <BalanceSheetView balanceSheet={balanceSheet} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
