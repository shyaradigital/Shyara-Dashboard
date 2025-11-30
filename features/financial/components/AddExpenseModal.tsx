"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Expense, ExpenseCategory } from "../types/expense"

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void
  editingExpense?: Expense | null
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

// Helper function to get today's date in IST (YYYY-MM-DD format)
const getTodayDateIST = (): string => {
  const now = new Date()
  // Get current time in IST (UTC+5:30)
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istTime = new Date(utcTime + istOffset)

  const year = istTime.getUTCFullYear()
  const month = String(istTime.getUTCMonth() + 1).padStart(2, "0")
  const day = String(istTime.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function AddExpenseModal({
  open,
  onOpenChange,
  onSave,
  editingExpense,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("Misc")
  const [purpose, setPurpose] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(getTodayDateIST())

  useEffect(() => {
    if (open) {
      if (editingExpense) {
        setAmount(editingExpense.amount.toString())
        setCategory(editingExpense.category)
        setPurpose(editingExpense.purpose)
        setDescription(editingExpense.description || "")
        setDate(editingExpense.date.split("T")[0])
      } else {
        // Always reset to today's date when opening for new entry
        resetForm()
      }
    }
  }, [editingExpense, open])

  const resetForm = () => {
    setAmount("")
    setCategory("Misc")
    setPurpose("")
    setDescription("")
    setDate(getTodayDateIST())
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !purpose || !date) {
      return
    }

    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      return
    }

    onSave({
      amount: amountValue,
      category,
      purpose: purpose.trim(),
      description: description.trim() || undefined,
      date: new Date(date).toISOString(),
    })

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {editingExpense
              ? "Update the expense entry details below."
              : "Add a new expense entry to track your spending."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as ExpenseCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Input
                id="purpose"
                placeholder="e.g., Office supplies"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingExpense ? "Update" : "Add"} Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
