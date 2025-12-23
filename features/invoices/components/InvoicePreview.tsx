"use client"

import { useEffect, useRef, useState } from "react"
import { ZoomIn, ZoomOut, RotateCw, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Invoice } from "../types/invoice"
import { generateInvoiceHTML } from "../utils/templateProcessor"

interface InvoicePreviewProps {
  invoice: Invoice
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

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
    // Reset zoom when invoice changes
    setZoom(1)
  }, [invoice])

  // Auto-fit to width on mount and when container size changes
  useEffect(() => {
    const fitToWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 32 // Account for padding
        // 210mm ≈ 794px at 96dpi (210 * 3.779527559)
        const invoiceWidthPx = 794
        const calculatedZoom = Math.min(containerWidth / invoiceWidthPx, 1.2)
        if (calculatedZoom > 0.3) {
          // Only auto-fit if reasonable
          setZoom(calculatedZoom)
        }
      }
    }

    // Fit on mount
    const timer = setTimeout(fitToWidth, 100)

    // Fit on resize
    window.addEventListener("resize", fitToWidth)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", fitToWidth)
    }
  }, [])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  const handleFitToWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 32 // Account for padding
      // 210mm ≈ 794px at 96dpi (210 * 3.779527559)
      const invoiceWidthPx = 794
      const calculatedZoom = Math.min(containerWidth / invoiceWidthPx, 1.2)
      setZoom(calculatedZoom)
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Zoom Controls Toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="h-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            className="h-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="h-8"
          >
            <RotateCw className="mr-1 h-3 w-3" />
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFitToWidth}
            className="h-8"
          >
            <Maximize2 className="mr-1 h-3 w-3" />
            Fit Width
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto overscroll-contain rounded-lg border bg-transparent touch-pan-x touch-pan-y"
        style={{ minHeight: 0 }}
      >
        <div
          className="inline-block origin-top-left transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            minWidth: "210mm",
            width: "210mm",
          }}
        >
          <iframe
            ref={iframeRef}
            className="border-0"
            title="Invoice Preview"
            sandbox="allow-same-origin"
            scrolling="yes"
            style={{
              minHeight: "600px",
              height: "auto",
              width: "210mm",
              minWidth: "210mm",
              display: "block",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  )
}

