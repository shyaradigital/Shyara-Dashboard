import { ApiProperty } from "@nestjs/swagger";

export class DocumentTypeStatsDto {
  @ApiProperty()
  documentType: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalAmount: number;
}

export class BusinessUnitStatsDto {
  @ApiProperty()
  businessUnit: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalAmount: number;
}

export class StatusStatsDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;
}

export class InvoiceStatsDto {
  @ApiProperty()
  totalDocuments: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty({ type: [DocumentTypeStatsDto] })
  byDocumentType: DocumentTypeStatsDto[];

  @ApiProperty({ type: [BusinessUnitStatsDto] })
  byBusinessUnit: BusinessUnitStatsDto[];

  @ApiProperty({ type: [StatusStatsDto] })
  byStatus: StatusStatsDto[];

  @ApiProperty()
  recentDocuments: any[]; // Array of InvoiceResponseDto
}

