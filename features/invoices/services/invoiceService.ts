import { invoiceApi, type InvoiceFilters, type InvoiceResponse, type InvoiceStats } from "@/lib/api/invoices";
import type { Invoice, BusinessUnit } from "../types/invoice";

export const invoiceService = {
  /**
   * Get next available invoice number for a business unit
   */
  async getNextInvoiceNumber(businessUnit: BusinessUnit): Promise<string> {
    try {
      return await invoiceApi.getNextInvoiceNumber(businessUnit);
    } catch (error: any) {
      if (error.isLocalDevError) {
        // In local dev, return a mock number
        const year = new Date().getFullYear();
        return `STS/${businessUnit}/${year}/1611`;
      }
      throw error;
    }
  },

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: Invoice): Promise<InvoiceResponse> {
    try {
      return await invoiceApi.createInvoice(invoice);
    } catch (error: any) {
      if (error.isLocalDevError) {
        // In local dev, return a mock response
        return {
          id: crypto.randomUUID(),
          documentType: "INVOICE",
          documentNumber: invoice.invoiceNumber,
          businessUnit: invoice.businessUnit,
          invoiceDate: new Date().toISOString(),
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString() : undefined,
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
          status: "DRAFT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  /**
   * Get all invoices with optional filters
   */
  async getInvoices(filters?: InvoiceFilters): Promise<InvoiceResponse[]> {
    try {
      return await invoiceApi.getInvoices(filters);
    } catch (error: any) {
      if (error.isLocalDevError) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: string): Promise<InvoiceResponse> {
    try {
      return await invoiceApi.getInvoice(id);
    } catch (error: any) {
      if (error.isLocalDevError) {
        throw new Error("Invoice not found");
      }
      throw error;
    }
  },

  /**
   * Update an invoice
   */
  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<InvoiceResponse> {
    try {
      return await invoiceApi.updateInvoice(id, invoice);
    } catch (error: any) {
      if (error.isLocalDevError) {
        throw new Error("Failed to update invoice");
      }
      throw error;
    }
  },

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: string): Promise<void> {
    try {
      await invoiceApi.deleteInvoice(id);
    } catch (error: any) {
      if (error.isLocalDevError) {
        // Silently fail in local dev
        return;
      }
      throw error;
    }
  },

  /**
   * Get invoice statistics
   */
  async getStats(): Promise<InvoiceStats> {
    try {
      return await invoiceApi.getStats();
    } catch (error: any) {
      if (error.isLocalDevError) {
        // Return empty stats in local dev
        return {
          totalDocuments: 0,
          totalAmount: 0,
          byDocumentType: [],
          byBusinessUnit: [],
          byStatus: [],
          recentDocuments: [],
        };
      }
      throw error;
    }
  },
};

