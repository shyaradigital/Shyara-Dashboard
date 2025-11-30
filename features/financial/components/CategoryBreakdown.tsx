"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { IncomeSummary } from "../types/income"
import type { ExpenseSummary } from "../types/expense"

interface CategoryBreakdownProps {
  incomeSummary: IncomeSummary | null
  expenseSummary: ExpenseSummary | null
  isLoading: boolean
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

export function CategoryBreakdown({
  incomeSummary,
  expenseSummary,
  isLoading,
}: CategoryBreakdownProps) {
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

  if (isLoading) {
    return (
      <div
        className="grid w-full max-w-full gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="grid w-full max-w-full gap-5"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
    >
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
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
          <CardDescription className="text-sm">Distribution of expense categories</CardDescription>
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
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
  )
}
