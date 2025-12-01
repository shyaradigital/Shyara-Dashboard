import { IsOptional, IsNumber, IsString, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IncomeCategory } from "./create-income.dto";

export class UpdateIncomeDto {
  @ApiProperty({ example: 5000.0, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: "SMM", enum: IncomeCategory, required: false })
  @IsOptional()
  @IsEnum(IncomeCategory)
  category?: IncomeCategory;

  @ApiProperty({ example: "Client ABC", required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ example: "Monthly retainer", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-01-15T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  // Advance payment and dues fields
  @ApiProperty({ example: 10000.0, required: false, description: "Total project/transaction amount" })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 5000.0, required: false, description: "Amount paid as advance" })
  @IsOptional()
  @IsNumber()
  advanceAmount?: number;

  @ApiProperty({ example: 5000.0, required: false, description: "Remaining amount due" })
  @IsOptional()
  @IsNumber()
  dueAmount?: number;

  @ApiProperty({ example: "2024-02-15T00:00:00.000Z", required: false, description: "Expected payment date for dues" })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: false, required: false, description: "Whether the due has been paid" })
  @IsOptional()
  isDuePaid?: boolean;

  @ApiProperty({ example: "2024-02-15T00:00:00.000Z", required: false, description: "Date when due was paid" })
  @IsOptional()
  @IsDateString()
  duePaidDate?: string;
}

