"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, FileText } from "lucide-react"
import { parseFinancialData, type FinancialDataExport } from "../utils/exportImport"

interface ImportDataModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (data: FinancialDataExport) => Promise<void>
}

export function ImportDataModal({ open, onOpenChange, onImport }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<FinancialDataExport | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError(null)
    setPreview(null)

    try {
      const data = await parseFinancialData(selectedFile)
      setPreview(data)
    } catch (err: any) {
      setError(err.message || "Failed to parse file")
      setFile(null)
    }
  }

  const handleImport = async () => {
    if (!preview) return

    setIsLoading(true)
    setError(null)

    try {
      await onImport(preview)
      handleClose()
    } catch (err: any) {
      setError(err.message || "Failed to import data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Import Financial Data</DialogTitle>
          <DialogDescription>
            Select a JSON file exported from this dashboard to restore your financial data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only JSON files exported from this dashboard are supported.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {preview && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                <span>File Preview</span>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {preview.version}
                </div>
                <div>
                  <span className="font-medium">Exported:</span>{" "}
                  {new Date(preview.exportedAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Income Entries:</span> {preview.incomes.length}
                </div>
                <div>
                  <span className="font-medium">Expense Entries:</span> {preview.expenses.length}
                </div>
              </div>
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Importing will add all entries from this file. Existing data will not be deleted.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!preview || isLoading}>
            {isLoading ? "Importing..." : "Import Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

