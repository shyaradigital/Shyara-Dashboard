"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoiceStats } from "../hooks/useInvoiceStats"
import { Loader2 } from "lucide-react"
import { formatCurrency } from "../utils/formatters"

const BUSINESS_UNIT_NAMES: Record<string, string> = {
  SD: "Shyara Digital",
  SM: "Shyara Marketing",
  BX: "BiteX",
}

export function InvoiceStats() {
  const { stats, loading } = useInvoiceStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center text-muted-foreground p-8">
        No statistics available
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(stats.totalAmount)} total value
          </p>
        </CardContent>
      </Card>

      {/* By Business Unit */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Business Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byBusinessUnit.length > 0 ? (
              stats.byBusinessUnit.map((unit) => (
                <div key={unit.businessUnit} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {BUSINESS_UNIT_NAMES[unit.businessUnit] || unit.businessUnit}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{unit.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(unit.totalAmount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">By Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byStatus.length > 0 ? (
              stats.byStatus.map((status) => (
                <div key={status.status} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground capitalize">
                    {status.status.toLowerCase()}
                  </span>
                  <span className="text-sm font-medium">{status.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentDocuments.length > 0 ? (
              stats.recentDocuments.slice(0, 3).map((doc) => (
                <div key={doc.id} className="text-sm">
                  <div className="font-medium truncate">{doc.documentNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(doc.grandTotal)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent documents</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

