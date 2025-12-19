"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import type { OutstandingDue } from "../types/income"
import { incomeService } from "../services/incomeService"
import { toast } from "@/lib/utils/toast"

interface DuesSectionProps {
  onMarkDuePaid?: (id: string) => Promise<void>
}

export function DuesSection({ onMarkDuePaid }: DuesSectionProps) {
  const [dues, setDues] = useState<OutstandingDue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadDues = async () => {
    setIsLoading(true)
    try {
      const outstandingDues = await incomeService.getOutstandingDues()
      
      // Calculate days overdue and status
      const duesWithStatus: OutstandingDue[] = outstandingDues.map((due) => {
        let daysOverdue: number | undefined
        let isOverdue = false
        
        if (due.dueDate) {
          const dueDate = new Date(due.dueDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          dueDate.setHours(0, 0, 0, 0)
          
          if (dueDate < today) {
            daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
            isOverdue = true
          }
        }
        
        return {
          ...due,
          daysOverdue,
          isOverdue,
        }
      })
      
      // Sort: overdue first, then by due date
      duesWithStatus.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1
        if (!a.isOverdue && b.isOverdue) return 1
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        return 0
      })
      
      setDues(duesWithStatus)
    } catch (error) {
      console.error("Error loading dues:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load outstanding dues"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDues()
    
    // Listen for financial data changes to auto-refresh
    const handleFinancialDataChange = () => {
      loadDues()
    }
    
    window.addEventListener("financial-data-changed", handleFinancialDataChange)
    
    return () => {
      window.removeEventListener("financial-data-changed", handleFinancialDataChange)
    }
  }, [])

  const handleMarkAsPaid = async (id: string) => {
    try {
      if (onMarkDuePaid) {
        await onMarkDuePaid(id)
        // The callback should handle the refresh, but we'll refresh here too as a safety measure
        await loadDues()
      } else {
        await incomeService.markDueAsPaid(id)
        toast.success("Due marked as paid successfully")
        await loadDues()
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent("financial-data-changed"))
      }
    } catch (error) {
      console.error("Error marking due as paid:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to mark due as paid"
      toast.error(errorMessage)
    }
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

  const totalOutstanding = dues.reduce((sum, due) => sum + (due.dueAmount || 0), 0)
  const overdueDues = dues.filter((due) => due.isOverdue)
  const upcomingDues = dues.filter((due) => !due.isOverdue)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Outstanding Dues</CardTitle>
            <CardDescription>Track all pending payments from clients</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg font-semibold">
            {formatCurrency(totalOutstanding)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading dues...</div>
        ) : dues.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No outstanding dues. All payments are up to date!
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground">Total Outstanding</div>
                <div className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Overdue
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(overdueDues.reduce((sum, due) => sum + (due.dueAmount || 0), 0))}
                </div>
                <div className="text-xs text-muted-foreground">{overdueDues.length} entries</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Upcoming
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(upcomingDues.reduce((sum, due) => sum + (due.dueAmount || 0), 0))}
                </div>
                <div className="text-xs text-muted-foreground">{upcomingDues.length} entries</div>
              </div>
            </div>

            {/* Dues Table */}
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dues.map((due) => (
                    <TableRow key={due.id}>
                      <TableCell className="font-medium">{due.source}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{due.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(due.dueAmount || 0)}
                      </TableCell>
                      <TableCell>
                        {due.dueDate ? formatDate(due.dueDate) : "-"}
                      </TableCell>
                      <TableCell>
                        {due.isOverdue ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {due.daysOverdue} days overdue
                          </Badge>
                        ) : due.dueDate ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Upcoming
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No due date</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Mark ${formatCurrency(due.dueAmount || 0)} from ${due.source} as paid?`)) {
                              handleMarkAsPaid(due.id)
                            }
                          }}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Mark Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

