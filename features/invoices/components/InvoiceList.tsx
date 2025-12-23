"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoices } from "../hooks/useInvoices"
import { InvoiceListRow } from "./InvoiceListRow"
import { BUSINESS_UNITS } from "../hooks/useInvoice"
import { Loader2, Search, Plus } from "lucide-react"
import Link from "next/link"
import type { BusinessUnit } from "../types/invoice"

const BUSINESS_UNIT_NAMES: Record<string, string> = {
  SD: "Shyara Digital",
  SM: "Shyara Marketing",
  BX: "BiteX",
}

export function InvoiceList() {
  const [businessUnitFilter, setBusinessUnitFilter] = useState<BusinessUnit | "all">("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const { invoices, loading, updateFilters, deleteInvoice } = useInvoices()

  // Apply filters
  const handleFilterChange = () => {
    updateFilters({
      businessUnit: businessUnitFilter !== "all" ? businessUnitFilter : undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      search: searchQuery || undefined,
    })
  }

  // Debounce search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    // Apply filter after a short delay
    setTimeout(() => {
      updateFilters({
        businessUnit: businessUnitFilter !== "all" ? businessUnitFilter : undefined,
        status: statusFilter !== "all" ? (statusFilter as any) : undefined,
        search: value || undefined,
      })
    }, 300)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Invoices</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Manage and view all your invoices
          </p>
        </div>
        <Link href="/document-generator/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Unit</label>
              <Select
                value={businessUnitFilter}
                onValueChange={(value) => {
                  setBusinessUnitFilter(value as BusinessUnit | "all")
                  updateFilters({
                    businessUnit: value !== "all" ? (value as BusinessUnit) : undefined,
                    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
                    search: searchQuery || undefined,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Business Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Business Units</SelectItem>
                  {BUSINESS_UNITS.map((unit) => (
                    <SelectItem key={unit.code} value={unit.code}>
                      {unit.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value)
                  updateFilters({
                    businessUnit: businessUnitFilter !== "all" ? businessUnitFilter : undefined,
                    status: value !== "all" ? (value as any) : undefined,
                    search: searchQuery || undefined,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              No invoices found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <InvoiceListRow
                      key={invoice.id}
                      invoice={invoice}
                      onDelete={deleteInvoice}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

