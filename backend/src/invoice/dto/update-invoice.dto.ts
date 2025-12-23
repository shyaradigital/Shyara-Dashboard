import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { BusinessUnit, ClientDto, ServiceDto } from "./create-invoice.dto";

export class UpdateInvoiceDto {
  @ApiProperty({ example: "STS/SD/2025/1611", required: false })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiProperty({ example: "SD", enum: BusinessUnit, required: false })
  @IsOptional()
  @IsEnum(BusinessUnit)
  businessUnit?: BusinessUnit;

  @ApiProperty({ example: "2025-01-15T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

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

  @ApiProperty({ type: ClientDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ClientDto)
  client?: ClientDto;

  @ApiProperty({ type: [ServiceDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  services?: ServiceDto[];

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

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subtotal?: number;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscount?: number;

  @ApiProperty({ example: 9000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grandTotal?: number;

  @ApiProperty({ example: "SENT", enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"], required: false })
  @IsOptional()
  @IsEnum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"])
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
}

