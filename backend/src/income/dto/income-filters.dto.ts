import { IsOptional, IsString, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IncomeCategory } from "./create-income.dto";

export class IncomeFiltersDto {
  @ApiProperty({ required: false, enum: IncomeCategory })
  @IsOptional()
  @IsEnum(IncomeCategory)
  category?: IncomeCategory;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

