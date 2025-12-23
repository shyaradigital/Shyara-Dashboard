"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { Invoice } from "../types/invoice"
import { generateInvoiceHTML } from "../utils/templateProcessor"
import { InvoicePreviewToolbar } from "./InvoicePreviewToolbar"

interface InvoicePreviewProps {
  invoice: Invoice
  onPrint?: () => void
}

const INVOICE_WIDTH_PX = 794 // 210mm in pixels at 96dpi
const INVOICE_HEIGHT_PX = 1123 // 297mm (A4 height) in pixels at 96dpi

export function InvoicePreview({ invoice, onPrint }: InvoicePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate available space for zoom calculations
  const getAvailableSpace = useCallback(() => {
    if (!containerRef.current) {
      return { width: 0, height: 0 }
    }
    const container = containerRef.current
    // Account for padding (p-4 = 16px on each side = 32px total)
    const padding = 32
    return {
      width: container.clientWidth - padding,
      height: container.clientHeight - padding,
    }
  }, [])

  // Fit to width calculation
  const handleFitToWidth = useCallback(() => {
    const { width } = getAvailableSpace()
    if (width > 0) {
      const calculatedZoom = Math.min(width / INVOICE_WIDTH_PX, 2)
      setZoom(Math.max(calculatedZoom, 0.3))
    }
  }, [getAvailableSpace])

  // Fit to screen calculation (fits both width and height)
  const handleFitToScreen = useCallback(() => {
    const { width, height } = getAvailableSpace()
    if (width > 0 && height > 0) {
      const zoomWidth = width / INVOICE_WIDTH_PX
      const zoomHeight = height / INVOICE_HEIGHT_PX
      const calculatedZoom = Math.min(Math.min(zoomWidth, zoomHeight), 2)
      setZoom(Math.max(calculatedZoom, 0.3))
    }
  }, [getAvailableSpace])

  // Get actual content dimensions from iframe
  const getContentDimensions = useCallback(() => {
    if (!iframeRef.current) {
      return { width: INVOICE_WIDTH_PX, height: INVOICE_HEIGHT_PX }
    }

    const iframe = iframeRef.current
    const iframeWindow = iframe.contentWindow

    if (!iframeWindow) {
      return { width: INVOICE_WIDTH_PX, height: INVOICE_HEIGHT_PX }
    }

    try {
      const iframeDoc = iframe.contentDocument || iframeWindow.document
      const iframeBody = iframeDoc?.body
      const iframeHtml = iframeDoc?.documentElement

      if (iframeBody && iframeHtml) {
        const contentWidth = Math.max(
          iframeBody.scrollWidth,
          iframeBody.offsetWidth,
          iframeHtml.scrollWidth,
          iframeHtml.offsetWidth,
          INVOICE_WIDTH_PX
        )
        const contentHeight = Math.max(
          iframeBody.scrollHeight,
          iframeBody.offsetHeight,
          iframeHtml.scrollHeight,
          iframeHtml.offsetHeight,
          INVOICE_HEIGHT_PX
        )
        return { width: contentWidth, height: contentHeight }
      }
    } catch (e) {
      // Cross-origin or other error, use fallback
    }

    return { width: INVOICE_WIDTH_PX, height: INVOICE_HEIGHT_PX }
  }, [])

  // Enhanced fit to screen using actual content dimensions
  const handleFitToScreenEnhanced = useCallback(() => {
    const { width: containerWidth, height: containerHeight } = getAvailableSpace()
    const { width: contentWidth, height: contentHeight } = getContentDimensions()

    if (containerWidth > 0 && containerHeight > 0 && contentWidth > 0 && contentHeight > 0) {
      const zoomWidth = containerWidth / contentWidth
      const zoomHeight = containerHeight / contentHeight
      const calculatedZoom = Math.min(Math.min(zoomWidth, zoomHeight), 2)
      setZoom(Math.max(calculatedZoom, 0.3))
    }
  }, [getAvailableSpace, getContentDimensions])

  // Load invoice HTML into iframe
  useEffect(() => {
    if (iframeRef.current && containerRef.current) {
      setIsLoading(true)
      setError(null)

      const html = generateInvoiceHTML(invoice)
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        try {
          doc.open()
          doc.write(html)
          doc.close()

          // Calculate initial zoom after content loads
          const calculateInitialZoom = () => {
            // Wait for iframe content to fully render
            setTimeout(() => {
              try {
                handleFitToScreenEnhanced()
                setIsLoading(false)
              } catch (e) {
                setError("Failed to render invoice preview")
                setIsLoading(false)
              }
            }, 300)
          }

          // Calculate zoom after content loads
          iframe.onload = calculateInitialZoom
          // Also try immediately in case already loaded
          if (doc.readyState === "complete") {
            calculateInitialZoom()
          } else {
            // Fallback timeout
            setTimeout(() => {
              if (isLoading) {
                handleFitToScreenEnhanced()
                setIsLoading(false)
              }
            }, 1000)
          }
        } catch (e) {
          setError("Failed to load invoice preview")
          setIsLoading(false)
        }
      } else {
        setError("Failed to access iframe document")
        setIsLoading(false)
      }
    }
  }, [invoice, handleFitToScreenEnhanced, isLoading])

  // Recalculate zoom on container resize (debounced)
  // Note: We don't auto-adjust zoom on resize to respect user's manual zoom preferences
  useEffect(() => {
    // This effect is kept for potential future enhancements
    // Currently, users can manually adjust zoom and it won't be overridden
    const resizeObserver = new ResizeObserver(() => {
      // Container resized - user can manually use fit-to-screen if needed
      // We don't auto-adjust to respect user's zoom preference
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.3))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when modal is open and user is not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

      if (ctrlOrCmd) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault()
          handleZoomIn()
        } else if (e.key === "-") {
          e.preventDefault()
          handleZoomOut()
        } else if (e.key === "0") {
          e.preventDefault()
          handleResetZoom()
        } else if (e.key === "p" || e.key === "P") {
          e.preventDefault()
          onPrint?.()
        }
      } else if (e.key === "Escape") {
        // Escape is handled by Dialog component, so we don't need to handle it here
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleZoomIn, handleZoomOut, handleResetZoom, onPrint])

  // Calculate wrapper dimensions based on zoom
  const wrapperStyle = useMemo(() => {
    const scaledWidth = INVOICE_WIDTH_PX * zoom
    return {
      width: `${scaledWidth}px`,
      minWidth: `${scaledWidth}px`,
    }
  }, [zoom])

  // Calculate iframe transform
  const iframeStyle = useMemo(() => {
    return {
      width: `${INVOICE_WIDTH_PX}px`,
      minWidth: `${INVOICE_WIDTH_PX}px`,
      height: "auto",
      minHeight: `${INVOICE_HEIGHT_PX}px`,
      transform: `scale(${zoom})`,
      transformOrigin: "top left",
      display: "block",
      border: "none",
    }
  }, [zoom])

  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <InvoicePreviewToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleResetZoom}
        onFitToWidth={handleFitToWidth}
        onFitToScreen={handleFitToScreenEnhanced}
        onPrint={onPrint}
      />

      {/* Scrollable Content Area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-auto overscroll-contain bg-muted/20"
      >
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rendering invoice...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex min-h-full items-start justify-center p-4">
            <div
              ref={wrapperRef}
              className="relative"
              style={wrapperStyle}
            >
              <iframe
                ref={iframeRef}
                title="Invoice Preview"
                sandbox="allow-same-origin"
                scrolling="no"
                style={iframeStyle}
                className="bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
