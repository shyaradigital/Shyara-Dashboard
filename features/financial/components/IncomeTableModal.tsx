"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IncomeTable } from "./IncomeTable"
import type { Income, IncomeCategory } from "../types/income"

interface IncomeTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incomes: Income[]
  isLoading: boolean
  onAdd: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
  onFilterChange: (filters: { category?: IncomeCategory }) => void
}

export function IncomeTableModal({
  open,
  onOpenChange,
  incomes,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  onFilterChange,
}: IncomeTableModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>Income List</DialogTitle>
          <DialogDescription>View and manage all income entries</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <IncomeTable
            incomes={incomes}
            isLoading={isLoading}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onFilterChange={onFilterChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
