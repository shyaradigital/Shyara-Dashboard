"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useIncome } from "@/features/financial/hooks/useIncome"
import { useExpenses } from "@/features/financial/hooks/useExpenses"
import { useFinancialSummary } from "@/features/financial/hooks/useFinancialSummary"
import { FinancialOverview } from "@/features/financial/components/FinancialOverview"
import { AddIncomeModal } from "@/features/financial/components/AddIncomeModal"
import { AddExpenseModal } from "@/features/financial/components/AddExpenseModal"
import { IncomeTable } from "@/features/financial/components/IncomeTable"
import { ExpenseTable } from "@/features/financial/components/ExpenseTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, List } from "lucide-react"

export default function FinancialPage() {
  const { checkPermission } = useAuth()
  const {
    incomes,
    isLoading: incomeLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    updateFilters: updateIncomeFilters,
  } = useIncome()

  const {
    expenses,
    isLoading: expenseLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    updateFilters: updateExpenseFilters,
  } = useExpenses()

  const {
    summary: financialSummary,
    isLoading: summaryLoading,
    refresh: refreshSummary,
  } = useFinancialSummary()

  // Modal states (only for Add Income/Expense)
  const [addIncomeModalOpen, setAddIncomeModalOpen] = useState(false)
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false)

  // Refs for smooth scrolling
  const overviewRef = useRef<HTMLDivElement>(null)
  const incomeListRef = useRef<HTMLDivElement>(null)
  const expenseListRef = useRef<HTMLDivElement>(null)

  // Active section state for scroll-spy
  const [activeSection, setActiveSection] = useState<string>("overview")

  // Smooth scroll functions
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, sectionId: string) => {
    setActiveSection(sectionId)
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Scroll-spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: "overview", ref: overviewRef },
        { id: "income", ref: incomeListRef },
        { id: "expense", ref: expenseListRef },
      ]

      const scrollPosition = window.scrollY + 100 // Offset for sticky navbar

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.ref.current) {
          const offsetTop = section.ref.current.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Refresh summary when income or expenses change
  useEffect(() => {
    refreshSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length])

  // Check permissions
  const canView = checkPermission("finances:view")
  const canEdit = checkPermission("finances:edit")

  // Handle add income with modal close
  const handleAddIncome = async (income: Parameters<typeof addIncome>[0]) => {
    const success = await addIncome(income)
    if (success) {
      setAddIncomeModalOpen(false)
    }
    // Error is handled by the hook with toast notification
  }

  // Handle add expense with modal close
  const handleAddExpense = async (expense: Parameters<typeof addExpense>[0]) => {
    const success = await addExpense(expense)
    if (success) {
      setAddExpenseModalOpen(false)
    }
    // Error is handled by the hook with toast notification
  }

  if (!canView) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to view financial data.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
        <p className="text-muted-foreground">
          Manage your income, expenses, and track your financial health.
        </p>
      </div>

      {/* Sticky Sub-Navbar */}
      <div className="sticky top-16 z-30 box-border w-full max-w-full overflow-x-hidden border-b border-border bg-background/95 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full max-w-full flex-wrap gap-2 px-4 py-3 lg:px-6">
          {canEdit && (
            <>
              <Button
                onClick={() => setAddIncomeModalOpen(true)}
                size="sm"
                className="shrink-0 gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Income</span>
                <span className="sm:hidden">Income</span>
              </Button>
              <Button
                onClick={() => setAddExpenseModalOpen(true)}
                size="sm"
                variant="outline"
                className="shrink-0 gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Expense</span>
              </Button>
              <Button
                onClick={() => scrollToSection(incomeListRef, "income")}
                size="sm"
                variant={activeSection === "income" ? "default" : "outline"}
                className={`shrink-0 gap-2 ${
                  activeSection === "income" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Income List</span>
                <span className="sm:hidden">Income</span>
              </Button>
              <Button
                onClick={() => scrollToSection(expenseListRef, "expense")}
                size="sm"
                variant={activeSection === "expense" ? "default" : "outline"}
                className={`shrink-0 gap-2 ${
                  activeSection === "expense" ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Expense List</span>
                <span className="sm:hidden">Expense</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Section */}
      <section ref={overviewRef} className="scroll-mt-24 space-y-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">Quick summary of your financial status</p>
        </div>
        <FinancialOverview summary={financialSummary} isLoading={summaryLoading} />
      </section>

      {/* Income Management Section */}
      {canEdit && (
        <section ref={incomeListRef} className="scroll-mt-24 space-y-3 border-t pt-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Income Management</h2>
            <p className="text-sm text-muted-foreground">View and manage all your income entries</p>
          </div>
          <IncomeTable
            incomes={incomes}
            isLoading={incomeLoading}
            onAdd={addIncome}
            onUpdate={updateIncome}
            onDelete={deleteIncome}
            onFilterChange={updateIncomeFilters}
          />
        </section>
      )}

      {/* Expense Management Section */}
      {canEdit && (
        <section ref={expenseListRef} className="scroll-mt-24 space-y-3 border-t pt-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Expense Management</h2>
            <p className="text-sm text-muted-foreground">
              View and manage all your expense entries
            </p>
          </div>
          <ExpenseTable
            expenses={expenses}
            isLoading={expenseLoading}
            onAdd={addExpense}
            onUpdate={updateExpense}
            onDelete={deleteExpense}
            onFilterChange={updateExpenseFilters}
          />
        </section>
      )}

      {/* Read-only view for users without edit permission */}
      {!canEdit && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
            <p className="text-sm text-muted-foreground">View-only financial summary</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Income</CardTitle>
                <CardDescription>View-only mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {financialSummary
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(financialSummary.totalIncome)
                      : "₹0.00"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Income: {incomes.length} entries
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>View-only mode</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-red-600">
                    {financialSummary
                      ? new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(financialSummary.totalExpenses)
                      : "₹0.00"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Expenses: {expenses.length} entries
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Modals - Only Add Income/Expense */}
      {canEdit && (
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
    </div>
  )
}
