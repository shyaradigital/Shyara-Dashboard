import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BusinessUnit } from "./create-invoice.dto";

export class InvoiceFiltersDto {
  @ApiProperty({ example: "SD", enum: BusinessUnit, required: false })
  @IsOptional()
  @IsEnum(BusinessUnit)
  businessUnit?: BusinessUnit;

  @ApiProperty({ example: "2025-01-01T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: "2025-12-31T23:59:59.999Z", required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: "DRAFT", enum: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"], required: false })
  @IsOptional()
  @IsEnum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"])
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

  @ApiProperty({ example: "John Doe", required: false })
  @IsOptional()
  @IsString()
  search?: string; // Search in client name, invoice number, etc.
}

