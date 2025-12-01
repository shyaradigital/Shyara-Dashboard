import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum IncomeCategory {
  SMM = "SMM",
  Website = "Website",
  Ads = "Ads",
  POS = "POS",
  Consultation = "Consultation",
  Freelancing = "Freelancing",
  Other = "Other",
}

export class CreateIncomeDto {
  @ApiProperty({ example: 5000.0 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: "SMM", enum: IncomeCategory })
  @IsNotEmpty()
  @IsEnum(IncomeCategory)
  category: IncomeCategory;

  @ApiProperty({ example: "Client ABC" })
  @IsNotEmpty()
  @IsString()
  source: string;

  @ApiProperty({ example: "Monthly retainer", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "2024-01-15T00:00:00.000Z" })
  @IsNotEmpty()
  @IsDateString()
  date: string;
}

