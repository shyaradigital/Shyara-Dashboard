"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import type { RevenueAnalytics } from "../types/summary"
import type { IncomeSummary } from "../types/income"
import type { ExpenseSummary } from "../types/expense"

interface RevenueChartsProps {
  analytics: RevenueAnalytics | null
  incomeSummary: IncomeSummary | null
  expenseSummary: ExpenseSummary | null
  isLoading: boolean
  showCategoryCharts?: boolean // Optional prop to show/hide category pie charts
}

const COLORS = {
  income: "#22c55e", // Green
  expense: "#ef4444", // Red
  revenue: "hsl(271, 81%, 56%)", // Purple from theme
}

const PIE_COLORS = [
  "hsl(271, 81%, 56%)", // Purple (primary)
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#6366f1", // Indigo
]

export function RevenueCharts({
  analytics,
  incomeSummary,
  expenseSummary,
  isLoading,
  showCategoryCharts = true, // Default to true for backward compatibility
}: RevenueChartsProps) {
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly" | "yearly">("monthly")

  if (isLoading || !analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loading charts...</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loading charts...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const currentData =
    timeframe === "monthly"
      ? analytics.monthly
      : timeframe === "quarterly"
        ? analytics.quarterly
        : analytics.yearly

  const growthValue =
    timeframe === "monthly"
      ? analytics.growth.monthly
      : timeframe === "quarterly"
        ? analytics.growth.quarterly
        : analytics.growth.yearly

  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return "₹0"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Prepare income category data for pie chart
  const incomeCategoryData = incomeSummary?.byCategory
    ? Object.entries(incomeSummary.byCategory)
        .filter(([, value]) => value > 0 && isFinite(value))
        .map(([name, value]) => ({ name, value: isNaN(value) ? 0 : value }))
    : []

  // Prepare expense category data for pie chart
  const expenseCategoryData = expenseSummary?.byCategory
    ? Object.entries(expenseSummary.byCategory)
        .filter(([, value]) => value > 0 && isFinite(value))
        .map(([name, value]) => ({ name, value: isNaN(value) ? 0 : value }))
    : []

  return (
    <div className="w-full max-w-full space-y-5 overflow-x-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Select
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as typeof timeframe)}
        >
          <SelectTrigger className="w-full sm:max-w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Growth Indicators */}
      <div
        className="grid w-full max-w-full gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <Card className="border">
          <CardContent className="pt-4">
            <div className="mb-1 text-sm text-muted-foreground">Month-over-Month</div>
            <div
              className={`text-xl font-semibold ${
                analytics.growth.monthly >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {analytics.growth.monthly >= 0 ? "+" : ""}
              {analytics.growth.monthly.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4">
            <div className="mb-1 text-sm text-muted-foreground">Quarter-over-Quarter</div>
            <div
              className={`text-xl font-semibold ${
                analytics.growth.quarterly >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {analytics.growth.quarterly >= 0 ? "+" : ""}
              {analytics.growth.quarterly.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="pt-4">
            <div className="mb-1 text-sm text-muted-foreground">Year-over-Year</div>
            <div
              className={`text-xl font-semibold ${
                analytics.growth.yearly >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {analytics.growth.yearly >= 0 ? "+" : ""}
              {analytics.growth.yearly.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expense Bar Chart */}
      <Card className="border transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Income vs Expenses</CardTitle>
          <CardDescription className="text-sm">
            Comparison of income and expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-2">
          {currentData && currentData.length > 0 ? (
            <div className="w-full" style={{ padding: "8px 0" }}>
              <ResponsiveContainer width="100%" height={350} minHeight={250}>
                <BarChart data={currentData} margin={{ top: 15, right: 10, left: 5, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey={
                      timeframe === "monthly"
                        ? "month"
                        : timeframe === "quarterly"
                          ? "quarter"
                          : "year"
                    }
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS.income} name="Income" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="expenses"
                    fill={COLORS.expense}
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              No data available for the selected timeframe
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Line Chart */}
      <Card className="border transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Revenue Trend</CardTitle>
          <CardDescription className="text-sm">
            Net revenue over time (Income - Expenses)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-6 pt-2">
          {currentData && currentData.length > 0 ? (
            <div className="w-full" style={{ padding: "8px 0" }}>
              <ResponsiveContainer width="100%" height={350} minHeight={250}>
                <AreaChart data={currentData} margin={{ top: 15, right: 10, left: 5, bottom: 70 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.revenue} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey={
                      timeframe === "monthly"
                        ? "month"
                        : timeframe === "quarterly"
                          ? "quarter"
                          : "year"
                    }
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} tickFormatter={formatCurrency} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.revenue}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              No data available for the selected timeframe
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Charts */}
      {showCategoryCharts && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Income by Category</CardTitle>
              <CardDescription className="text-sm">Distribution of income sources</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 pt-2">
              {incomeCategoryData.length > 0 ? (
                <div className="w-full" style={{ padding: "8px 0" }}>
                  <ResponsiveContainer width="100%" height={300} minHeight={250}>
                    <PieChart>
                      <Pie
                        data={incomeCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incomeCategoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No income data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
              <CardDescription className="text-sm">
                Distribution of expense categories
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-6 pt-2">
              {expenseCategoryData.length > 0 ? (
                <div className="w-full" style={{ padding: "8px 0" }}>
                  <ResponsiveContainer width="100%" height={300} minHeight={250}>
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategoryData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
