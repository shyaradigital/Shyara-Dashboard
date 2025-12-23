import { ApiProperty } from "@nestjs/swagger";

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ["INVOICE", "QUOTATION"] })
  documentType: "INVOICE" | "QUOTATION";

  @ApiProperty()
  documentNumber: string;

  @ApiProperty()
  businessUnit: string;

  @ApiProperty()
  invoiceDate: Date;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  placeOfSupply?: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  client: any; // JSON object

  @ApiProperty()
  services: any[]; // JSON array

  @ApiProperty({ required: false })
  poRef?: string;

  @ApiProperty({ required: false })
  paymentTerms?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  totalDiscount: number;

  @ApiProperty()
  grandTotal: number;

  @ApiProperty({ enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"] })
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  userId?: string;
}

