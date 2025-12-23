import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export enum BusinessUnit {
  SD = "SD",
  SM = "SM",
  BX = "BX",
}

export class ClientDto {
  @ApiProperty({ example: "John Doe" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: "Acme Corp", required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ example: "123 Main St, City, State", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "29ABCDE1234F1Z5", required: false })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty({ example: "john@example.com", required: false })
  @IsOptional()
  @IsString()
  email?: string;
}

export class ServiceDto {
  @ApiProperty({ example: "uuid-here" })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: "Web Development Service" })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rate: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discount: number; // percentage (0-100)

  @ApiProperty({ example: 9000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: "STS/SD/2025/1611" })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ example: "SD", enum: BusinessUnit })
  @IsNotEmpty()
  @IsEnum(BusinessUnit)
  businessUnit: BusinessUnit;

  @ApiProperty({ example: "2025-01-15T00:00:00.000Z" })
  @IsNotEmpty()
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: "2025-02-15T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: "Bihar", required: false })
  @IsOptional()
  @IsString()
  placeOfSupply?: string;

  @ApiProperty({ example: "INR (₹)", required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ type: ClientDto })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @ApiProperty({ type: [ServiceDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  services: ServiceDto[];

  @ApiProperty({ example: "PO-12345", required: false })
  @IsOptional()
  @IsString()
  poRef?: string;

  @ApiProperty({ example: "Net 30", required: false })
  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @ApiProperty({ example: "Thank you for your business", required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ example: 1000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalDiscount: number;

  @ApiProperty({ example: 9000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  grandTotal: number;

  @ApiProperty({ example: "DRAFT", enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"], required: false })
  @IsOptional()
  @IsEnum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"])
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
}

