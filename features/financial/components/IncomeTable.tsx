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
import { Pencil, Trash2, Plus, CheckCircle2 } from "lucide-react"
import type { Income, IncomeCategory } from "../types/income"
import { AddIncomeModal } from "./AddIncomeModal"

interface IncomeTableProps {
  incomes: Income[]
  isLoading: boolean
  onAdd: (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<Omit<Income, "id" | "createdAt">>) => void
  onDelete: (id: string) => void
  onFilterChange: (filters: { category?: IncomeCategory }) => void
  onMarkDuePaid?: (id: string) => Promise<void>
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

export function IncomeTable({
  incomes,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  onFilterChange,
  onMarkDuePaid,
}: IncomeTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleFilterChange = (category: string) => {
    setCategoryFilter(category)
    onFilterChange({
      category: category === "all" ? undefined : (category as IncomeCategory),
    })
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingIncome(null)
    setIsModalOpen(true)
  }

  const handleSave = (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    if (editingIncome) {
      onUpdate(editingIncome.id, income)
    } else {
      onAdd(income)
    }
    setEditingIncome(null)
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

  const getDueStatus = (income: Income) => {
    if (!income.dueAmount || income.dueAmount === 0) {
      return null
    }
    
    if (income.isDuePaid) {
      return { label: "Paid", variant: "default" as const, color: "bg-green-100 text-green-800" }
    }
    
    if (income.dueDate) {
      const dueDate = new Date(income.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return { 
          label: `${daysOverdue} days overdue`, 
          variant: "destructive" as const,
          color: "bg-red-100 text-red-800"
        }
      } else if (dueDate.getTime() === today.getTime()) {
        return { label: "Due today", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" }
      } else {
        const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return { label: `Due in ${daysUntil} days`, variant: "secondary" as const, color: "bg-blue-100 text-blue-800" }
      }
    }
    
    return { label: "Unpaid", variant: "secondary" as const, color: "bg-gray-100 text-gray-800" }
  }

  return (
    <div className="space-y-3">
      <div className="mb-2 mt-4 flex w-full flex-col gap-3 md:mt-6">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button onClick={handleAdd} className="w-full flex-shrink-0 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Income
          </Button>
        </div>
        <div className="w-full min-w-[150px] sm:w-auto">
          <Select value={categoryFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {INCOME_CATEGORIES.map((cat) => (
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
                <TableHead className="font-semibold">Source</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Dues Status</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="w-[100px] text-right font-semibold sm:w-auto">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : incomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No income entries found. Add your first income entry to get started.
                  </TableCell>
                </TableRow>
              ) : (
                incomes.map((income, index) => (
                  <TableRow
                    key={income.id}
                    className={`border-b transition-colors hover:bg-muted/60 ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <TableCell className="py-2.5 font-medium">{formatDate(income.date)}</TableCell>
                    <TableCell className="py-2.5 font-medium">{income.source}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className="text-xs font-normal">
                        {income.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                      {income.totalAmount && income.totalAmount !== income.amount && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          / {formatCurrency(income.totalAmount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {(() => {
                        const dueStatus = getDueStatus(income)
                        if (!dueStatus) {
                          return <span className="text-xs text-muted-foreground">-</span>
                        }
                        return (
                          <div className="flex flex-col gap-1">
                            <Badge variant={dueStatus.variant} className={`text-xs ${dueStatus.color}`}>
                              {dueStatus.label}
                            </Badge>
                            {income.dueAmount && income.dueAmount > 0 && (
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatCurrency(income.dueAmount)} due
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate py-2.5 text-sm text-muted-foreground sm:max-w-none">
                      {income.description || "-"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        {onMarkDuePaid && 
                         income.dueAmount && 
                         income.dueAmount > 0 && 
                         !income.isDuePaid && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={async () => {
                              if (confirm("Mark this due as paid?")) {
                                await onMarkDuePaid(income.id)
                              }
                            }}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-green-600 hover:bg-green-50"
                            aria-label="Mark due as paid"
                            title="Mark due as paid"
                          >
                            <CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(income)}
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          aria-label="Edit income"
                        >
                          <Pencil className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this income entry?")) {
                              onDelete(income.id)
                            }
                          }}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete income"
                        >
                          <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
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

      <AddIncomeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSave}
        editingIncome={editingIncome}
      />
    </div>
  )
}
