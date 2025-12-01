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
}

