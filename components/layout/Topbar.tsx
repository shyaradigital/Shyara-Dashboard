"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useDateFilter } from "@/contexts/DateFilterContext"
import { useFinancialSummary } from "@/features/financial/hooks/useFinancialSummary"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LogOut, User, Plus, TrendingUp, Menu } from "lucide-react"
import { UserAvatar } from "./UserAvatar"
import { Button } from "@/components/ui/button"
import { AddIncomeModal } from "@/features/financial/components/AddIncomeModal"
import { AddExpenseModal } from "@/features/financial/components/AddExpenseModal"
import { useIncome } from "@/features/financial/hooks/useIncome"
import { useExpenses } from "@/features/financial/hooks/useExpenses"
import type { Income } from "@/features/financial/types/income"
import type { Expense } from "@/features/financial/types/expense"
import { cn } from "@/lib/utils"

interface TopbarProps {
  onMenuClick?: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout, checkPermission } = useAuth()
  const { dateFilter, setDateFilter } = useDateFilter()
  const canEditFinances = checkPermission("finances:edit")
  const canViewFinances = checkPermission("finances:view")

  // Financial data for snapshot (hooks must be called unconditionally)
  const financialData = useFinancialSummary()
  const incomeData = useIncome()
  const expenseData = useExpenses()

  // Only use data if user has permissions
  const financialSummary = canViewFinances || canEditFinances ? financialData.summary : null
  const financialLoading = canViewFinances || canEditFinances ? financialData.isLoading : false
  const addIncome = canEditFinances ? incomeData.addIncome : undefined
  const addExpense = canEditFinances ? expenseData.addExpense : undefined

  // Modal states
  const [addIncomeModalOpen, setAddIncomeModalOpen] = useState(false)
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)

  const getRoleInitial = (role: string): string => {
    if (role === "ADMIN") return "A"
    if (role === "MANAGER") return "M"
    // For custom roles, return first character
    return role[0]?.toUpperCase() || "?"
  }

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return "₹0"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getFinancialSnapshot = () => {
    if (!financialSummary || financialLoading) return null

    let revenue = 0
    let label = ""

    if (dateFilter === "monthly") {
      revenue = financialSummary.incomeSummary.monthly - financialSummary.expenseSummary.monthly
      label = "This Month"
    } else if (dateFilter === "quarterly") {
      revenue = financialSummary.incomeSummary.quarterly - financialSummary.expenseSummary.quarterly
      label = "This Quarter"
    } else {
      revenue = financialSummary.incomeSummary.yearly - financialSummary.expenseSummary.yearly
      label = "This Year"
    }

    return {
      label,
      value: formatCurrency(revenue),
      isPositive: revenue >= 0,
    }
  }

  const snapshot = getFinancialSnapshot()

  const handleAddIncome = async (income: Omit<Income, "id" | "createdAt" | "updatedAt">) => {
    if (addIncome) {
      const success = await addIncome(income)
      if (success) {
        setAddIncomeModalOpen(false)
      }
    }
  }

  const handleAddExpense = async (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (addExpense) {
      const success = await addExpense(expense)
      if (success) {
        setAddExpenseModalOpen(false)
      }
    }
  }

  if (!user) return null

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-md">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4 lg:px-6">
          {/* Left: Hamburger Menu (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Center: Dynamic Actions - Scrollable on Mobile */}
          <div className="scrollbar-hide flex min-h-[44px] min-w-0 flex-1 items-center gap-2 overflow-x-auto sm:min-h-0 sm:justify-center">
            {/* Quick Actions */}
            {canEditFinances && (
              <>
                <Button
                  size="sm"
                  onClick={() => setAddIncomeModalOpen(true)}
                  className="h-9 shrink-0 gap-1.5 whitespace-nowrap text-xs sm:h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Income</span>
                  <span className="sm:hidden">Income</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddExpenseModalOpen(true)}
                  className="h-9 shrink-0 gap-1.5 whitespace-nowrap text-xs sm:h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Expense</span>
                  <span className="sm:hidden">Expense</span>
                </Button>
              </>
            )}

            {/* Date Filter */}
            <Select
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as typeof dateFilter)}
            >
              <SelectTrigger className="h-9 w-[100px] shrink-0 text-xs sm:h-8 sm:w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

            {/* Financial Snapshot Chip */}
            {canViewFinances && snapshot && (
              <div
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-3",
                  snapshot.isPositive
                    ? "border border-primary/20 bg-primary/10 text-primary"
                    : "border border-destructive/20 bg-destructive/10 text-destructive"
                )}
              >
                <TrendingUp
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    snapshot.isPositive ? "text-primary" : "rotate-180 text-destructive"
                  )}
                />
                <span className="hidden font-semibold sm:inline">{snapshot.label}:</span>
                <span className="font-bold">{snapshot.value}</span>
              </div>
            )}
          </div>

          {/* Right: User Profile */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="-mx-2 -my-1.5 flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <UserAvatar name={user.name} size="md" />
                  <div className="hidden flex-col text-left leading-tight sm:flex">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span
                      title={user.role}
                      className={`w-fit cursor-help rounded-full px-2 py-[2px] text-[10px] font-medium uppercase ${
                        user.role === "ADMIN"
                          ? "border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {getRoleInitial(user.role)}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Modals */}
      {canEditFinances && (
        <>
          <AddIncomeModal
            open={addIncomeModalOpen}
            onOpenChange={setAddIncomeModalOpen}
            onSave={handleAddIncome}
          />
          <AddExpenseModal
            open={addExpenseModalOpen}
            onOpenChange={setAddExpenseModalOpen}
            onSave={handleAddExpense}
          />
        </>
      )}
    </>
  )
}
