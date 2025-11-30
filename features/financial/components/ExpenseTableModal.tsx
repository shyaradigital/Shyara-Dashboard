"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExpenseTable } from "./ExpenseTable"
import type { Expense, ExpenseCategory } from "../types/expense"

interface ExpenseTableModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenses: Expense[]
  isLoading: boolean
  onAdd: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
  onFilterChange: (filters: { category?: ExpenseCategory }) => void
}

export function ExpenseTableModal({
  open,
  onOpenChange,
  expenses,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  onFilterChange,
}: ExpenseTableModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw] sm:rounded-lg">
        <DialogHeader className="shrink-0 border-b px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle>Expense List</DialogTitle>
          <DialogDescription>View and manage all expense entries</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <ExpenseTable
            expenses={expenses}
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
