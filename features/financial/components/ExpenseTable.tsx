"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Expense, ExpenseCategory } from "../types/expense"
import { AddExpenseModal } from "./AddExpenseModal"

interface ExpenseTableProps {
  expenses: Expense[]
  isLoading: boolean
  onAdd: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<Omit<Expense, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
  onFilterChange: (filters: { category?: ExpenseCategory }) => void
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Salaries",
  "Subscriptions",
  "Rent",
  "Software",
  "Hardware",
  "Travel",
  "Utilities",
  "Misc",
]

export function ExpenseTable({
  expenses,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  onFilterChange,
}: ExpenseTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleFilterChange = (category: string) => {
    setCategoryFilter(category)
    onFilterChange({
      category: category === "all" ? undefined : (category as ExpenseCategory),
    })
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleSave = (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (editingExpense) {
      onUpdate(editingExpense.id, expense)
    } else {
      onAdd(expense)
    }
    setEditingExpense(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-3">
      <div className="mb-2 mt-4 flex w-full flex-col gap-3 md:mt-6">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button onClick={handleAdd} className="w-full flex-shrink-0 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        <div className="w-full min-w-[150px] sm:w-auto">
          <Select value={categoryFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border shadow-sm">
        <div className="max-h-[600px] w-full overflow-x-auto overflow-y-auto">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
              <TableRow className="border-b hover:bg-muted/50">
                <TableHead className="h-10 font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Purpose</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No expense entries found. Add your first expense entry to get started.
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense, index) => (
                  <TableRow
                    key={expense.id}
                    className={`border-b transition-colors hover:bg-muted/60 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <TableCell className="py-2.5 font-medium">{formatDate(expense.date)}</TableCell>
                    <TableCell className="py-2.5 font-medium">{expense.purpose}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 font-semibold text-red-600">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate py-2.5 text-sm text-muted-foreground sm:max-w-none">
                      {expense.description || "-"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this expense entry?")) {
                              onDelete(expense.id)
                            }
                          }}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AddExpenseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        editingExpense={editingExpense}
      />
    </div>
  )
}
