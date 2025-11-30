"use client"

import { useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Lightbulb,
  Clock,
  Wallet,
} from "lucide-react"
import { useFinancialSummary } from "@/features/financial/hooks/useFinancialSummary"
import { useIncome } from "@/features/financial/hooks/useIncome"
import { useExpenses } from "@/features/financial/hooks/useExpenses"
import { RevenueCharts } from "@/features/financial/components/RevenueCharts"
import { BalanceSheetView } from "@/features/financial/components/BalanceSheetView"
import { CategoryBreakdown } from "@/features/financial/components/CategoryBreakdown"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function DashboardPage() {
  const {
    summary: financialSummary,
    analytics,
    balanceSheet,
    isLoading: summaryLoading,
    refresh: refreshSummary,
  } = useFinancialSummary()

  const { incomes, summary: incomeSummary, isLoading: incomeLoading } = useIncome()

  const { expenses, summary: expenseSummary, isLoading: expenseLoading } = useExpenses()

  // Refresh summary when income or expenses change
  useEffect(() => {
    refreshSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length])

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return "₹0.00"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCurrencyWithDecimals = (amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return "₹0.00"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!financialSummary) {
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        netRevenue: 0,
        thisMonthRevenue: 0,
        thisMonthExpenses: 0,
        thisMonthNetRevenue: 0,
        profitMargin: 0,
        expenseRatio: 0,
      }
    }

    const totalRevenue = financialSummary.totalIncome
    const totalExpenses = financialSummary.totalExpenses
    const netRevenue = financialSummary.totalBalance
    const thisMonthRevenue = financialSummary.incomeSummary.monthly
    const thisMonthExpenses = financialSummary.expenseSummary.monthly
    const thisMonthNetRevenue = thisMonthRevenue - thisMonthExpenses

    const profitMargin = totalRevenue > 0 ? (netRevenue / totalRevenue) * 100 : 0
    const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalExpenses,
      netRevenue,
      thisMonthRevenue,
      thisMonthExpenses,
      thisMonthNetRevenue,
      profitMargin,
      expenseRatio,
    }
  }, [financialSummary])

  // Get recent activity (last 5 income and expense entries)
  const recentActivity = useMemo(() => {
    const sortedIncomes = [...incomes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((income) => ({
        type: "income" as const,
        id: income.id,
        date: income.date,
        amount: income.amount,
        category: income.category,
        description: income.source,
      }))

    const sortedExpenses = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((expense) => ({
        type: "expense" as const,
        id: expense.id,
        date: expense.date,
        amount: expense.amount,
        category: expense.category,
        description: expense.purpose,
      }))

    return [...sortedIncomes, ...sortedExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
  }, [incomes, expenses])

  // Calculate insights
  const insights = useMemo(() => {
    if (!financialSummary || !analytics) {
      return []
    }

    const insightsList: string[] = []

    // Expense change
    if (analytics.monthly.length >= 2) {
      const currentMonth = analytics.monthly[analytics.monthly.length - 1]
      const previousMonth = analytics.monthly[analytics.monthly.length - 2]
      if (previousMonth.expenses > 0) {
        const expenseChange =
          ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
        if (expenseChange < 0) {
          insightsList.push(
            `Expenses decreased by ${Math.abs(expenseChange).toFixed(1)}% since last month.`
          )
        } else if (expenseChange > 0) {
          insightsList.push(`Expenses increased by ${expenseChange.toFixed(1)}% since last month.`)
        }
      }
    }

    // Income growth
    if (analytics.growth.quarterly !== 0) {
      if (analytics.growth.quarterly > 0) {
        insightsList.push(`Income grew by ${analytics.growth.quarterly.toFixed(1)}% this quarter.`)
      } else {
        insightsList.push(
          `Income decreased by ${Math.abs(analytics.growth.quarterly).toFixed(1)}% this quarter.`
        )
      }
    }

    // Net revenue comparison
    if (analytics.monthly.length >= 2) {
      const currentMonth = analytics.monthly[analytics.monthly.length - 1]
      const previousMonth = analytics.monthly[analytics.monthly.length - 2]
      const currentNet = currentMonth.revenue
      const previousNet = previousMonth.revenue
      if (previousNet !== 0) {
        const netChange = ((currentNet - previousNet) / Math.abs(previousNet)) * 100
        if (netChange > 0) {
          insightsList.push(`Net revenue is up ${netChange.toFixed(1)}% compared to last month.`)
        } else if (netChange < 0) {
          insightsList.push(
            `Net revenue is down ${Math.abs(netChange).toFixed(1)}% compared to last month.`
          )
        }
      }
    }

    // New entries this week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentEntries = recentActivity.filter(
      (entry) => new Date(entry.date) >= oneWeekAgo
    ).length
    if (recentEntries > 0) {
      insightsList.push(
        `${recentEntries} new ${recentEntries === 1 ? "entry" : "entries"} added this week.`
      )
    }

    return insightsList.slice(0, 4) // Limit to 4 insights
  }, [financialSummary, analytics, recentActivity])

  // Calculate projections
  const projections = useMemo(() => {
    if (!analytics || !financialSummary) {
      return {
        nextQuarter: {
          income: 0,
          expenses: 0,
          balance: 0,
        },
        yearly: {
          income: 0,
          expenses: 0,
          balance: 0,
        },
      }
    }

    const monthlyData = analytics.monthly
    const monthsWithData = monthlyData.filter((m) => m.income > 0 || m.expenses > 0)

    if (monthsWithData.length === 0) {
      return {
        nextQuarter: {
          income: 0,
          expenses: 0,
          balance: 0,
        },
        yearly: {
          income: 0,
          expenses: 0,
          balance: 0,
        },
      }
    }

    // Get last 3 months or all months if < 3
    const monthsToUse = monthsWithData.slice(-3)
    const totalMonths = monthsToUse.length

    // Calculate averages
    const totalNetRevenue = monthsToUse.reduce((sum, m) => sum + (m.income - m.expenses), 0)
    const totalIncome = monthsToUse.reduce((sum, m) => sum + m.income, 0)
    const totalExpenses = monthsToUse.reduce((sum, m) => sum + m.expenses, 0)

    const averageMonthlyNetRevenue = totalNetRevenue / totalMonths
    const averageMonthlyIncome = totalIncome / totalMonths
    const averageMonthlyExpenses = totalExpenses / totalMonths

    // Fallback: if averages are 0 or invalid, use total divided by all months
    const fallbackMonths = monthsWithData.length || 1
    const fallbackMonthlyIncome =
      averageMonthlyIncome > 0
        ? averageMonthlyIncome
        : financialSummary.totalIncome / fallbackMonths
    const fallbackMonthlyExpenses =
      averageMonthlyExpenses > 0
        ? averageMonthlyExpenses
        : financialSummary.totalExpenses / fallbackMonths
    const fallbackMonthlyNetRevenue =
      averageMonthlyNetRevenue !== 0
        ? averageMonthlyNetRevenue
        : (financialSummary.totalIncome - financialSummary.totalExpenses) / fallbackMonths

    // Next Quarter Projections (3 months)
    const projectedNextQuarterIncome = fallbackMonthlyIncome * 3
    const projectedNextQuarterExpenses = fallbackMonthlyExpenses * 3
    const projectedNextQuarterBalance = fallbackMonthlyNetRevenue * 3

    // Yearly Projections (12 months)
    const projectedYearIncome = fallbackMonthlyIncome * 12
    const projectedYearExpenses = fallbackMonthlyExpenses * 12
    const projectedYearBalance = fallbackMonthlyNetRevenue * 12

    return {
      nextQuarter: {
        income: projectedNextQuarterIncome,
        expenses: projectedNextQuarterExpenses,
        balance: projectedNextQuarterBalance,
      },
      yearly: {
        income: projectedYearIncome,
        expenses: projectedYearExpenses,
        balance: projectedYearBalance,
      },
    }
  }, [analytics, financialSummary])

  const isLoading = summaryLoading || incomeLoading || expenseLoading

  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive analytics overview of your financial performance
        </p>
      </div>

      {/* Key Metric Cards */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Key Metrics</h2>
          <p className="text-sm text-muted-foreground">Overview of your financial performance</p>
        </div>
        <div
          className="grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
        >
          {/* Account Balance */}
          {(() => {
            const accountBalance = financialSummary?.totalBalance ?? 0
            const balanceColor =
              accountBalance > 0
                ? "text-green-600"
                : accountBalance < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
            const iconColor =
              accountBalance > 0
                ? "text-green-600"
                : accountBalance < 0
                  ? "text-red-600"
                  : "text-muted-foreground"

            return (
              <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
                  <Wallet className={`h-4 w-4 ${iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${balanceColor}`}>
                    {isLoading ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      formatCurrency(accountBalance)
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Income – Expenses</p>
                </CardContent>
              </Card>
            )
          })()}

          {/* Total Revenue */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatCurrency(metrics.totalRevenue)
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Total income</p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatCurrency(metrics.totalExpenses)
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Total costs</p>
            </CardContent>
          </Card>

          {/* This Month Revenue */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatCurrency(metrics.thisMonthRevenue)
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Current month income</p>
            </CardContent>
          </Card>

          {/* This Month Expenses */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">This Month Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatCurrency(metrics.thisMonthExpenses)
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Current month costs</p>
            </CardContent>
          </Card>

          {/* This Month Net Revenue */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">This Month Net Revenue</CardTitle>
              {metrics.thisMonthNetRevenue >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  metrics.thisMonthNetRevenue >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  formatCurrency(metrics.thisMonthNetRevenue)
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Current month balance</p>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  metrics.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  `${metrics.profitMargin.toFixed(1)}%`
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Net revenue / Total income</p>
            </CardContent>
          </Card>

          {/* Expense Ratio */}
          <Card className="h-full border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">Expense Ratio</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoading ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  `${metrics.expenseRatio.toFixed(1)}%`
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Total expenses / Total income</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Financial Projections Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Financial Projections</h2>
          <p className="text-sm text-muted-foreground">
            Forecasted financial performance based on recent trends
          </p>
        </div>

        {/* Next Quarter Projections */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-muted-foreground">Next Quarter Projection</h3>
          <div
            className="grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
          >
            {/* Projected Next Quarter Income */}
            <Card className="h-full border border-blue-200 transition-shadow duration-200 hover:shadow-md dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.nextQuarter.income)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 3 months</p>
              </CardContent>
            </Card>

            {/* Projected Next Quarter Expenses */}
            <Card className="h-full border border-blue-200 transition-shadow duration-200 hover:shadow-md dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.nextQuarter.expenses)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 3 months</p>
              </CardContent>
            </Card>

            {/* Projected Next Quarter Balance */}
            <Card className="h-full border border-blue-200 transition-shadow duration-200 hover:shadow-md dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Balance</CardTitle>
                {projections.nextQuarter.balance >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-blue-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    projections.nextQuarter.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.nextQuarter.balance)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 3 months</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Yearly Projections */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-muted-foreground">
            Yearly Projection (Next 12 Months)
          </h3>
          <div
            className="grid w-full max-w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
          >
            {/* Projected Year Income */}
            <Card className="h-full border border-purple-200 transition-shadow duration-200 hover:shadow-md dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.yearly.income)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 12 months</p>
              </CardContent>
            </Card>

            {/* Projected Year Expenses */}
            <Card className="h-full border border-purple-200 transition-shadow duration-200 hover:shadow-md dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.yearly.expenses)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 12 months</p>
              </CardContent>
            </Card>

            {/* Projected Year Balance */}
            <Card className="h-full border border-purple-200 transition-shadow duration-200 hover:shadow-md dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Projected Balance</CardTitle>
                {projections.yearly.balance >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-purple-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-purple-600" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    projections.yearly.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isLoading ? (
                    <span className="text-muted-foreground">-</span>
                  ) : (
                    formatCurrency(projections.yearly.balance)
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Next 12 months</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projection Chart */}
        {analytics && analytics.monthly.length > 0 && (
          <div className="mt-6">
            <Card className="border transition-shadow duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Revenue Projection Chart</CardTitle>
                <CardDescription className="text-sm">
                  Historical and projected net revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-6 pt-2">
                {(() => {
                  // Prepare chart data with formatted months
                  const formatMonthForDisplay = (monthStr: string) => {
                    if (monthStr.includes("-")) {
                      // Format: "2024-01" -> "Jan 2024"
                      const [year, month] = monthStr.split("-")
                      const monthNames = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]
                      return `${monthNames[parseInt(month) - 1]} ${year}`
                    }
                    return monthStr
                  }

                  const historicalData = analytics.monthly.map((m) => ({
                    month: formatMonthForDisplay(m.month),
                    revenue: m.revenue,
                    type: "actual",
                  }))

                  // Calculate average monthly net revenue for projection
                  const monthsWithData = analytics.monthly.filter(
                    (m) => m.income > 0 || m.expenses > 0
                  )
                  const monthsToUse = monthsWithData.slice(-3)
                  const totalMonths = monthsToUse.length || 1
                  const totalNetRevenue = monthsToUse.reduce(
                    (sum, m) => sum + (m.income - m.expenses),
                    0
                  )
                  const averageMonthlyNetRevenue =
                    totalNetRevenue / totalMonths ||
                    (financialSummary
                      ? (financialSummary.totalIncome - financialSummary.totalExpenses) /
                        (monthsWithData.length || 1)
                      : 0)

                  // Generate projected months (next 12 months)
                  const projectedData = []
                  const lastMonth = analytics.monthly[analytics.monthly.length - 1]
                  // Parse the last month string (format: "Jan 2024" or "2024-01")
                  let lastMonthIndex = 0
                  let lastYear = new Date().getFullYear()

                  if (lastMonth.month.includes("-")) {
                    // Format: "2024-01"
                    const parts = lastMonth.month.split("-")
                    lastYear = parseInt(parts[0])
                    lastMonthIndex = parseInt(parts[1]) - 1
                  } else {
                    // Format: "Jan 2024"
                    const monthNames = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ]
                    const parts = lastMonth.month.split(" ")
                    lastMonthIndex = monthNames.indexOf(parts[0])
                    lastYear = parseInt(parts[1] || new Date().getFullYear().toString())
                  }

                  const monthNames = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ]

                  for (let i = 1; i <= 12; i++) {
                    const projectedMonthIndex = (lastMonthIndex + i) % 12
                    const projectedYear = lastYear + Math.floor((lastMonthIndex + i) / 12)
                    const monthName = monthNames[projectedMonthIndex]
                    projectedData.push({
                      month: `${monthName} ${projectedYear}`,
                      revenue: averageMonthlyNetRevenue,
                      type: "projected",
                    })
                  }

                  const chartData = [
                    ...historicalData.map((d) => ({ ...d, actual: d.revenue, projected: null })),
                    ...projectedData.map((d) => ({ ...d, actual: null, projected: d.revenue })),
                  ]

                  return (
                    <div className="w-full" style={{ padding: "8px 0" }}>
                      <ResponsiveContainer width="100%" height={350} minHeight={250}>
                        <LineChart
                          data={chartData}
                          margin={{ top: 15, right: 10, left: 5, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            angle={-45}
                            textAnchor="end"
                            height={70}
                            interval={0}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#6b7280" }}
                            tickFormatter={formatCurrency}
                          />
                          <Tooltip
                            formatter={(value: number) =>
                              value !== null ? formatCurrency(value) : ""
                            }
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="hsl(271, 81%, 56%)"
                            strokeWidth={2}
                            name="Actual Revenue"
                            dot={{ r: 4 }}
                            connectNulls={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="projected"
                            stroke="hsl(271, 81%, 56%)"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="Projected Revenue"
                            dot={{ r: 4 }}
                            connectNulls={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Revenue Analytics Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Revenue Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track your income, expenses, and revenue trends over time
          </p>
        </div>
        <RevenueCharts
          analytics={analytics}
          incomeSummary={incomeSummary}
          expenseSummary={expenseSummary}
          isLoading={summaryLoading}
          showCategoryCharts={false}
        />
      </section>

      {/* Category Breakdown Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Category Breakdown</h2>
          <p className="text-sm text-muted-foreground">
            Distribution of income and expenses by category
          </p>
        </div>
        <CategoryBreakdown
          incomeSummary={incomeSummary}
          expenseSummary={expenseSummary}
          isLoading={summaryLoading}
        />
      </section>

      {/* Balance Sheet Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Balance Sheet</h2>
          <p className="text-sm text-muted-foreground">Assets, liabilities, and equity overview</p>
        </div>
        <BalanceSheetView balanceSheet={balanceSheet} isLoading={summaryLoading} />
      </section>

      {/* Business Insights Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Lightbulb className="h-5 w-5" />
            Business Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Key insights and trends from your financial data
          </p>
        </div>
        <Card className="border transition-shadow duration-200 hover:shadow-md">
          <CardContent className="pt-6">
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-foreground">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No insights available yet. Add more financial data to see insights.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Recent Activity Section */}
      <section className="space-y-4 border-t pt-6">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Clock className="h-5 w-5" />
            Recent Activity
          </h2>
          <p className="text-sm text-muted-foreground">Latest income and expense entries</p>
        </div>
        <Card className="border transition-shadow duration-200 hover:shadow-md">
          <CardContent className="pt-6">
            {recentActivity.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <div className="min-w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentActivity.map((entry) => (
                        <TableRow key={`${entry.type}-${entry.id}`}>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                entry.type === "income"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {entry.type === "income" ? "Income" : "Expense"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(entry.date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="font-medium">{entry.category}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.description}
                          </TableCell>
                          <TableCell
                            className={`text-right font-semibold ${
                              entry.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {entry.type === "income" ? "+" : "-"}
                            {formatCurrencyWithDecimals(entry.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No recent activity. Add income or expense entries to see them here.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
