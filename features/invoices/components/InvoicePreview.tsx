"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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

  const handleFitToScreen = useCallback(() => {
    if (containerRef.current && iframeRef.current) {
      const container = containerRef.current
      const iframe = iframeRef.current
      const iframeWindow = iframe.contentWindow
      
      if (!iframeWindow) {
        // Fallback to fixed dimensions
        const containerWidth = container.clientWidth - 32
        const containerHeight = container.clientHeight - 32
        const invoiceWidthPx = 794 // 210mm
        const invoiceHeightPx = 1123 // 297mm (A4 height)
        
        const zoomWidth = containerWidth / invoiceWidthPx
        const zoomHeight = containerHeight / invoiceHeightPx
        const calculatedZoom = Math.min(zoomWidth, zoomHeight, 1.2)
        
        if (calculatedZoom > 0.2) {
          setZoom(calculatedZoom)
        }
        return
      }
      
      try {
        const iframeDoc = iframe.contentDocument || iframeWindow.document
        const iframeBody = iframeDoc?.body
        const iframeHtml = iframeDoc?.documentElement
        
        if (iframeBody && iframeHtml) {
          const containerWidth = container.clientWidth - 32
          const containerHeight = container.clientHeight - 32
          
          // Get actual content dimensions
          const contentWidth = Math.max(
            iframeBody.scrollWidth,
            iframeBody.offsetWidth,
            iframeHtml.scrollWidth,
            iframeHtml.offsetWidth,
            794 // Fallback to A4 width
          )
          const contentHeight = Math.max(
            iframeBody.scrollHeight,
            iframeBody.offsetHeight,
            iframeHtml.scrollHeight,
            iframeHtml.offsetHeight,
            1123 // Fallback to A4 height
          )
          
          // Calculate zoom to fit both width and height
          const zoomWidth = containerWidth / contentWidth
          const zoomHeight = containerHeight / contentHeight
          const calculatedZoom = Math.min(zoomWidth, zoomHeight, 1.2)
          
          if (calculatedZoom > 0.2) {
            setZoom(calculatedZoom)
          }
        }
      } catch (e) {
        // Fallback to fixed dimensions
        const containerWidth = container.clientWidth - 32
        const containerHeight = container.clientHeight - 32
        const invoiceWidthPx = 794 // 210mm
        const invoiceHeightPx = 1123 // 297mm (A4 height)
        
        const zoomWidth = containerWidth / invoiceWidthPx
        const zoomHeight = containerHeight / invoiceHeightPx
        const calculatedZoom = Math.min(zoomWidth, zoomHeight, 1.2)
        
        if (calculatedZoom > 0.2) {
          setZoom(calculatedZoom)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (iframeRef.current && containerRef.current) {
      const html = generateInvoiceHTML(invoice)
      const iframe = iframeRef.current
      const container = containerRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
        
        // Calculate initial zoom to fit entire invoice
        const calculateInitialZoom = () => {
          // Wait for iframe content to fully render
          setTimeout(() => {
            handleFitToScreen()
          }, 300)
        }
        
        // Calculate zoom after content loads
        iframe.onload = calculateInitialZoom
        // Also try immediately in case already loaded
        if (doc.readyState === "complete") {
          calculateInitialZoom()
        }
      }
    }
  }, [invoice, handleFitToScreen])

  // Recalculate zoom on container resize
  useEffect(() => {
    const handleResize = () => {
      // Use fit-to-screen to recalculate based on actual content
      handleFitToScreen()
    }

    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [handleFitToScreen])

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
      const containerWidth = containerRef.current.clientWidth - 32
      const invoiceWidthPx = 794 // 210mm
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFitToScreen}
            className="h-8"
          >
            <Maximize2 className="mr-1 h-3 w-3" />
            Fit Screen
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
          }}
        >
          <iframe
            ref={iframeRef}
            className="border-0"
            title="Invoice Preview"
            sandbox="allow-same-origin"
            scrolling="no"
            style={{
              width: "794px",
              minWidth: "794px",
              height: "auto",
              minHeight: "1123px",
              display: "block",
              border: "none",
              pointerEvents: "auto",
            }}
          />
        </div>
      </div>
    </div>
  )
}

