"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import type { Invoice, Client, Service, BusinessUnit } from "../types/invoice"
import {
  calculateSubtotal,
  calculateTotalDiscount,
  calculateGrandTotal,
  recalculateService,
} from "../utils/calculations"
import { getTodayDate } from "../utils/formatters"
import { invoiceService } from "../services/invoiceService"

const BUSINESS_UNITS = [
  { code: "SD" as BusinessUnit, name: "Shyara Digital" },
  { code: "SM" as BusinessUnit, name: "Shyara Marketing" },
  { code: "BX" as BusinessUnit, name: "BiteX" },
] as const

// Fallback function for local dev or when API is unavailable
const generateInvoiceNumber = (businessUnit: BusinessUnit = "SD"): string => {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `STS/${businessUnit}/${year}/${random}`
}

export function useInvoice() {
  const [businessUnit, setBusinessUnit] = useState<BusinessUnit>("SD")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [isInvoiceNumberManual, setIsInvoiceNumberManual] = useState(false)
  const [isLoadingInvoiceNumber, setIsLoadingInvoiceNumber] = useState(false)
  const invoiceNumberRef = useRef<string>("")
  
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

  // Fetch next invoice number from backend
  const fetchNextInvoiceNumber = useCallback(async (unit: BusinessUnit) => {
    try {
      setIsLoadingInvoiceNumber(true)
      const nextNumber = await invoiceService.getNextInvoiceNumber(unit)
      setInvoiceNumber(nextNumber)
      invoiceNumberRef.current = nextNumber
    } catch (error) {
      // Fallback to local generation if API fails
      const fallbackNumber = generateInvoiceNumber(unit)
      setInvoiceNumber(fallbackNumber)
      invoiceNumberRef.current = fallbackNumber
    } finally {
      setIsLoadingInvoiceNumber(false)
    }
  }, [])

  // Fetch invoice number on mount
  useEffect(() => {
    fetchNextInvoiceNumber(businessUnit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount

  // Update business unit
  const handleBusinessUnitChange = useCallback((newBusinessUnit: BusinessUnit) => {
    setBusinessUnit(newBusinessUnit)
    // Auto-regenerate invoice number if it wasn't manually edited
    if (!isInvoiceNumberManual) {
      fetchNextInvoiceNumber(newBusinessUnit)
    }
  }, [isInvoiceNumberManual, fetchNextInvoiceNumber])

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
    setIsInvoiceNumberManual(false)
    fetchNextInvoiceNumber("SD")
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
    isLoadingInvoiceNumber,
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

