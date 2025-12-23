"use client"

import { useState } from "react"
import { Eye, Plus, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoice, BUSINESS_UNITS } from "../hooks/useInvoice"
import { ServiceRow } from "./ServiceRow"
import { InvoicePreview } from "./InvoicePreview"
import { formatCurrency, convertDateFormat, convertToInputDate } from "../utils/formatters"
import { generateInvoiceHTML } from "../utils/templateProcessor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function InvoiceGenerator() {
  const {
    businessUnit,
    setBusinessUnit,
    invoiceNumber,
    setInvoiceNumber,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    placeOfSupply,
    setPlaceOfSupply,
    currency,
    client,
    updateClient,
    services,
    addService,
    removeService,
    updateService,
    poRef,
    setPoRef,
    paymentTerms,
    setPaymentTerms,
    notes,
    setNotes,
    subtotal,
    totalDiscount,
    grandTotal,
    getInvoice,
  } = useInvoice()

  const [showPreview, setShowPreview] = useState(false)

  const handlePrint = () => {
    try {
      const invoice = getInvoice()
      const html = generateInvoiceHTML(invoice)
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(html)
        printWindow.document.close()
        
        let hasPrinted = false
        
        // Single print function that only executes once
        const printOnce = () => {
          if (hasPrinted) return
          hasPrinted = true
          printWindow.print()
        }
        
        // Handle after print to return focus
        printWindow.addEventListener("afterprint", () => {
          window.focus()
        })
        
        // Wait for document to be ready, then print once
        const checkAndPrint = () => {
          if (printWindow.document.readyState === "complete") {
            setTimeout(printOnce, 150)
          } else {
            setTimeout(checkAndPrint, 50)
          }
        }
        
        // Start checking after a short delay
        setTimeout(checkAndPrint, 100)
      } else {
        alert("Please allow popups to print the invoice")
      }
    } catch (error) {
      console.error("Error printing invoice:", error)
      alert("An error occurred while printing. Please try again.")
    }
  }

  // Convert dates for input fields (YYYY-MM-DD)
  const invoiceDateInput = invoiceDate && invoiceDate.includes("/")
    ? convertToInputDate(invoiceDate)
    : invoiceDate || ""
  const dueDateInput = dueDate && dueDate.includes("/") ? convertToInputDate(dueDate) : dueDate || ""

  const handleInvoiceDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setInvoiceDate(convertDateFormat(value))
    }
  }

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      setDueDate(convertDateFormat(value))
    } else {
      setDueDate("")
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Generate Invoice</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">Fill in the details to create an invoice</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="w-full sm:w-auto">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessUnit">Business Unit</Label>
                  <Select value={businessUnit} onValueChange={setBusinessUnit}>
                    <SelectTrigger id="businessUnit" className="w-full">
                      <SelectValue placeholder="Select Business Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_UNITS.map((unit) => (
                        <SelectItem key={unit.code} value={unit.code}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder={`STS/${businessUnit}/2025/001`}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDateInput}
                    onChange={handleInvoiceDateChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDateInput}
                    onChange={handleDueDateChange}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="placeOfSupply">Place of Supply</Label>
                  <Input
                    id="placeOfSupply"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={client.name}
                  onChange={(e) => updateClient("name", e.target.value)}
                  placeholder="Client Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Company</Label>
                <Input
                  id="clientCompany"
                  value={client.company}
                  onChange={(e) => updateClient("company", e.target.value)}
                  placeholder="Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Address</Label>
                <Textarea
                  id="clientAddress"
                  value={client.address}
                  onChange={(e) => updateClient("address", e.target.value)}
                  placeholder="Address Line 1, City, State, PIN"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientGSTIN">GSTIN</Label>
                  <Input
                    id="clientGSTIN"
                    value={client.gstin}
                    onChange={(e) => updateClient("gstin", e.target.value)}
                    placeholder="GSTIN (Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={client.email}
                    onChange={(e) => updateClient("email", e.target.value)}
                    placeholder="client@email.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg sm:text-xl">Services</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addService} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full divide-y divide-border">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                          #
                        </th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground min-w-[200px]">
                          Description
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Qty
                        </th>
                        <th className="p-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Rate
                        </th>
                        <th className="p-2 text-center text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Disc %
                        </th>
                        <th className="p-2 text-right text-xs font-medium text-muted-foreground whitespace-nowrap">
                          Amount
                        </th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, index) => (
                        <ServiceRow
                          key={service.id}
                          service={service}
                          index={index}
                          onUpdate={updateService}
                          onRemove={removeService}
                          canRemove={services.length > 1}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="poRef">PO / Reference</Label>
                <Input
                  id="poRef"
                  value={poRef}
                  onChange={(e) => setPoRef(e.target.value)}
                  placeholder="PO-XXXXX (Optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="50% Advance, 50% on Delivery"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Terms</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes or terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Discount:</span>
                <span className="font-medium">{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="flex h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)] sm:w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:h-[calc(100vh-4rem)] md:max-h-[calc(100vh-4rem)] md:w-[calc(100vw-4rem)] md:max-w-[calc(100vw-4rem)] flex-col gap-0 p-0 sm:rounded-lg left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <DialogHeader className="shrink-0 border-b px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>Preview of your invoice - Use zoom controls to adjust view</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-hidden">
            <InvoicePreview invoice={getInvoice()} onPrint={handlePrint} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

