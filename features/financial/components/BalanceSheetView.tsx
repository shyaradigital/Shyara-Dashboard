"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { BalanceSheet } from "../types/summary"

interface BalanceSheetViewProps {
  balanceSheet: BalanceSheet | null
  isLoading: boolean
}

export function BalanceSheetView({ balanceSheet, isLoading }: BalanceSheetViewProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>Loading balance sheet data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!balanceSheet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>No balance sheet data available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const chartData = [
    {
      name: "Assets",
      value: balanceSheet.assets,
      fill: "#22c55e",
    },
    {
      name: "Liabilities",
      value: balanceSheet.liabilities,
      fill: "#ef4444",
    },
    {
      name: "Equity",
      value: balanceSheet.equity,
      fill: balanceSheet.equity >= 0 ? "#8b5cf6" : "#f59e0b",
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="border transition-shadow duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Balance Sheet Overview</CardTitle>
          <CardDescription className="text-sm">
            Assets = Total Income | Liabilities = Total Expenses | Equity = Income - Expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Table View */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-full rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50">
                    <TableHead className="min-w-[150px] font-semibold">Item</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-b transition-colors hover:bg-muted/30">
                    <TableCell className="py-3 font-medium">Assets</TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      Total Income (All revenue received)
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold text-green-600">
                      {formatCurrency(balanceSheet.assets)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-b transition-colors hover:bg-muted/30">
                    <TableCell className="py-3 font-medium">Liabilities</TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      Total Expenses (All costs incurred)
                    </TableCell>
                    <TableCell className="py-3 text-right font-semibold text-red-600">
                      {formatCurrency(balanceSheet.liabilities)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 border-t-foreground/20 bg-muted/20 transition-colors hover:bg-muted/30">
                    <TableCell className="py-3 font-bold">Equity</TableCell>
                    <TableCell className="py-3 font-medium text-muted-foreground">
                      Net Worth (Assets - Liabilities)
                    </TableCell>
                    <TableCell
                      className={`py-3 text-right text-lg font-bold ${
                        balanceSheet.equity >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(balanceSheet.equity)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Chart View */}
          <div className="pt-2">
            <h3 className="mb-3 text-base font-semibold">Visual Overview</h3>
            <div className="w-full" style={{ padding: "8px 0" }}>
              <ResponsiveContainer width="100%" height={300} minHeight={250}>
                <BarChart data={chartData} margin={{ top: 15, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
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
                  <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <Card className="border bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5 text-sm">
                <p>
                  <span className="font-semibold">Assets:</span> Your total income represents all
                  revenue received.
                </p>
                <p>
                  <span className="font-semibold">Liabilities:</span> Your total expenses represent
                  all costs incurred.
                </p>
                <p>
                  <span className="font-semibold">Equity:</span> Your net worth is calculated as
                  Assets minus Liabilities.{" "}
                  {balanceSheet.equity >= 0 ? (
                    <span className="font-semibold text-green-600">
                      You have a positive equity position.
                    </span>
                  ) : (
                    <span className="font-semibold text-red-600">
                      You have a negative equity position.
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
