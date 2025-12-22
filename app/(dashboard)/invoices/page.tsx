"use client"

import { InvoiceGenerator } from "@/features/invoices"

export default function InvoicesPage() {
  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      <InvoiceGenerator />
    </div>
  )
}
