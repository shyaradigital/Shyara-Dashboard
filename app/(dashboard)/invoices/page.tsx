"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InvoicesPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to new document generator route
    router.replace("/document-generator/invoices/create")
  }, [router])

  return null
}
