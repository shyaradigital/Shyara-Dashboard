import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum ExpenseCategory {
  Salaries = "Salaries",
  Subscriptions = "Subscriptions",
  Rent = "Rent",
  Software = "Software",
  Hardware = "Hardware",
  Travel = "Travel",
  Utilities = "Utilities",
  Misc = "Misc",
}

export class CreateExpenseDto {
  @ApiProperty({ example: 1000.0 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: "Salaries", enum: ExpenseCategory })
  @IsNotEmpty()
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: "Employee salary" })
  @IsNotEmpty()
  @IsString()
  purpose: string;

  @ApiProperty({ example: "Monthly salary payment", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-01-15T00:00:00.000Z" })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}

