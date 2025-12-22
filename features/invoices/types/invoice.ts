export interface Client {
  name: string
  company?: string
  address?: string
  gstin?: string
  email?: string
}

export interface Service {
  id: string
  description: string
  quantity: number
  rate: number
  discount: number // percentage (0-100)
  amount: number // calculated: (quantity × rate) × (1 - discount/100)
}

export interface Invoice {
  invoiceNumber: string
  invoiceDate: string // DD/MM/YYYY format
  dueDate?: string // DD/MM/YYYY format
  placeOfSupply: string // default: "Bihar"
  currency: string // default: "INR (₹)"
  client: Client
  services: Service[]
  poRef?: string
  paymentTerms?: string
  notes?: string
  subtotal: number
  totalDiscount: number
  grandTotal: number
}

