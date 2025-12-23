"use client"

import { InvoiceList } from "@/features/invoices/components/InvoiceList"

export default function InvoicesListPage() {
  return (
    <div className="box-border w-full max-w-full space-y-6 overflow-x-hidden pb-8">
      <InvoiceList />
    </div>
  )
}

