"use client"

import { useState, useCallback, useMemo, useRef } from "react"
import type { Invoice, Client, Service, BusinessUnit } from "../types/invoice"
import {
  calculateSubtotal,
  calculateTotalDiscount,
  calculateGrandTotal,
  recalculateService,
} from "../utils/calculations"
import { getTodayDate } from "../utils/formatters"

const BUSINESS_UNITS = [
  { code: "SD" as BusinessUnit, name: "Shyara Digital" },
  { code: "SM" as BusinessUnit, name: "Shyara Marketing" },
  { code: "BX" as BusinessUnit, name: "BiteX" },
] as const

const generateInvoiceNumber = (businessUnit: BusinessUnit = "SD"): string => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `STS/${businessUnit}/${year}/${random}`
}

export function useInvoice() {
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit>("SD")
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber("SD"))
  const [isInvoiceNumberManual, setIsInvoiceNumberManual] = useState(false)
  const invoiceNumberRef = useRef<string>(generateInvoiceNumber("SD"))
  
  const [invoiceDate, setInvoiceDate] = useState(getTodayDate())
  const [dueDate, setDueDate] = useState("")
  const [placeOfSupply, setPlaceOfSupply] = useState("Bihar")
  const [currency, setCurrency] = useState("INR (₹)")

  const [client, setClient] = useState<Client>({
    name: "",
    company: "",
    address: "",
    gstin: "",
    email: "",
  })

  const [services, setServices] = useState<Service[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      amount: 0,
    },
  ])

  const [poRef, setPoRef] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("")
  const [notes, setNotes] = useState("")

  // Calculate totals
  const subtotal = useMemo(() => calculateSubtotal(services), [services])
  const totalDiscount = useMemo(() => calculateTotalDiscount(services), [services])
  const grandTotal = useMemo(
    () => calculateGrandTotal(subtotal, totalDiscount),
    [subtotal, totalDiscount]
  )

  // Handle invoice number change
  const handleInvoiceNumberChange = useCallback((value: string) => {
    setInvoiceNumber(value)
    // Check if the value matches the auto-generated format
    const expectedFormat = `STS/${businessUnit}/${new Date().getFullYear()}/`
    if (!value.startsWith(expectedFormat)) {
      setIsInvoiceNumberManual(true)
    } else {
      // If it matches the format, it might be auto-generated or manually matching
      // We'll keep the manual flag as is to be safe
    }
  }, [businessUnit])

  // Update business unit
  const handleBusinessUnitChange = useCallback((newBusinessUnit: BusinessUnit) => {
    setBusinessUnit(newBusinessUnit)
    // Auto-regenerate invoice number if it wasn't manually edited
    if (!isInvoiceNumberManual) {
      const newInvoiceNumber = generateInvoiceNumber(newBusinessUnit)
      setInvoiceNumber(newInvoiceNumber)
      invoiceNumberRef.current = newInvoiceNumber
    }
  }, [isInvoiceNumberManual])

  // Update client fields
  const updateClient = useCallback((field: keyof Client, value: string) => {
    setClient((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Add new service
  const addService = useCallback(() => {
    setServices((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ])
  }, [])

  // Remove service
  const removeService = useCallback((id: string) => {
    setServices((prev) => {
      if (prev.length <= 1) return prev // Keep at least one service
      return prev.filter((s) => s.id !== id)
    })
  }, [])

  // Update service field
  const updateService = useCallback(
    (id: string, field: keyof Service, value: string | number) => {
      setServices((prev) =>
        prev.map((service) => {
          if (service.id !== id) return service

          const updated = { ...service, [field]: value }
          return recalculateService(updated)
        })
      )
    },
    []
  )

  // Get current invoice object
  const getInvoice = useCallback((): Invoice => {
    return {
      invoiceNumber,
      businessUnit,
      invoiceDate,
      dueDate: dueDate || undefined,
      placeOfSupply,
      currency,
      client,
      services,
      poRef: poRef || undefined,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
      subtotal,
      totalDiscount,
      grandTotal,
    }
  }, [
    invoiceNumber,
    businessUnit,
    invoiceDate,
    dueDate,
    placeOfSupply,
    currency,
    client,
    services,
    poRef,
    paymentTerms,
    notes,
    subtotal,
    totalDiscount,
    grandTotal,
  ])

  // Reset invoice
  const resetInvoice = useCallback(() => {
    setBusinessUnit("SD")
    setInvoiceNumber(generateInvoiceNumber("SD"))
    setIsInvoiceNumberManual(false)
    invoiceNumberRef.current = generateInvoiceNumber("SD")
    setInvoiceDate(getTodayDate())
    setDueDate("")
    setPlaceOfSupply("Bihar")
    setCurrency("INR (₹)")
    setClient({
      name: "",
      company: "",
      address: "",
      gstin: "",
      email: "",
    })
    setServices([
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ])
    setPoRef("")
    setPaymentTerms("")
    setNotes("")
  }, [])

  return {
    // Invoice meta
    businessUnit,
    setBusinessUnit: handleBusinessUnitChange,
    invoiceNumber,
    setInvoiceNumber: handleInvoiceNumberChange,
    invoiceDate,
    setInvoiceDate,
    dueDate,
    setDueDate,
    placeOfSupply,
    setPlaceOfSupply,
    currency,
    setCurrency,

    // Client
    client,
    updateClient,

    // Services
    services,
    addService,
    removeService,
    updateService,

    // Additional fields
    poRef,
    setPoRef,
    paymentTerms,
    setPaymentTerms,
    notes,
    setNotes,

    // Calculated values
    subtotal,
    totalDiscount,
    grandTotal,

    // Actions
    getInvoice,
    resetInvoice,
  }
}

export { BUSINESS_UNITS }

