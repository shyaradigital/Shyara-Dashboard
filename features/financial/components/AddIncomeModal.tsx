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
import { toast } from "@/lib/utils/toast"

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
        
        // Handle advance/due fields - check if income has dues structure
        // An income has dues if: totalAmount exists OR (dueAmount exists and > 0) OR advanceAmount exists and differs from amount
        const hasDues = editingIncome.totalAmount !== undefined && editingIncome.totalAmount !== null ||
                       (editingIncome.dueAmount !== undefined && editingIncome.dueAmount !== null && editingIncome.dueAmount > 0) ||
                       (editingIncome.advanceAmount !== undefined && editingIncome.advanceAmount !== null && 
                        Math.abs(editingIncome.advanceAmount - editingIncome.amount) > 0.01)
        
        setHasAdvanceAndDues(hasDues)
        
        if (hasDues) {
          // If totalAmount exists, use it; otherwise calculate from advance + due or use amount as total
          const total = editingIncome.totalAmount ?? 
                       (editingIncome.advanceAmount && editingIncome.dueAmount 
                        ? editingIncome.advanceAmount + editingIncome.dueAmount 
                        : editingIncome.amount)
          const advance = editingIncome.advanceAmount ?? editingIncome.amount
          const due = editingIncome.dueAmount ?? 0
          
          setTotalAmount(total.toString())
          setAdvanceAmount(advance.toString())
          setDueAmount(due.toString())
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
    } else {
      // Reset form when modal closes
      resetForm()
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
      if (!totalAmount || !advanceAmount) {
        toast.error("Total Amount and Advance Amount are required when using advance/dues mode")
        return
      }
      const totalValue = parseFloat(totalAmount)
      const advanceValue = parseFloat(advanceAmount) || 0
      const dueValue = parseFloat(dueAmount) || 0
      
      if (isNaN(totalValue) || totalValue <= 0) {
        toast.error("Total Amount must be greater than 0")
        return
      }
      
      if (isNaN(advanceValue) || advanceValue < 0) {
        toast.error("Advance Amount must be a valid non-negative number")
        return
      }
      
      if (advanceValue > totalValue) {
        toast.error("Advance Amount cannot be greater than Total Amount")
        return
      }
      
      // Validate that advance + due = total (with small tolerance for floating point)
      if (Math.abs(advanceValue + dueValue - totalValue) > 0.01) {
        toast.error("Advance Amount + Due Amount must equal Total Amount")
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
        // Note: isDuePaid is calculated by the backend based on dueAmount, so we don't send it
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
      <DialogContent 
        className="flex max-h-[95vh] w-[95vw] max-w-[650px] flex-col overflow-hidden p-0 sm:max-w-[650px] sm:rounded-lg [&>button]:z-10"
        style={{
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxHeight: '95vh',
          marginTop: '0',
          marginBottom: '0',
        }}
      >
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>{editingIncome ? "Edit Income" : "Add New Income"}</DialogTitle>
          <DialogDescription>
            {editingIncome
              ? "Update the income entry details below."
              : "Add a new income entry to track your revenue."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-6">
            <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">
                {hasAdvanceAndDues ? "Advance Amount (Initial Payment)" : "Amount"} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  // If in advance/dues mode and total amount isn't set yet, update advance amount too
                  if (hasAdvanceAndDues && !totalAmount && e.target.value) {
                    setAdvanceAmount(e.target.value)
                  }
                }}
                required={!hasAdvanceAndDues}
                disabled={hasAdvanceAndDues}
                className={hasAdvanceAndDues ? "bg-muted" : ""}
              />
              {hasAdvanceAndDues && (
                <p className="text-xs text-muted-foreground">
                  Use the Advance Amount field below to set the initial payment
                </p>
              )}
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
                disabled={editingIncome?.isDuePaid}
                onCheckedChange={(checked) => {
                  // Prevent unchecking if dues are already paid
                  if (editingIncome?.isDuePaid) {
                    return
                  }
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
              <Label 
                htmlFor="hasAdvanceAndDues" 
                className={`text-sm font-normal ${editingIncome?.isDuePaid ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                Has advance payment and dues
                {editingIncome?.isDuePaid && (
                  <span className="ml-2 text-xs text-muted-foreground">(Dues already paid - cannot modify)</span>
                )}
              </Label>
            </div>

            {hasAdvanceAndDues && (
              <div className="grid gap-4 pl-6 border-l-2 border-muted">
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">Total Amount (Project/Transaction Total) *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => {
                      // Prevent editing if dues are already paid
                      if (editingIncome?.isDuePaid) {
                        return
                      }
                      const newTotal = e.target.value
                      setTotalAmount(newTotal)
                      // If advance was equal to old total, keep it equal to new total
                      if (totalAmount && advanceAmount === totalAmount) {
                        setAdvanceAmount(newTotal)
                      }
                    }}
                    required
                    disabled={editingIncome?.isDuePaid}
                    className={editingIncome?.isDuePaid ? "bg-muted" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    The total amount for this project or transaction
                    {editingIncome?.isDuePaid && " (Cannot modify - dues already paid)"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="advanceAmount">Advance Amount (Received Amount) *</Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={advanceAmount}
                    onChange={(e) => {
                      // Prevent editing if dues are already paid
                      if (editingIncome?.isDuePaid) {
                        return
                      }
                      const newAdvance = e.target.value
                      setAdvanceAmount(newAdvance)
                      // Also update the main amount field for consistency
                      if (newAdvance) {
                        setAmount(newAdvance)
                      }
                    }}
                    required
                    disabled={editingIncome?.isDuePaid}
                    className={editingIncome?.isDuePaid ? "bg-muted" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    The amount already received (advance payment)
                    {editingIncome?.isDuePaid && " (Cannot modify - dues already paid)"}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueAmount">
                    Due Amount {editingIncome?.isDuePaid ? "(Paid)" : ""}
                  </Label>
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
                    Calculated automatically (Total - Advance). {editingIncome?.isDuePaid ? "This due has been marked as paid." : "This amount is still pending."}
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => {
                      // Prevent editing if dues are already paid
                      if (editingIncome?.isDuePaid) {
                        return
                      }
                      setDueDate(e.target.value)
                    }}
                    disabled={editingIncome?.isDuePaid}
                    className={editingIncome?.isDuePaid ? "bg-muted" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected payment date for the remaining due amount
                    {editingIncome?.isDuePaid && " (Cannot modify - dues already paid)"}
                  </p>
                </div>
              </div>
            )}
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t bg-background px-6 py-4">
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
