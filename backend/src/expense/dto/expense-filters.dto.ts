import { IsOptional, IsString, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ExpenseCategory } from "./create-expense.dto";

export class ExpenseFiltersDto {
  @ApiProperty({ required: false, enum: ExpenseCategory })
  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

