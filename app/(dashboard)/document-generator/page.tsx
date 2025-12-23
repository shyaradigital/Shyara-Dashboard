"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceStats } from "@/features/invoices/components/InvoiceStats"
import { FileText, Plus, List } from "lucide-react"
import Link from "next/link"

export default function DocumentGeneratorPage() {
  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Document Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage invoices and other business documents
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <InvoiceStats />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Invoice */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Invoices</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create professional invoices for your clients
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/document-generator/invoices/create">
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
              <Link href="/document-generator/invoices">
                <Button variant="outline" className="w-full">
                  <List className="mr-2 h-4 w-4" />
                  View All Invoices
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Future: Quotations */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">Quotations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Coming soon</p>
            <Button variant="outline" className="w-full" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Create Quotation
            </Button>
          </CardContent>
        </Card>

        {/* Future: Other Documents */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-muted-foreground">Other Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Coming soon</p>
            <Button variant="outline" className="w-full" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Create Document
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

