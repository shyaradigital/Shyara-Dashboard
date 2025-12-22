"use client"

import { useEffect, useRef } from "react"
import type { Invoice } from "../types/invoice"
import { generateInvoiceHTML } from "../utils/templateProcessor"

interface InvoicePreviewProps {
  invoice: Invoice
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const html = generateInvoiceHTML(invoice)
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  }, [invoice])

  return (
    <div className="w-full h-full overflow-auto overscroll-contain rounded-lg border bg-white touch-pan-x touch-pan-y">
      <div className="inline-block" style={{ minWidth: "980px", width: "100%" }}>
        <iframe
          ref={iframeRef}
          className="border-0"
          title="Invoice Preview"
          sandbox="allow-same-origin"
          scrolling="yes"
          style={{
            minHeight: "600px",
            height: "100%",
            width: "980px",
            minWidth: "980px",
            display: "block",
            border: "none",
          }}
        />
      </div>
    </div>
  )
}

