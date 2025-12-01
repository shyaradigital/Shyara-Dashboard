import { IsOptional, IsNumber, IsString, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ExpenseCategory } from "./create-expense.dto";

export class UpdateExpenseDto {
  @ApiProperty({ example: 1000.0, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: "Salaries", enum: ExpenseCategory, required: false })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiProperty({ example: "Employee salary", required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ example: "Monthly salary payment", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-01-15T00:00:00.000Z", required: false })
  @IsOptional()
  @IsDateString()
  date?: string;
}

