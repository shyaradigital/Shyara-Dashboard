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
import { Checkbox } from "@/components/ui/checkbox"
import type { Income, IncomeCategory } from "../types/income"

interface AddIncomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => void | Promise<boolean>
  editingIncome?: Income | null
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  "SMM",
  "Website",
  "Ads",
  "POS",
  "Consultation",
  "Freelancing",
  "Wedding Video Invitation",
  "Engagement Video Invitation",
  "Wedding Card Invitation",
  "Engagement Card Invitation",
  "Anniversary Card Invitation",
  "Anniversary Video Invitation",
  "Birthday Wish Video",
  "Birthday Wish Card",
  "Birthday Video Invitation",
  "Birthday Card Invitation",
  "Other",
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

export function AddIncomeModal({ open, onOpenChange, onSave, editingIncome }: AddIncomeModalProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<IncomeCategory>("SMM")
  const [source, setSource] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(getTodayDateIST())
  const [hasAdvanceAndDues, setHasAdvanceAndDues] = useState(false)
  const [totalAmount, setTotalAmount] = useState("")
  const [advanceAmount, setAdvanceAmount] = useState("")
  const [dueAmount, setDueAmount] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (open) {
      if (editingIncome) {
        setAmount(editingIncome.amount.toString())
        setCategory(editingIncome.category)
        setSource(editingIncome.source)
        setDescription(editingIncome.description || "")
        setDate(editingIncome.date.split("T")[0])
        
        // Handle advance/due fields
        const hasDues = editingIncome.totalAmount !== undefined || 
                       (editingIncome.dueAmount !== undefined && editingIncome.dueAmount > 0)
        setHasAdvanceAndDues(hasDues)
        if (hasDues) {
          setTotalAmount(editingIncome.totalAmount?.toString() || editingIncome.amount.toString())
          setAdvanceAmount(editingIncome.advanceAmount?.toString() || editingIncome.amount.toString())
          setDueAmount(editingIncome.dueAmount?.toString() || "0")
          setDueDate(editingIncome.dueDate ? editingIncome.dueDate.split("T")[0] : "")
        } else {
          setTotalAmount("")
          setAdvanceAmount("")
          setDueAmount("")
          setDueDate("")
        }
      } else {
        // Always reset to today's date when opening for new entry
        resetForm()
      }
    }
  }, [editingIncome, open])

  const resetForm = () => {
    setAmount("")
    setCategory("SMM")
    setSource("")
    setDescription("")
    setDate(getTodayDateIST())
    setHasAdvanceAndDues(false)
    setTotalAmount("")
    setAdvanceAmount("")
    setDueAmount("")
    setDueDate("")
  }

  // Calculate due amount when total or advance changes
  useEffect(() => {
    if (hasAdvanceAndDues && totalAmount && advanceAmount) {
      const total = parseFloat(totalAmount) || 0
      const advance = parseFloat(advanceAmount) || 0
      const due = Math.max(0, total - advance)
      setDueAmount(due.toFixed(2))
    }
  }, [hasAdvanceAndDues, totalAmount, advanceAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!source || !date) {
      return
    }

    // Validation for advance/due mode
    if (hasAdvanceAndDues) {
      if (!totalAmount) {
        return
      }
      const totalValue = parseFloat(totalAmount)
      const advanceValue = parseFloat(advanceAmount) || 0
      const dueValue = parseFloat(dueAmount) || 0
      
      if (isNaN(totalValue) || totalValue <= 0) {
        return
      }
      
      // Validate that advance + due = total (with small tolerance for floating point)
      if (Math.abs(advanceValue + dueValue - totalValue) > 0.01) {
        return
      }

      const result = await onSave({
        amount: advanceValue, // Use advance as the main amount for backward compatibility
        category,
        source: source.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        totalAmount: totalValue,
        advanceAmount: advanceValue,
        dueAmount: dueValue,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        isDuePaid: dueValue === 0,
      })

      if (result === true || result === undefined) {
        resetForm()
        onOpenChange(false)
      }
    } else {
      // Standard mode (backward compatible)
      if (!amount) {
        return
      }

      const amountValue = parseFloat(amount)
      if (isNaN(amountValue) || amountValue <= 0) {
        return
      }

      const result = await onSave({
        amount: amountValue,
        category,
        source: source.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
      })

      if (result === true || result === undefined) {
        resetForm()
        onOpenChange(false)
      }
    }
    // Error is handled by the hook with toast notification
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[650px] flex-col overflow-hidden sm:rounded-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>{editingIncome ? "Edit Income" : "Add New Income"}</DialogTitle>
          <DialogDescription>
            {editingIncome
              ? "Update the income entry details below."
              : "Add a new income entry to track your revenue."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid gap-4 py-4 pr-1">
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
                onValueChange={(value) => setCategory(value as IncomeCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                placeholder="e.g., Client Name"
                value={source}
                onChange={(e) => setSource(e.target.value)}
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
            
            {/* Advance Payment and Dues Section */}
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Checkbox
                id="hasAdvanceAndDues"
                checked={hasAdvanceAndDues}
                onCheckedChange={(checked) => {
                  setHasAdvanceAndDues(checked === true)
                  if (checked) {
                    // Pre-fill with current amount if available
                    if (amount) {
                      setTotalAmount(amount)
                      setAdvanceAmount(amount)
                      setDueAmount("0")
                    }
                  } else {
                    setTotalAmount("")
                    setAdvanceAmount("")
                    setDueAmount("")
                    setDueDate("")
                  }
                }}
              />
              <Label htmlFor="hasAdvanceAndDues" className="text-sm font-normal cursor-pointer">
                Has advance payment and dues
              </Label>
            </div>

            {hasAdvanceAndDues && (
              <div className="grid gap-4 pl-6 border-l-2 border-muted">
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">Total Amount *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => {
                      setTotalAmount(e.target.value)
                      // Auto-update advance if it was equal to old total
                      if (advanceAmount === totalAmount) {
                        setAdvanceAmount(e.target.value)
                      }
                    }}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="advanceAmount">Advance Amount *</Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueAmount">Due Amount</Label>
                  <Input
                    id="dueAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dueAmount}
                    onChange={(e) => setDueAmount(e.target.value)}
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calculated automatically (Total - Advance)
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingIncome ? "Update" : "Add"} Income</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
