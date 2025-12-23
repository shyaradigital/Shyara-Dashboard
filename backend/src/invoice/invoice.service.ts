import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { InvoiceFiltersDto } from "./dto/invoice-filters.dto";
import { InvoiceStatsDto, DocumentTypeStatsDto, BusinessUnitStatsDto, StatusStatsDto } from "./dto/invoice-stats.dto";

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get the next invoice number for a business unit
   * Starts from 1611 for each business unit
   * Format: STS/{businessUnit}/{year}/{number}
   */
  async getNextInvoiceNumber(businessUnit: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `STS/${businessUnit}/${year}/`;

    // Find the highest invoice number for this business unit and year
    const lastInvoice = await this.prisma.document.findFirst({
      where: {
        documentType: "INVOICE",
        businessUnit,
        documentNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        documentNumber: "desc",
      },
    });

    let nextNumber = 1611; // Start from 1611

    if (lastInvoice) {
      // Extract the number from the last invoice (e.g., "STS/SD/2025/1611" -> 1611)
      const parts = lastInvoice.documentNumber.split("/");
      const lastNumberStr = parts[parts.length - 1];
      const lastNumber = parseInt(lastNumberStr, 10);
      if (!isNaN(lastNumber) && lastNumber >= 1611) {
        nextNumber = lastNumber + 1;
      }
    }

    // Return the number as-is (no padding needed since we start from 1611)
    // Numbers will be: 1611, 1612, 1613, ..., 9999, 10000, etc.
    return `${prefix}${nextNumber}`;
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId?: string) {
    // Check if invoice number already exists for this business unit
    const existing = await this.prisma.document.findUnique({
      where: {
        documentType_businessUnit_documentNumber: {
          documentType: "INVOICE",
          businessUnit: createInvoiceDto.businessUnit,
          documentNumber: createInvoiceDto.invoiceNumber,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Invoice number ${createInvoiceDto.invoiceNumber} already exists for business unit ${createInvoiceDto.businessUnit}`
      );
    }

    const data: any = {
      documentType: "INVOICE",
      documentNumber: createInvoiceDto.invoiceNumber,
      businessUnit: createInvoiceDto.businessUnit,
      invoiceDate: new Date(createInvoiceDto.invoiceDate),
      dueDate: createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : null,
      placeOfSupply: createInvoiceDto.placeOfSupply || null,
      currency: createInvoiceDto.currency || "INR (₹)",
      client: createInvoiceDto.client,
      services: createInvoiceDto.services,
      poRef: createInvoiceDto.poRef || null,
      paymentTerms: createInvoiceDto.paymentTerms || null,
      notes: createInvoiceDto.notes || null,
      subtotal: createInvoiceDto.subtotal,
      totalDiscount: createInvoiceDto.totalDiscount,
      grandTotal: createInvoiceDto.grandTotal,
      status: createInvoiceDto.status || "DRAFT",
      userId: userId || null,
    };

    const invoice = await this.prisma.document.create({
      data,
    });

    return invoice;
  }

  async findAll(filters?: InvoiceFiltersDto) {
    const where: any = {
      documentType: "INVOICE",
    };

    if (filters?.businessUnit) {
      where.businessUnit = filters.businessUnit;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.invoiceDate = {};
      if (filters.startDate) {
        where.invoiceDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.invoiceDate.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      where.OR = [
        { documentNumber: { contains: filters.search, mode: "insensitive" } },
        // Note: JSON search in Prisma PostgreSQL requires raw queries for complex searches
        // For now, we'll search only in documentNumber. Client name search can be added with raw queries if needed.
      ];
    }

    const invoices = await this.prisma.document.findMany({
      where,
      orderBy: { invoiceDate: "desc" },
    });

    return invoices;
  }

  async findOne(id: string) {
    const invoice = await this.prisma.document.findFirst({
      where: {
        id,
        documentType: "INVOICE",
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    // If invoice number is being updated, check for conflicts
    if (updateInvoiceDto.invoiceNumber && updateInvoiceDto.invoiceNumber !== invoice.documentNumber) {
      const existing = await this.prisma.document.findUnique({
        where: {
          documentType_businessUnit_documentNumber: {
            documentType: "INVOICE",
            businessUnit: updateInvoiceDto.businessUnit || invoice.businessUnit,
            documentNumber: updateInvoiceDto.invoiceNumber,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Invoice number ${updateInvoiceDto.invoiceNumber} already exists for this business unit`
        );
      }
    }

    const data: any = {};

    if (updateInvoiceDto.invoiceNumber !== undefined) {
      data.documentNumber = updateInvoiceDto.invoiceNumber;
    }
    if (updateInvoiceDto.businessUnit !== undefined) {
      data.businessUnit = updateInvoiceDto.businessUnit;
    }
    if (updateInvoiceDto.invoiceDate !== undefined) {
      data.invoiceDate = new Date(updateInvoiceDto.invoiceDate);
    }
    if (updateInvoiceDto.dueDate !== undefined) {
      data.dueDate = updateInvoiceDto.dueDate ? new Date(updateInvoiceDto.dueDate) : null;
    }
    if (updateInvoiceDto.placeOfSupply !== undefined) {
      data.placeOfSupply = updateInvoiceDto.placeOfSupply;
    }
    if (updateInvoiceDto.currency !== undefined) {
      data.currency = updateInvoiceDto.currency;
    }
    if (updateInvoiceDto.client !== undefined) {
      data.client = updateInvoiceDto.client;
    }
    if (updateInvoiceDto.services !== undefined) {
      data.services = updateInvoiceDto.services;
    }
    if (updateInvoiceDto.poRef !== undefined) {
      data.poRef = updateInvoiceDto.poRef;
    }
    if (updateInvoiceDto.paymentTerms !== undefined) {
      data.paymentTerms = updateInvoiceDto.paymentTerms;
    }
    if (updateInvoiceDto.notes !== undefined) {
      data.notes = updateInvoiceDto.notes;
    }
    if (updateInvoiceDto.subtotal !== undefined) {
      data.subtotal = updateInvoiceDto.subtotal;
    }
    if (updateInvoiceDto.totalDiscount !== undefined) {
      data.totalDiscount = updateInvoiceDto.totalDiscount;
    }
    if (updateInvoiceDto.grandTotal !== undefined) {
      data.grandTotal = updateInvoiceDto.grandTotal;
    }
    if (updateInvoiceDto.status !== undefined) {
      data.status = updateInvoiceDto.status;
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data,
    });

    return updated;
  }

  async remove(id: string) {
    const invoice = await this.findOne(id);
    await this.prisma.document.delete({
      where: { id },
    });
    return invoice;
  }

  async getStats(): Promise<InvoiceStatsDto> {
    const [totalDocuments, totalAmountResult, byDocumentType, byBusinessUnit, byStatus, recentDocuments] =
      await Promise.all([
        // Total count
        this.prisma.document.count({
          where: { documentType: "INVOICE" },
        }),

        // Total amount
        this.prisma.document.aggregate({
          where: { documentType: "INVOICE" },
          _sum: { grandTotal: true },
        }),

        // By document type
        this.prisma.document.groupBy({
          by: ["documentType"],
          where: { documentType: "INVOICE" },
          _count: { id: true },
          _sum: { grandTotal: true },
        }),

        // By business unit
        this.prisma.document.groupBy({
          by: ["businessUnit"],
          where: { documentType: "INVOICE" },
          _count: { id: true },
          _sum: { grandTotal: true },
        }),

        // By status
        this.prisma.document.groupBy({
          by: ["status"],
          where: { documentType: "INVOICE" },
          _count: { id: true },
        }),

        // Recent documents
        this.prisma.document.findMany({
          where: { documentType: "INVOICE" },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    const stats: InvoiceStatsDto = {
      totalDocuments,
      totalAmount: totalAmountResult._sum.grandTotal || 0,
      byDocumentType: byDocumentType.map(
        (item): DocumentTypeStatsDto => ({
          documentType: item.documentType,
          count: item._count.id,
          totalAmount: item._sum.grandTotal || 0,
        })
      ),
      byBusinessUnit: byBusinessUnit.map(
        (item): BusinessUnitStatsDto => ({
          businessUnit: item.businessUnit,
          count: item._count.id,
          totalAmount: item._sum.grandTotal || 0,
        })
      ),
      byStatus: byStatus.map(
        (item): StatusStatsDto => ({
          status: item.status,
          count: item._count.id,
        })
      ),
      recentDocuments,
    };

    return stats;
  }
}

