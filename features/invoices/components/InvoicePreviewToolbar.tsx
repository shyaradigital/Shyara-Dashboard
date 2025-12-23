"use client"

import { ZoomIn, ZoomOut, RotateCw, Maximize2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface InvoicePreviewToolbarProps {
  zoom: number
  onZoomChange: (zoom: number) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onFitToWidth: () => void
  onFitToScreen: () => void
  onPrint?: () => void
}

export function InvoicePreviewToolbar({
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToWidth,
  onFitToScreen,
  onPrint,
}: InvoicePreviewToolbarProps) {
  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 30 && numValue <= 200) {
      onZoomChange(numValue / 100)
    }
  }

  const handleZoomInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 30) {
      onZoomChange(0.3)
    } else if (numValue > 200) {
      onZoomChange(2)
    } else {
      onZoomChange(numValue / 100)
    }
  }

  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-2 py-2 sm:px-4 flex-wrap gap-2">
      {/* Zoom Controls Group */}
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          disabled={zoom <= 0.3}
          className="h-8"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Zoom Out</span>
        </Button>
        
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="30"
            max="200"
            step="10"
            value={Math.round(zoom * 100)}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            className="h-8 w-16 text-center text-sm font-medium"
            title="Zoom Percentage"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          disabled={zoom >= 2}
          className="h-8"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Zoom In</span>
        </Button>

        <div className="mx-1 h-6 w-px bg-border hidden sm:block" />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8"
          title="Reset to 100%"
        >
          <RotateCw className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFitToWidth}
          className="h-8"
          title="Fit to Width"
        >
          <Maximize2 className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Fit Width</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onFitToScreen}
          className="h-8"
          title="Fit to Screen"
        >
          <Maximize2 className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Fit Screen</span>
        </Button>
      </div>

      {/* Actions Group */}
      {onPrint && (
        <>
          <div className="mx-1 h-6 w-px bg-border hidden sm:block" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="h-8"
            title="Print Invoice"
          >
            <Printer className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </>
      )}
    </div>
  )
}

