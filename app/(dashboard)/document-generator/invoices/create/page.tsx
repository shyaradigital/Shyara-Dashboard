"use client"

import { InvoiceGenerator } from "@/features/invoices/components/InvoiceGenerator"

export default function CreateInvoicePage() {
  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      <InvoiceGenerator />
    </div>
  )
}

