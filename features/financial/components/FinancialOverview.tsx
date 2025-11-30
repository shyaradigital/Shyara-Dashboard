"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { FinancialSummary } from "../types/summary"

interface FinancialOverviewProps {
  summary: FinancialSummary | null
  isLoading: boolean
}

export function FinancialOverview({ summary, isLoading }: FinancialOverviewProps) {
  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return "₹0.00"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div
        className="grid w-full max-w-full gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const balanceColor = summary.totalBalance >= 0 ? "text-green-600" : "text-red-600"

  return (
    <div
      className="grid w-full max-w-full gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
    >
      <Card className="h-full border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balanceColor} mb-2`}>
            {formatCurrency(summary.totalBalance)}
          </div>
          <p className="text-xs font-medium text-muted-foreground">Income - Expenses</p>
        </CardContent>
      </Card>

      <Card className="h-full border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">This Month</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.incomeSummary.monthly)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-muted-foreground">This Month</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.expenseSummary.monthly)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          {summary.totalBalance >= 0 ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balanceColor} mb-2`}>
            {formatCurrency(summary.totalBalance)}
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {summary.totalBalance >= 0 ? "Positive" : "Negative"} balance
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
