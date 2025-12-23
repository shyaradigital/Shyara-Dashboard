"use client"

import { formatCurrency, convertDateFormat } from "../utils/formatters"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { MoreVertical, Trash2, Printer } from "lucide-react"
import type { InvoiceResponse } from "@/lib/api/invoices"
import { generateInvoiceHTML } from "../utils/templateProcessor"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

const BUSINESS_UNIT_NAMES: Record<string, string> = {
  SD: "Shyara Digital",
  SM: "Shyara Marketing",
  BX: "BiteX",
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-500",
  SENT: "bg-blue-500",
  PAID: "bg-green-500",
  OVERDUE: "bg-red-500",
  CANCELLED: "bg-gray-400",
}

interface InvoiceListRowProps {
  invoice: InvoiceResponse
  onDelete: (id: string) => Promise<void>
}

export function InvoiceListRow({ invoice, onDelete }: InvoiceListRowProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePrint = () => {
    try {
      // Convert API response to Invoice format
      const invoiceData = {
        invoiceNumber: invoice.documentNumber,
        businessUnit: invoice.businessUnit as any,
        invoiceDate: convertDateFormat(new Date(invoice.invoiceDate).toISOString().split("T")[0]),
        dueDate: invoice.dueDate
          ? convertDateFormat(new Date(invoice.dueDate).toISOString().split("T")[0])
          : undefined,
        placeOfSupply: invoice.placeOfSupply || "Bihar",
        currency: invoice.currency,
        client: invoice.client,
        services: invoice.services,
        poRef: invoice.poRef,
        paymentTerms: invoice.paymentTerms,
        notes: invoice.notes,
        subtotal: invoice.subtotal,
        totalDiscount: invoice.totalDiscount,
        grandTotal: invoice.grandTotal,
      }

      const html = generateInvoiceHTML(invoiceData as any)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()

        let hasPrinted = false
        const printOnce = () => {
          if (hasPrinted) return
          hasPrinted = true
          printWindow.print()
        }

        printWindow.addEventListener("afterprint", () => {
          window.focus()
        })

        const checkAndPrint = () => {
          if (printWindow.document.readyState === "complete") {
            setTimeout(printOnce, 150)
          } else {
            setTimeout(checkAndPrint, 50)
          }
        }

        setTimeout(checkAndPrint, 100)
      } else {
        alert("Please allow popups to print the invoice")
      }
    } catch (error) {
      console.error("Error printing invoice:", error)
      alert("An error occurred while printing. Please try again.")
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(invoice.id)
      setShowDeleteDialog(false)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsDeleting(false)
    }
  }

  const clientName = (invoice.client && typeof invoice.client === "object" && "name" in invoice.client)
    ? String(invoice.client.name)
    : "N/A"
  const invoiceDate = invoice.invoiceDate
    ? convertDateFormat(new Date(invoice.invoiceDate).toISOString().split("T")[0])
    : "N/A"

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{invoice.documentNumber}</TableCell>
        <TableCell>
          {BUSINESS_UNIT_NAMES[invoice.businessUnit] || invoice.businessUnit}
        </TableCell>
        <TableCell>{clientName}</TableCell>
        <TableCell>{invoiceDate}</TableCell>
        <TableCell>{formatCurrency(invoice.grandTotal)}</TableCell>
        <TableCell>
          <Badge
            className={`${STATUS_COLORS[invoice.status] || "bg-gray-500"} text-white`}
          >
            {invoice.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the invoice{" "}
              <strong>{invoice.documentNumber}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

