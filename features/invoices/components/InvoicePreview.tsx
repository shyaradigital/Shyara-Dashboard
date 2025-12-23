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
  const [isLoading, setIsLoading] = useState(false) // Start as false so iframe renders
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
    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      // #region agent log
      const logData = {location:'InvoicePreview.tsx:115',message:'useEffect started (after RAF)',data:{hasIframe:!!iframeRef.current,hasContainer:!!containerRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
      console.log('[DEBUG]', logData);
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
      // #endregion
      
      // Wait for refs to be available (they might not be mounted yet)
      if (!iframeRef.current || !containerRef.current) {
      // #region agent log
      const logData2 = {location:'InvoicePreview.tsx:117',message:'Refs missing, waiting for mount',data:{hasIframe:!!iframeRef.current,hasContainer:!!containerRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
      console.log('[DEBUG]', logData2);
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      // #endregion
      
      // Poll for refs to become available (max 20 attempts, 50ms apart = 1s total)
      let attempts = 0
      const maxAttempts = 20
      const checkInterval = setInterval(() => {
        attempts++
        if (iframeRef.current && containerRef.current) {
          clearInterval(checkInterval)
          // #region agent log
          const logData3 = {location:'InvoicePreview.tsx:125',message:'Refs now available, retrying effect',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
          console.log('[DEBUG]', logData3);
          fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
          // #endregion
          // Trigger effect to re-run by updating a dummy state
          // Actually, we can just call the loading logic directly here
          // But to keep it clean, let's use a small timeout to let React finish rendering
          setTimeout(() => {
            // Force effect to re-run by toggling a state
            setIsLoading((prev) => !prev)
            setTimeout(() => setIsLoading((prev) => !prev), 0)
          }, 0)
          return
        }
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          // #region agent log
          const logData4 = {location:'InvoicePreview.tsx:135',message:'Refs never became available',data:{attempts},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
          console.log('[DEBUG]', logData4);
          fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
          // #endregion
          setError("Failed to initialize preview - elements not available")
          setIsLoading(false)
        }
      }, 50)
      
      return () => {
        clearInterval(checkInterval)
      }
    }
    
    // If we get here, refs are available - continue with loading
    if (!iframeRef.current || !containerRef.current) {
      return
    }

    // #region agent log
    const logData3 = {location:'InvoicePreview.tsx:118',message:'Setting loading to true',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    console.log('[DEBUG]', logData3);
    fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
    // #endregion
    
    setIsLoading(true)
    setError(null)

    const html = generateInvoiceHTML(invoice)
    const iframe = iframeRef.current
    
    // Function to finish loading - always clears loading state
    const finishLoading = () => {
      // #region agent log
      const iframe = iframeRef.current
      const doc = iframe?.contentDocument || iframe?.contentWindow?.document
      const docBody = doc?.body
      const docBodyHTML = docBody?.innerHTML?.substring(0, 200) || 'no body'
      const iframeWidth = iframe?.offsetWidth || 0
      const iframeHeight = iframe?.offsetHeight || 0
      const logData4 = {location:'InvoicePreview.tsx:125',message:'finishLoading called',data:{hasIframe:!!iframe,hasDoc:!!doc,hasBody:!!docBody,bodyHTMLPreview:docBodyHTML,iframeWidth,iframeHeight,zoom},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logData4);
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
      // #endregion
      
      try {
        // Auto-fit content to viewport on initial load
        // Use a small delay to ensure iframe content is fully rendered
        setTimeout(() => {
          handleFitToScreenEnhanced()
        }, 100)
      } catch (e) {
        console.error("Error calculating zoom:", e)
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:143',message:'Error in finishLoading zoom calc',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // Set a default zoom
        setZoom(1)
      } finally {
        // #region agent log
        const logData5 = {location:'InvoicePreview.tsx:147',message:'Calling setIsLoading(false)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
        console.log('[DEBUG]', logData5);
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
        // #endregion
        setIsLoading(false)
        console.log('[DEBUG] setIsLoading(false) executed');
      }
    }

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:152',message:'Got iframe document',data:{hasDoc:!!doc,readyState:doc?.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!doc) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:155',message:'No document access',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setError("Failed to access iframe document")
        setIsLoading(false)
        return
      }

      // Write content to iframe
      doc.open()
      doc.write(html)
      doc.close()

      // #region agent log
      const htmlLength = html.length
      const docBody = doc.body
      const docBodyHTML = docBody?.innerHTML?.substring(0, 200) || 'no body'
      const iframeWidth = iframe.offsetWidth
      const iframeHeight = iframe.offsetHeight
      const iframeDisplay = window.getComputedStyle(iframe).display
      const iframeVisibility = window.getComputedStyle(iframe).visibility
      const iframeComputedHeight = window.getComputedStyle(iframe).height
      const wrapperWidth = wrapperRef.current?.offsetWidth || 0
      const wrapperHeight = wrapperRef.current?.offsetHeight || 0
      const containerWidth = containerRef.current?.offsetWidth || 0
      const containerHeight = containerRef.current?.offsetHeight || 0
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:163',message:'Content written to iframe',data:{readyState:doc.readyState,htmlLength,hasBody:!!docBody,bodyHTMLPreview:docBodyHTML,iframeWidth,iframeHeight,iframeDisplay,iframeVisibility,iframeComputedHeight,wrapperWidth,wrapperHeight,containerWidth,containerHeight,zoom},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      console.log('[DEBUG] Content written - HTML length:', htmlLength, 'Body exists:', !!docBody, 'Iframe size:', iframeWidth, 'x', iframeHeight, 'Computed height:', iframeComputedHeight, 'Wrapper:', wrapperWidth, 'x', wrapperHeight, 'Container:', containerWidth, 'x', containerHeight, 'Zoom:', zoom);
      // #endregion

      // 3. Absolute fallback - always finish after 1.5 seconds (set this up first)
      // #region agent log
      const logData6 = {location:'InvoicePreview.tsx:202',message:'Setting absolute fallback timeout',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      console.log('[DEBUG]', logData6);
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData6)}).catch(()=>{});
      // #endregion
      const fallbackTimeout = setTimeout(() => {
        // #region agent log
        const logData7 = {location:'InvoicePreview.tsx:204',message:'Absolute fallback timeout executing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
        console.log('[DEBUG]', logData7);
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData7)}).catch(()=>{});
        // #endregion
        finishLoading()
      }, 1500)

      // When writing directly with doc.write(), the onload event may not fire reliably
      // So we use a combination of approaches:
      
      let pollInterval: ReturnType<typeof setInterval> | null = null
      
      // 1. Immediate check if already complete
      if (doc.readyState === "complete") {
        // #region agent log
        const logCompletePath = {location:'InvoicePreview.tsx:170',message:'Document already complete, scheduling finishLoading',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        console.log('[DEBUG]', logCompletePath);
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logCompletePath)}).catch(()=>{});
        // #endregion
        const readyTimeout = setTimeout(() => {
          // #region agent log
          const logReadyTimeout = {location:'InvoicePreview.tsx:172',message:'Timeout callback executing (readyState complete path)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
          console.log('[DEBUG]', logReadyTimeout);
          fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logReadyTimeout)}).catch(()=>{});
          // #endregion
          finishLoading()
        }, 300)
        
        // Cleanup for readyState complete path
        return () => {
          console.log('[DEBUG] useEffect cleanup - clearing timeouts (readyState complete path)');
          clearTimeout(readyTimeout)
          clearTimeout(fallbackTimeout)
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:175',message:'Document not complete, starting polling',data:{readyState:doc.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        // 2. Poll for readyState
        let pollCount = 0
        const maxPolls = 40 // 2 seconds max (40 * 50ms)
        pollInterval = setInterval(() => {
          pollCount++
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:180',message:'Polling interval tick',data:{pollCount,readyState:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          try {
            const checkDoc = iframe.contentDocument || iframe.contentWindow?.document
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:183',message:'Polling check',data:{pollCount,hasDoc:!!checkDoc,readyState:checkDoc?.readyState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            if (checkDoc && checkDoc.readyState === "complete") {
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:185',message:'ReadyState complete, clearing interval',data:{pollCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              if (pollInterval) clearInterval(pollInterval)
              finishLoading()
            } else if (pollCount >= maxPolls) {
              // #region agent log
              fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:189',message:'Max polls reached, clearing interval',data:{pollCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              // Max polls reached, finish anyway
              if (pollInterval) clearInterval(pollInterval)
              finishLoading()
            }
          } catch (e) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoicePreview.tsx:194',message:'Polling error, clearing interval',data:{error:String(e),pollCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            // Can't check, finish anyway
            if (pollInterval) clearInterval(pollInterval)
            finishLoading()
          }
        }, 50)
        
        // Cleanup for polling path
        return () => {
          console.log('[DEBUG] useEffect cleanup - clearing polling interval and timeout');
          if (pollInterval !== null) clearInterval(pollInterval)
          clearTimeout(fallbackTimeout)
        }
      }

    } catch (e) {
      // #region agent log
      const logData8 = {location:'InvoicePreview.tsx:209',message:'Catch block - error in try',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'};
      console.log('[DEBUG]', logData8);
      fetch('http://127.0.0.1:7244/ingest/0e1ddddd-45af-42a9-b241-565b8393ce44',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData8)}).catch(()=>{});
      // #endregion
      console.error("Error loading invoice preview:", e)
      setError("Failed to load invoice preview")
      setIsLoading(false)
    }
    })
    
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [invoice, handleFitToScreenEnhanced]) // Added handleFitToScreenEnhanced to dependencies

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
    const scaledHeight = INVOICE_HEIGHT_PX * zoom
    return {
      width: `${scaledWidth}px`,
      minWidth: `${scaledWidth}px`,
      height: `${scaledHeight}px`,
      minHeight: `${scaledHeight}px`,
    }
  }, [zoom])

  // Calculate iframe transform
  const iframeStyle = useMemo(() => {
    return {
      width: `${INVOICE_WIDTH_PX}px`,
      minWidth: `${INVOICE_WIDTH_PX}px`,
      height: `${INVOICE_HEIGHT_PX}px`,
      minHeight: `${INVOICE_HEIGHT_PX}px`,
      transform: `scale(${zoom})`,
      transformOrigin: "top left",
      display: "block",
      border: "none",
      visibility: "visible",
      opacity: 1,
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
          <div className="flex items-start justify-center p-4">
            <div
              ref={wrapperRef}
              className="relative"
              style={wrapperStyle}
            >
              <iframe
                ref={iframeRef}
                title="Invoice Preview"
                sandbox="allow-same-origin allow-scripts"
                scrolling="auto"
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
