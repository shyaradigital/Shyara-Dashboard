import { apiClient } from "./client";
import type { Invoice, BusinessUnit } from "@/features/invoices/types/invoice";

export interface InvoiceFilters {
  businessUnit?: BusinessUnit;
  startDate?: string;
  endDate?: string;
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  search?: string;
}

export interface InvoiceResponse {
  id: string;
  documentType: "INVOICE" | "QUOTATION";
  documentNumber: string;
  businessUnit: string;
  invoiceDate: string;
  dueDate?: string;
  placeOfSupply?: string;
  currency: string;
  client: Record<string, unknown>;
  services: Array<Record<string, unknown>>;
  poRef?: string;
  paymentTerms?: string;
  notes?: string;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface DocumentTypeStats {
  documentType: string;
  count: number;
  totalAmount: number;
}

export interface BusinessUnitStats {
  businessUnit: string;
  count: number;
  totalAmount: number;
}

export interface StatusStats {
  status: string;
  count: number;
}

export interface InvoiceStats {
  totalDocuments: number;
  totalAmount: number;
  byDocumentType: DocumentTypeStats[];
  byBusinessUnit: BusinessUnitStats[];
  byStatus: StatusStats[];
  recentDocuments: InvoiceResponse[];
}

export const invoiceApi = {
  /**
   * Get next available invoice number for a business unit
   */
  async getNextInvoiceNumber(businessUnit: BusinessUnit): Promise<string> {
    const response = await apiClient.get<string>(`/invoices/next-number/${businessUnit}`);
    return response.data;
  },

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: Invoice): Promise<InvoiceResponse> {
    // Convert invoice to API format
    const payload = {
      invoiceNumber: invoice.invoiceNumber,
      businessUnit: invoice.businessUnit,
      invoiceDate: convertDateToISO(invoice.invoiceDate),
      dueDate: invoice.dueDate ? convertDateToISO(invoice.dueDate) : undefined,
      placeOfSupply: invoice.placeOfSupply,
      currency: invoice.currency,
      client: invoice.client as unknown as Record<string, unknown>,
      services: invoice.services as unknown as Array<Record<string, unknown>>,
      poRef: invoice.poRef,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes,
      subtotal: invoice.subtotal,
      totalDiscount: invoice.totalDiscount,
      grandTotal: invoice.grandTotal,
      status: "DRAFT" as const,
    };

    const response = await apiClient.post<InvoiceResponse>("/invoices", payload);
    return response.data;
  },

  /**
   * Get all invoices with optional filters
   */
  async getInvoices(filters?: InvoiceFilters): Promise<InvoiceResponse[]> {
    const params = new URLSearchParams();
    if (filters?.businessUnit) params.append("businessUnit", filters.businessUnit);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);

    const response = await apiClient.get<InvoiceResponse[]>(`/invoices?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<InvoiceResponse> {
    const response = await apiClient.get<InvoiceResponse>(`/invoices/${id}`);
    return response.data;
  },

  /**
   * Update an invoice
   */
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<InvoiceResponse> {
    const payload: Record<string, unknown> = {};
    if (invoice.invoiceNumber !== undefined) payload.invoiceNumber = invoice.invoiceNumber;
    if (invoice.businessUnit !== undefined) payload.businessUnit = invoice.businessUnit;
    if (invoice.invoiceDate !== undefined) payload.invoiceDate = convertDateToISO(invoice.invoiceDate);
    if (invoice.dueDate !== undefined) payload.dueDate = invoice.dueDate ? convertDateToISO(invoice.dueDate) : null;
    if (invoice.placeOfSupply !== undefined) payload.placeOfSupply = invoice.placeOfSupply;
    if (invoice.currency !== undefined) payload.currency = invoice.currency;
    if (invoice.client !== undefined) payload.client = invoice.client;
    if (invoice.services !== undefined) payload.services = invoice.services;
    if (invoice.poRef !== undefined) payload.poRef = invoice.poRef;
    if (invoice.paymentTerms !== undefined) payload.paymentTerms = invoice.paymentTerms;
    if (invoice.notes !== undefined) payload.notes = invoice.notes;
    if (invoice.subtotal !== undefined) payload.subtotal = invoice.subtotal;
    if (invoice.totalDiscount !== undefined) payload.totalDiscount = invoice.totalDiscount;
    if (invoice.grandTotal !== undefined) payload.grandTotal = invoice.grandTotal;

    const response = await apiClient.patch<InvoiceResponse>(`/invoices/${id}`, payload);
    return response.data;
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  /**
   * Get invoice statistics
   */
  async getStats(): Promise<InvoiceStats> {
    const response = await apiClient.get<InvoiceStats>("/invoices/stats");
    return response.data;
  },
};

/**
 * Convert DD/MM/YYYY to ISO date string
 */
function convertDateToISO(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  
  // If already in ISO format, return as is
  if (dateStr.includes("T") || dateStr.includes("-")) {
    return new Date(dateStr).toISOString();
  }

  // Parse DD/MM/YYYY format
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day).toISOString();
  }

  return new Date(dateStr).toISOString();
}

